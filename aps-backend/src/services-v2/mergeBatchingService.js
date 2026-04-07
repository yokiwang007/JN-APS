/**
 * 揉单合并服务 (阶段4)
 * 负责按材质、花色、厚度等属性重新组合为批次
 */

const { ApsScheduleTask, ApsMergeBatch, ApsBatchDetail, CadBomPart, ApsProductionOrder } = require('../models-v2');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class MergeBatchingService {
  /**
   * 执行揉单合并
   * @param {Object} params - 合并参数
   * @returns {Object} 合并结果
   */
  async mergeBatches(params) {
    try {
      logger.info('Starting merge batching:', params);

      const { lineId, productionDate, mergeRule = '板材利用率优先', timeWindowDays = 1 } = params;

      // 查询可合并的排程任务
      const scheduleTasks = await ApsScheduleTask.findAll({
        where: {
          schedule_status: '已排定',
          line_id: lineId,
          deleted_at: null
        },
        include: [
          {
            model: ApsProductionOrder,
            as: 'productionOrder',
            where: { status: '已排程', deleted_at: null }
          }
        ]
      });

      if (scheduleTasks.length === 0) {
        logger.info('No schedule tasks to merge');
        return { message: '没有可合并的排程任务' };
      }

      // 按属性分组
      const groups = this.groupByAttributes(scheduleTasks, productionDate, timeWindowDays);

      // 为每个分组创建批次
      const batches = [];
      for (const group of groups) {
        const batch = await this.createBatch(group, mergeRule);
        batches.push(batch);
      }

      logger.info(`Merge batching completed: ${batches.length} batches created`);

      return {
        total: batches.length,
        batches: batches
      };
    } catch (error) {
      logger.error('Merge batching error:', error);
      throw error;
    }
  }

  /**
   * 按属性分组
   * @param {Array} scheduleTasks - 排程任务列表
   * @param {string} productionDate - 生产日期
   * @param {number} timeWindowDays - 时间窗天数
   * @returns {Array} 分组列表
   */
  groupByAttributes(scheduleTasks, productionDate, timeWindowDays) {
    const groups = [];

    for (const task of scheduleTasks) {
      const po = task.productionOrder;
      const groupKey = `${po.material}_${po.thickness}_${po.color}`;

      // 检查时间窗
      const taskDate = new Date(task.planned_start_date);
      const targetDate = productionDate ? new Date(productionDate) : taskDate;
      const dayDiff = Math.abs((taskDate - targetDate) / (1000 * 60 * 60 * 24));

      if (dayDiff > timeWindowDays) {
        logger.warn(`Task ${task.task_id} outside time window: ${dayDiff} days`);
        continue;
      }

      // 查找是否已有相同属性的分组
      let group = groups.find(g =>
        g.key === groupKey &&
        g.lineId === task.line_id &&
        Math.abs(new Date(g.productionDate) - targetDate) / (1000 * 60 * 60 * 24) <= timeWindowDays
      );

      if (!group) {
        group = {
          key: groupKey,
          lineId: task.line_id,
          productionDate: this.formatDate(targetDate),
          material: po.material,
          thickness: po.thickness,
          color: po.color,
          tasks: []
        };
        groups.push(group);
      }

      group.tasks.push(task);
    }

    return groups;
  }

  /**
   * 创建批次
   * @param {Object} group - 分组对象
   * @param {string} mergeRule - 合并规则
   * @returns {Object} 批次信息
   */
  async createBatch(group, mergeRule) {
    try {
      const batchId = this.generateBatchId(group.lineId, group.productionDate);

      // 使用事务创建批次
      const result = await ApsMergeBatch.sequelize.transaction(async (t) => {
        // 计算总部件数
        let totalPartCount = 0;
        for (const task of group.tasks) {
          totalPartCount += task.productionOrder.total_part_count;
        }

        // 创建批次主表
        const batch = await ApsMergeBatch.create({
          batch_id: batchId,
          line_id: group.lineId,
          production_date: group.productionDate,
          material: group.material,
          thickness: group.thickness,
          color: group.color,
          total_part_count: totalPartCount,
          merge_rule: mergeRule,
          optimize_status: '待优化',
          status: '待排程'
        }, { transaction: t });

        // 创建批次明细
        const detailIds = [];
        for (const task of group.tasks) {
          const po = task.productionOrder;

          // 查询该生产子订单的所有零件
          const parts = await CadBomPart.findAll({
            where: {
              order_id: po.order_id,
              material: group.material,
              thickness: group.thickness,
              color: group.color,
              deleted_at: null
            }
          });

          // 为每个零件创建批次明细
          for (const part of parts) {
            const detail = await ApsBatchDetail.create({
              batch_id: batchId,
              production_order_id: po.production_order_id,
              part_id: part.part_id
            }, { transaction: t });

            detailIds.push(detail.id);
          }

          // 更新排程任务状态
          await task.update({ schedule_status: '已揉单' }, { transaction: t });

          // 更新生产子订单状态
          await po.update({ status: '已合并' }, { transaction: t });
        }

        return {
          batchId: batch.batch_id,
          lineId: batch.line_id,
          productionDate: batch.production_date,
          material: batch.material,
          thickness: batch.thickness,
          color: batch.color,
          totalPartCount: batch.total_part_count,
          mergeRule: batch.merge_rule,
          optimizeStatus: batch.optimize_status,
          status: batch.status,
          taskCount: group.tasks.length,
          detailCount: detailIds.length
        };
      });

      logger.info(`Batch created successfully: ${result.batchId}`);

      return result;
    } catch (error) {
      logger.error('Create batch error:', error);
      throw error;
    }
  }

  /**
   * 生成批次号
   * @param {string} lineId - 产线ID
   * @param {string} productionDate - 生产日期
   * @returns {string} 批次号
   */
  generateBatchId(lineId, productionDate) {
    const date = productionDate.replace(/-/g, '');
    const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `B${date}-${lineId}-${sequence}`;
  }

  /**
   * 查询生产批次列表
   * @param {Object} params - 查询参数
   * @returns {Object} 批次列表
   */
  async getMergeBatches({ status, lineId, startDate, endDate, page = 1, pageSize = 20 }) {
    try {
      logger.info('Fetching merge batches with params:', { status, lineId, startDate, endDate, page, pageSize });

      const where = { deleted_at: null };

      if (status) {
        where.status = status;
      }
      if (lineId) {
        where.line_id = lineId;
      }
      if (startDate) {
        where.production_date = { ...where.production_date, [Op.gte]: startDate };
      }
      if (endDate) {
        where.production_date = { ...where.production_date, [Op.lte]: endDate };
      }

      const currentPage = Math.max(1, parseInt(page));
      const currentPageSize = Math.max(1, parseInt(pageSize));
      const offset = (currentPage - 1) * currentPageSize;

      const { count, rows } = await ApsMergeBatch.findAndCountAll({
        where,
        limit: currentPageSize,
        offset,
        order: [['production_date', 'ASC']],
        include: [
          {
            model: ApsBatchDetail,
            as: 'details',
            required: false
          }
        ]
      });

      const batches = rows.map(batch => this.formatMergeBatch(batch));

      logger.info(`Found ${count} merge batches`);

      return {
        total: count,
        list: batches,
        page: currentPage,
        pageSize: currentPageSize
      };
    } catch (error) {
      logger.error('Get merge batches error:', error);
      throw error;
    }
  }

  /**
   * 查询批次详情
   * @param {string} batchId - 批次号
   * @returns {Object} 批次详情
   */
  async getMergeBatchDetail(batchId) {
    try {
      logger.info(`Fetching merge batch detail: ${batchId}`);

      const batch = await ApsMergeBatch.findOne({
        where: {
          batch_id: batchId,
          deleted_at: null
        },
        include: [
          {
            model: ApsBatchDetail,
            as: 'details',
            include: [
              {
                model: ApsProductionOrder,
                as: 'productionOrder'
              },
              {
                model: CadBomPart,
                as: 'part'
              }
            ]
          }
        ]
      });

      if (!batch) {
        logger.warn(`Merge batch not found: ${batchId}`);
        throw new Error('批次不存在');
      }

      const formattedBatch = this.formatMergeBatch(batch);
      formattedBatch.details = batch.details?.map(detail => this.formatBatchDetail(detail)) || [];

      logger.info(`Merge batch detail fetched: ${batchId}`);

      return formattedBatch;
    } catch (error) {
      logger.error('Get merge batch detail error:', error);
      throw error;
    }
  }

  /**
   * 格式化批次
   * @param {Object} batch - 批次对象
   * @returns {Object} 格式化后的批次
   */
  formatMergeBatch(batch) {
    const plain = batch.get({ plain: true });
    return {
      batchId: plain.batch_id,
      lineId: plain.line_id,
      productionDate: plain.production_date,
      material: plain.material,
      thickness: plain.thickness,
      color: plain.color,
      totalPartCount: plain.total_part_count,
      mergeRule: plain.merge_rule,
      utilizationRate: plain.utilization_rate,
      optimizeStatus: plain.optimize_status,
      status: plain.status,
      detailCount: plain.details?.length || 0,
      createdAt: plain.created_at,
      updatedAt: plain.updated_at
    };
  }

  /**
   * 格式化批次明细
   * @param {Object} detail - 批次明细对象
   * @returns {Object} 格式化后的批次明细
   */
  formatBatchDetail(detail) {
    const plain = detail.get({ plain: true });
    return {
      id: plain.id,
      batchId: plain.batch_id,
      productionOrderId: plain.production_order_id,
      partId: plain.part_id,
      productionOrder: plain.productionOrder ? {
        productionOrderId: plain.productionOrder.production_order_id,
        orderId: plain.productionOrder.order_id,
        processRoute: plain.productionOrder.process_route
      } : null,
      part: plain.part ? {
        partId: plain.part.part_id,
        partType: plain.part.part_type,
        length: plain.part.length,
        width: plain.part.width
      } : null
    };
  }

  /**
   * 格式化日期
   * @param {Date} date - 日期对象
   * @returns {string} 格式化后的日期字符串
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

module.exports = new MergeBatchingService();
