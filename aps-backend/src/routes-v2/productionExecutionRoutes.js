/**
 * 生产执行API路由
 */

const express = require('express');
const router = express.Router();
const { productionExecutionService } = require('../services-v2');
const logger = require('../utils/logger');

/**
 * @route POST /api/v2/production/issue
 * @desc 下发生产指令
 */
router.post('/production/issue', async (req, res) => {
  try {
    const params = req.body;
    logger.info('POST /api/v2/production/issue - Issuing production command', params);

    const result = await productionExecutionService.issueProductionCommand(params);

    res.status(200).json({
      success: true,
      data: result,
      message: '生产指令下发成功'
    });
  } catch (error) {
    logger.error('Issue production command error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route PUT /api/v2/production/wip-tracking/:trackingId
 * @desc 更新工序状态
 */
router.put('/production/wip-tracking/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    const data = req.body;
    logger.info(`PUT /api/v2/production/wip-tracking/${trackingId} - Updating process status`, data);

    const result = await productionExecutionService.updateProcessStatus({ trackingId, ...data });

    res.status(200).json({
      success: true,
      data: result,
      message: '工序状态更新成功'
    });
  } catch (error) {
    logger.error('Update process status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/production/wip-tracking
 * @desc 查询工序追踪
 */
router.get('/production/wip-tracking', async (req, res) => {
  try {
    const params = req.query;
    logger.info('GET /api/v2/production/wip-tracking - Fetching WIP tracking', params);

    const result = await productionExecutionService.getWipTracking(params);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get WIP tracking error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/production/batch/:batchId/progress
 * @desc 查询批次生产进度
 */
router.get('/production/batch/:batchId/progress', async (req, res) => {
  try {
    const { batchId } = req.params;
    logger.info(`GET /api/v2/production/batch/${batchId}/progress - Fetching batch progress`);

    const result = await productionExecutionService.getBatchProgress(batchId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get batch progress error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/production/statistics
 * @desc 查询生产统计数据
 */
router.get('/production/statistics', async (req, res) => {
  try {
    const params = req.query;
    logger.info('GET /api/v2/production/statistics - Fetching production statistics', params);

    const result = await productionExecutionService.getProductionStatistics(params);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get production statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
