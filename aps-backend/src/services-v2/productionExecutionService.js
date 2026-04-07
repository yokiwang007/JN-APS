/**
 * 生产执行服务 (阶段6)
 * 负责生产指令下发和工序追踪
 */

const { ApsMergeBatch, MesWipTracking, CadBomPart, ApsBatchDetail } = require('../models-v2');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class ProductionExecutionService {
  /**
   * 下发生产指令
   * @param {Object} params - 下发参数
   * @returns {Object} 下发结果
   */
  async issueProductionCommand(params) {
    try {
      logger.info('Issuing production command:', params);

      const { batchId } = params;

      // 查询批次信息
      const batch = await ApsMergeBatch.findOne({
        where: {
          batch_id: batchId,
          status: '已排程',
          deleted_at: null
        },
        include: [
          {
            model: ApsBatchDetail,
            as: 'details',
            required: true,
            include: [
              {
                model: CadBomPart,
                as: 'part',
                required: true
              }
            ]
          }
        ]
      });

      if (!batch) {
        logger.warn(`Batch not found or invalid status: ${batchId}`);
        throw new Error('批次不存在或状态不允许下发');
      }

      // 初始化工序追踪记录
      const trackingRecords = [];
      for (const detail of batch.details) {
        const tracking = await MesWipTracking.create({
          tracking_id: `TRACK${detail.part_id}`,
          part_id: detail.part_id,
          batch_id: batchId,
          current_process: '已开料',
          operation_time: new Date(),
          status: '进行中'
        });

        trackingRecords.push(tracking);
      }

      // 更新批次状态
      await batch.update({ status: '生产中' });

      logger.info(`Production command issued for batch: ${batchId}`);

      return {
        batchId: batch.batch_id,
        lineId: batch.line_id,
        productionDate: batch.production_date,
        totalParts: batch.total_part_count,
        trackingCount: trackingRecords.length,
        status: batch.status
      };
    } catch (error) {
      logger.error('Issue production command error:', error);
      throw error;
    }
  }

  /**
   * 更新工序状态
   * @param {Object} params - 更新参数
   * @returns {Object} 更新结果
   */
  async updateProcessStatus(params) {
    try {
      logger.info('Updating process status:', params);

      const { trackingId, currentProcess, operator, equipmentId } = params;

      // 查询追踪记录
      const tracking = await MesWipTracking.findOne({
        where: {
          tracking_id: trackingId,
          deleted_at: null
        },
        include: [
          {
            model: CadBomPart,
            as: 'part'
          }
        ]
      });

      if (!tracking) {
        logger.warn(`Tracking record not found: ${trackingId}`);
        throw new Error('追踪记录不存在');
      }

      // 验证工序流转
      const processOrder = ['已开料', '已封边', '已打孔', '已完成'];
      const currentIndex = processOrder.indexOf(tracking.current_process);
      const newIndex = processOrder.indexOf(currentProcess);

      if (newIndex <= currentIndex) {
        logger.warn(`Invalid process transition: ${tracking.current_process} -> ${currentProcess}`);
        throw new Error('无效的工序流转');
      }

      // 更新追踪记录
      const updateData = {
        current_process: currentProcess,
        operation_time: new Date(),
        operator: operator || tracking.operator,
        equipment_id: equipmentId || tracking.equipment_id
      };

      if (currentProcess === '已完成') {
        updateData.status = '已完成';
      }

      await tracking.update(updateData);

      // 检查批次是否全部完成
      await this.checkBatchCompletion(tracking.batch_id);

      logger.info(`Process status updated: ${trackingId} -> ${currentProcess}`);

      return this.formatWipTracking(tracking);
    } catch (error) {
      logger.error('Update process status error:', error);
      throw error;
    }
  }

  /**
   * 检查批次完成情况
   * @param {string} batchId - 批次号
   */
  async checkBatchCompletion(batchId) {
    try {
      // 查询批次的所有追踪记录
      const trackings = await MesWipTracking.findAll({
        where: {
          batch_id: batchId,
          deleted_at: null
        }
      });

      const allCompleted = trackings.every(t => t.status === '已完成');

      if (allCompleted) {
        // 更新批次状态
        await ApsMergeBatch.update(
          { status: '已完成' },
          { where: { batch_id: batchId } }
        );

        logger.info(`Batch completed: ${batchId}`);
      }
    } catch (error) {
      logger.error('Check batch completion error:', error);
    }
  }

  /**
   * 查询工序追踪记录
   * @param {Object} params - 查询参数
   * @returns {Object} 追踪记录列表
   */
  async getWipTracking({ batchId, partId, currentProcess, status, page = 1, pageSize = 20 }) {
    try {
      logger.info('Fetching WIP tracking with params:', { batchId, partId, currentProcess, status, page, pageSize });

      const where = { deleted_at: null };

      if (batchId) {
        where.batch_id = batchId;
      }
      if (partId) {
        where.part_id = partId;
      }
      if (currentProcess) {
        where.current_process = currentProcess;
      }
      if (status) {
        where.status = status;
      }

      const currentPage = Math.max(1, parseInt(page));
      const currentPageSize = Math.max(1, parseInt(pageSize));
      const offset = (currentPage - 1) * currentPageSize;

      const { count, rows } = await MesWipTracking.findAndCountAll({
        where,
        limit: currentPageSize,
        offset,
        order: [['operation_time', 'DESC']],
        include: [
          {
            model: CadBomPart,
            as: 'part'
          }
        ]
      });

      const trackings = rows.map(tracking => this.formatWipTracking(tracking));

      logger.info(`Found ${count} WIP tracking records`);

      return {
        total: count,
        list: trackings,
        page: currentPage,
        pageSize: currentPageSize
      };
    } catch (error) {
      logger.error('Get WIP tracking error:', error);
      throw error;
    }
  }

  /**
   * 查询批次生产进度
   * @param {string} batchId - 批次号
   * @returns {Object} 生产进度
   */
  async getBatchProgress(batchId) {
    try {
      logger.info(`Fetching batch progress: ${batchId}`);

      // 查询批次的所有追踪记录
      const trackings = await MesWipTracking.findAll({
        where: {
          batch_id: batchId,
          deleted_at: null
        },
        include: [
          {
            model: CadBomPart,
            as: 'part'
          }
        ]
      });

      if (trackings.length === 0) {
        logger.warn(`No tracking records found for batch: ${batchId}`);
        throw new Error('批次没有追踪记录');
      }

      // 统计各工序进度
      const processStats = {
        '已开料': 0,
        '已封边': 0,
        '已打孔': 0,
        '已完成': 0
      };

      trackings.forEach(t => {
        if (processStats.hasOwnProperty(t.current_process)) {
          processStats[t.current_process]++;
        }
      });

      // 计算完成率
      const totalParts = trackings.length;
      const completedParts = processStats['已完成'];
      const completionRate = ((completedParts / totalParts) * 100).toFixed(2);

      // 查询批次信息
      const batch = await ApsMergeBatch.findOne({
        where: { batch_id: batchId }
      });

      logger.info(`Batch progress fetched: ${batchId}`);

      return {
        batchId: batchId,
        lineId: batch.line_id,
        productionDate: batch.production_date,
        material: batch.material,
        thickness: batch.thickness,
        color: batch.color,
        totalParts: batch.total_part_count,
        trackedParts: totalParts,
        processStats,
        completedParts,
        completionRate: parseFloat(completionRate),
        status: batch.status
      };
    } catch (error) {
      logger.error('Get batch progress error:', error);
      throw error;
    }
  }

  /**
   * 查询生产统计数据
   * @param {Object} params - 统计参数
   * @returns {Object} 统计数据
   */
  async getProductionStatistics({ startDate, endDate, lineId }) {
    try {
      logger.info('Fetching production statistics:', { startDate, endDate, lineId });

      const where = { deleted_at: null };

      if (startDate) {
        where.created_at = { ...where.created_at, [Op.gte]: startDate };
      }
      if (endDate) {
        where.created_at = { ...where.created_at, [Op.lte]: endDate };
      }

      // 查询所有追踪记录
      const trackings = await MesWipTracking.findAll({
        where,
        include: [
          {
            model: ApsMergeBatch,
            as: 'batch',
            where: lineId ? { line_id: lineId } : {}
          }
        ]
      });

      const totalTrackings = trackings.length;
      const completedTrackings = trackings.filter(t => t.status === '已完成').length;
      const inProgressTrackings = trackings.filter(t => t.status === '进行中').length;

      // 统计各工序数量
      const processCounts = {
        '已开料': 0,
        '已封边': 0,
        '已打孔': 0,
        '已完成': 0
      };

      trackings.forEach(t => {
        if (processCounts.hasOwnProperty(t.current_process)) {
          processCounts[t.current_process]++;
        }
      });

      // 计算完成率
      const completionRate = totalTrackings > 0
        ? ((completedTrackings / totalTrackings) * 100).toFixed(2)
        : 0;

      logger.info('Production statistics fetched');

      return {
        totalTrackings,
        completedTrackings,
        inProgressTrackings,
        processCounts,
        completionRate: parseFloat(completionRate)
      };
    } catch (error) {
      logger.error('Get production statistics error:', error);
      throw error;
    }
  }

  /**
   * 格式化工序追踪记录
   * @param {Object} tracking - 追踪记录对象
   * @returns {Object} 格式化后的记录
   */
  formatWipTracking(tracking) {
    const plain = tracking.get({ plain: true });
    return {
      trackingId: plain.tracking_id,
      partId: plain.part_id,
      batchId: plain.batch_id,
      currentProcess: plain.current_process,
      operationTime: plain.operation_time,
      operator: plain.operator,
      equipmentId: plain.equipment_id,
      status: plain.status,
      part: plain.part ? {
        partId: plain.part.part_id,
        partType: plain.part.part_type,
        material: plain.part.material,
        color: plain.part.color
      } : null,
      createdAt: plain.created_at,
      updatedAt: plain.updated_at
    };
  }
}

module.exports = new ProductionExecutionService();
