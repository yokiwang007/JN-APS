/**
 * 订单管理API路由
 */

const express = require('express');
const router = express.Router();
const { orderReceptionService } = require('../services-v2');
const logger = require('../utils/logger');

/**
 * @route POST /api/v2/erp-orders
 * @desc 创建销售订单
 */
router.post('/erp-orders', async (req, res) => {
  try {
    const data = req.body;
    logger.info('POST /api/v2/erp-orders - Creating sales order', data);

    const order = await orderReceptionService.createSalesOrder(data);

    res.status(201).json({
      success: true,
      data: order,
      message: '订单创建成功'
    });
  } catch (error) {
    logger.error('Create sales order error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/erp-orders
 * @desc 查询销售订单列表
 */
router.get('/erp-orders', async (req, res) => {
  try {
    const params = req.query;
    logger.info('GET /api/v2/erp-orders - Fetching sales orders', params);

    const result = await orderReceptionService.getSalesOrders(params);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get sales orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/erp-orders/:orderId
 * @desc 查询销售订单详情
 */
router.get('/erp-orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    logger.info(`GET /api/v2/erp-orders/${orderId} - Fetching sales order detail`);

    const order = await orderReceptionService.getSalesOrderDetail(orderId);

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    logger.error('Get sales order detail error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route PUT /api/v2/erp-orders/:orderId
 * @desc 更新销售订单
 */
router.put('/erp-orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const data = req.body;
    logger.info(`PUT /api/v2/erp-orders/${orderId} - Updating sales order`, data);

    const order = await orderReceptionService.updateSalesOrder(orderId, data);

    res.status(200).json({
      success: true,
      data: order,
      message: '订单更新成功'
    });
  } catch (error) {
    logger.error('Update sales order error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/v2/erp-orders/:orderId
 * @desc 删除销售订单
 */
router.delete('/erp-orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    logger.info(`DELETE /api/v2/erp-orders/${orderId} - Deleting sales order`);

    const result = await orderReceptionService.deleteSalesOrder(orderId);

    res.status(200).json({
      success: true,
      data: result,
      message: '订单删除成功'
    });
  } catch (error) {
    logger.error('Delete sales order error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
