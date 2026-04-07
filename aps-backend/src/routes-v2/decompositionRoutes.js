/**
 * 订单拆解API路由
 */

const express = require('express');
const router = express.Router();
const { orderDecompositionService } = require('../services-v2');
const logger = require('../utils/logger');

/**
 * @route POST /api/v2/orders/:orderId/decompose
 * @desc 订单拆解
 */
router.post('/orders/:orderId/decompose', async (req, res) => {
  try {
    const { orderId } = req.params;
    const bomData = req.body;
    logger.info(`POST /api/v2/orders/${orderId}/decompose - Decomposing order`, bomData);

    const result = await orderDecompositionService.decomposeOrder(orderId, bomData);

    res.status(200).json({
      success: true,
      data: result,
      message: '订单拆解成功'
    });
  } catch (error) {
    logger.error('Decompose order error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/orders/:orderId/production-orders
 * @desc 查询生产子订单
 */
router.get('/orders/:orderId/production-orders', async (req, res) => {
  try {
    const { orderId } = req.params;
    const params = { ...req.query, orderId };
    logger.info(`GET /api/v2/orders/${orderId}/production-orders - Fetching production orders`);

    const result = await orderDecompositionService.getProductionOrders(params);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get production orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/orders/:orderId/parts
 * @desc 查询零件明细
 */
router.get('/orders/:orderId/parts', async (req, res) => {
  try {
    const { orderId } = req.params;
    const params = { ...req.query, orderId };
    logger.info(`GET /api/v2/orders/${orderId}/parts - Fetching parts`);

    const result = await orderDecompositionService.getParts(params);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get parts error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
