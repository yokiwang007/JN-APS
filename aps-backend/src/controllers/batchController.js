/**
 * 批次控制器
 */

const batchService = require('../services/batchService');
const { successResponse } = require('../utils/response');
const logger = require('../utils/logger');

class BatchController {
  /**
   * 查询批次列表
   */
  async getBatches(req, res, next) {
    try {
      const { status, productionLine, color, thickness, page, pageSize } = req.query;

      const result = await batchService.getBatches({
        status,
        productionLine,
        color,
        thickness,
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 20
      });

      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Get batches controller error:', error);
      next(error);
    }
  }

  /**
   * 查询批次详情
   */
  async getBatchDetail(req, res, next) {
    try {
      const { batchNo } = req.params;

      const batch = await batchService.getBatchDetail(batchNo);
      res.status(200).json(successResponse(batch));
    } catch (error) {
      logger.error('Get batch detail controller error:', error);
      next(error);
    }
  }

  /**
   * 批次规划
   */
  async planBatch(req, res, next) {
    try {
      const result = await batchService.planBatch(req.body);
      res.status(200).json(successResponse(result, '批次规划成功'));
    } catch (error) {
      logger.error('Plan batch controller error:', error);
      next(error);
    }
  }

  /**
   * 更新批次
   */
  async updateBatch(req, res, next) {
    try {
      const { batchNo } = req.params;

      const batch = await batchService.updateBatch(batchNo, req.body);
      res.status(200).json(successResponse(batch, '批次更新成功'));
    } catch (error) {
      logger.error('Update batch controller error:', error);
      next(error);
    }
  }

  /**
   * 删除批次
   */
  async deleteBatch(req, res, next) {
    try {
      const { batchNo } = req.params;

      const result = await batchService.deleteBatch(batchNo);
      res.status(200).json(successResponse(result, '删除成功'));
    } catch (error) {
      logger.error('Delete batch controller error:', error);
      next(error);
    }
  }
}

module.exports = new BatchController();
