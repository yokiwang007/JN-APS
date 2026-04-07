/**
 * 齐套管理API路由
 */

const express = require('express');
const router = express.Router();
const { fulfillmentManagementService } = require('../services-v2');
const logger = require('../utils/logger');

/**
 * @route POST /api/v2/fulfillment/slots
 * @desc 初始化齐套货位
 */
router.post('/fulfillment/slots', async (req, res) => {
  try {
    const params = req.body;
    logger.info('POST /api/v2/fulfillment/slots - Initializing sorting slot', params);

    const result = await fulfillmentManagementService.initializeSortingSlot(params);

    res.status(201).json({
      success: true,
      data: result,
      message: '齐套货位初始化成功'
    });
  } catch (error) {
    logger.error('Initialize sorting slot error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route PUT /api/v2/fulfillment/slots/:orderId/progress
 * @desc 更新齐套进度
 */
router.put('/fulfillment/slots/:orderId/progress', async (req, res) => {
  try {
    const { orderId } = req.params;
    logger.info(`PUT /api/v2/fulfillment/slots/${orderId}/progress - Updating fulfillment progress`);

    const result = await fulfillmentManagementService.updateFulfillmentProgress(orderId);

    res.status(200).json({
      success: true,
      data: result,
      message: '齐套进度更新成功'
    });
  } catch (error) {
    logger.error('Update fulfillment progress error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/fulfillment/slots
 * @desc 查询齐套货位
 */
router.get('/fulfillment/slots', async (req, res) => {
  try {
    const params = req.query;
    logger.info('GET /api/v2/fulfillment/slots - Fetching sorting slots', params);

    const result = await fulfillmentManagementService.getSortingSlots(params);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get sorting slots error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/fulfillment/slots/:slotId
 * @desc 查询齐套货位详情
 */
router.get('/fulfillment/slots/:slotId', async (req, res) => {
  try {
    const { slotId } = req.params;
    logger.info(`GET /api/v2/fulfillment/slots/${slotId} - Fetching sorting slot detail`);

    const slot = await fulfillmentManagementService.getSortingSlotDetail(slotId);

    res.status(200).json({
      success: true,
      data: slot
    });
  } catch (error) {
    logger.error('Get sorting slot detail error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route POST /api/v2/fulfillment/shipments
 * @desc 生成发货单
 */
router.post('/fulfillment/shipments', async (req, res) => {
  try {
    const { slotId } = req.body;
    logger.info('POST /api/v2/fulfillment/shipments - Generating shipment', { slotId });

    const result = await fulfillmentManagementService.generateShipment(slotId);

    res.status(200).json({
      success: true,
      data: result,
      message: '发货单生成成功'
    });
  } catch (error) {
    logger.error('Generate shipment error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/fulfillment/statistics
 * @desc 查询齐套统计数据
 */
router.get('/fulfillment/statistics', async (req, res) => {
  try {
    const params = req.query;
    logger.info('GET /api/v2/fulfillment/statistics - Fetching fulfillment statistics', params);

    const result = await fulfillmentManagementService.getFulfillmentStatistics(params);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get fulfillment statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
