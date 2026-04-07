/**
 * 批次服务
 */

const { Batch, BatchOrder, Panel, ProductionLine } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class BatchService {
  /**
   * 查询批次列表
   * @param {Object} params - 查询参数
   * @returns {Object} 批次列表
   */
  async getBatches({ status, productionLine, color, thickness, page = 1, pageSize = 20 }) {
    try {
      logger.info('Fetching batches with params:', { status, productionLine, color, thickness, page, pageSize });

      const where = { deleted_at: null };

      if (status) {
        where.status = status;
      }
      if (productionLine) {
        where.production_line = productionLine;
      }
      if (color) {
        where.color = {
          [Op.like]: `%${color}%`
        };
      }
      if (thickness) {
        where.thickness = parseInt(thickness);
      }

      const currentPage = Math.max(1, parseInt(page));
      const currentPageSize = Math.max(1, parseInt(pageSize));
      const offset = (currentPage - 1) * currentPageSize;

      const { count, rows } = await Batch.findAndCountAll({
        where,
        limit: currentPageSize,
        offset,
        order: [['plan_start_date', 'ASC']]
      });

      const batches = rows.map(batch => this.formatBatch(batch));

      logger.info(`Found ${count} batches`);

      return {
        total: count,
        list: batches,
        page: currentPage,
        pageSize: currentPageSize
      };
    } catch (error) {
      logger.error('Get batches error:', error);
      throw error;
    }
  }

  /**
   * 查询批次详情
   * @param {string} batchNo - 批次号
   * @returns {Object} 批次详情
   */
  async getBatchDetail(batchNo) {
    try {
      logger.info(`Fetching batch detail: ${batchNo}`);

      const batch = await Batch.findOne({
        where: {
          batch_no: batchNo,
          deleted_at: null
        },
        include: [
          {
            model: Panel,
            as: 'panels',
            where: { deleted_at: null },
            required: false
          }
        ]
      });

      if (!batch) {
        logger.warn(`Batch not found: ${batchNo}`);
        throw new Error('批次不存在');
      }

      const formattedBatch = this.formatBatch(batch);
      formattedBatch.panels = batch.panels?.map(panel => this.formatPanel(panel)) || [];

      logger.info(`Batch detail fetched: ${batchNo}`);

      return formattedBatch;
    } catch (error) {
      logger.error('Get batch detail error:', error);
      throw error;
    }
  }

  /**
   * 批次规划
   * @param {Object} params - 规划参数
   * @returns {Object} 规划结果
   */
  async planBatch({ strategyId, orderPoolScope = 'TODAY', customOrderIds = [] }) {
    try {
      logger.info('Planning batch:', { strategyId, orderPoolScope, customOrderIds });

      // 模拟批次规划逻辑
      const batchNo = `BCH${Date.now()}`;

      // 获取策略配置
      const strategy = strategyId ? await this.getStrategyById(strategyId) : null;

      // 模拟生成批次数据
      const batch = await Batch.create({
        batch_no: batchNo,
        color: '子午灰',
        thickness: 18,
        material: '颗粒板',
        plan_start_date: new Date(),
        plan_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        production_line: '电子锯线1',
        utilization_rate: 85.50,
        status: '待下发',
        panel_count: Math.floor(Math.random() * 50) + 10,
        optimize_image_path: `/uploads/optimize/${batchNo}.png`
      });

      logger.info(`Batch planned successfully: ${batchNo}`);

      return this.getBatchDetail(batchNo);
    } catch (error) {
      logger.error('Plan batch error:', error);
      throw error;
    }
  }

  /**
   * 更新批次
   * @param {string} batchNo - 批次号
   * @param {Object} data - 更新数据
   * @returns {Object} 更新后的批次
   */
  async updateBatch(batchNo, data) {
    try {
      logger.info(`Updating batch: ${batchNo}`);

      const batch = await Batch.findOne({
        where: {
          batch_no: batchNo,
          deleted_at: null
        }
      });

      if (!batch) {
        logger.warn(`Batch not found: ${batchNo}`);
        throw new Error('批次不存在');
      }

      // 更新批次
      const updateData = {};
      if (data.planStartDate) updateData.plan_start_date = data.planStartDate;
      if (data.planEndDate) updateData.plan_end_date = data.planEndDate;
      if (data.productionLine) updateData.production_line = data.productionLine;
      if (data.utilizationRate !== undefined) updateData.utilization_rate = data.utilizationRate;
      if (data.status) updateData.status = data.status;
      if (data.optimizeImagePath !== undefined) updateData.optimize_image_path = data.optimizeImagePath;

      await batch.update(updateData);

      logger.info(`Batch updated successfully: ${batchNo}`);

      return this.getBatchDetail(batchNo);
    } catch (error) {
      logger.error('Update batch error:', error);
      throw error;
    }
  }

  /**
   * 删除批次
   * @param {string} batchNo - 批次号
   * @returns {Object} 删除结果
   */
  async deleteBatch(batchNo) {
    try {
      logger.info(`Deleting batch: ${batchNo}`);

      const batch = await Batch.findOne({
        where: {
          batch_no: batchNo,
          deleted_at: null
        }
      });

      if (!batch) {
        logger.warn(`Batch not found: ${batchNo}`);
        throw new Error('批次不存在');
      }

      // 检查批次状态是否允许删除
      if (['生产中', '已完成'].includes(batch.status)) {
        logger.warn(`Cannot delete batch in status: ${batch.status}`);
        throw new Error('批次已开始或完成,无法删除');
      }

      // 软删除
      await batch.destroy();

      logger.info(`Batch deleted successfully: ${batchNo}`);

      return { message: '删除成功' };
    } catch (error) {
      logger.error('Delete batch error:', error);
      throw error;
    }
  }

  /**
   * 获取策略
   * @param {string} strategyId - 策略ID
   * @returns {Object} 策略信息
   */
  async getStrategyById(strategyId) {
    const { Strategy } = require('../models');
    return await Strategy.findOne({
      where: {
        strategy_id: strategyId,
        deleted_at: null
      }
    });
  }

  /**
   * 格式化批次数据
   * @param {Object} batch - 批次对象
   * @returns {Object} 格式化后的批次
   */
  formatBatch(batch) {
    const plain = batch.get({ plain: true });
    return {
      batchNo: plain.batch_no,
      color: plain.color,
      thickness: plain.thickness,
      material: plain.material,
      planStartDate: plain.plan_start_date,
      planEndDate: plain.plan_end_date,
      productionLine: plain.production_line,
      utilizationRate: plain.utilization_rate,
      status: plain.status,
      panelCount: plain.panel_count,
      optimizeImagePath: plain.optimize_image_path,
      createdAt: plain.created_at,
      updatedAt: plain.updated_at
    };
  }

  /**
   * 格式化板件数据
   * @param {Object} panel - 板件对象
   * @returns {Object} 格式化后的板件
   */
  formatPanel(panel) {
    const plain = panel.get({ plain: true });
    return {
      panelNo: plain.panel_no,
      orderNo: plain.order_no,
      batchNo: plain.batch_no,
      panelType: plain.panel_type,
      length: plain.length,
      width: plain.width,
      thickness: plain.thickness,
      color: plain.color,
      material: plain.material,
      edgeRequirement: plain.edge_requirement,
      processRoute: plain.process_route
    };
  }
}

module.exports = new BatchService();
