/**
 * 订单控制器
 */

const orderService = require('../services/orderService');
const { successResponse } = require('../utils/response');
const logger = require('../utils/logger');

class OrderController {
  /**
   * 查询订单列表
   */
  async getOrders(req, res, next) {
    try {
      const { status, priority, customerName, page, pageSize } = req.query;

      const result = await orderService.getOrders({
        status,
        priority,
        customerName,
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 20
      });

      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Get orders controller error:', error);
      next(error);
    }
  }

  /**
   * 查询订单详情
   */
  async getOrderDetail(req, res, next) {
    try {
      const { orderNo } = req.params;

      const order = await orderService.getOrderDetail(orderNo);
      res.status(200).json(successResponse(order));
    } catch (error) {
      logger.error('Get order detail controller error:', error);
      next(error);
    }
  }

  /**
   * 创建订单
   */
  async createOrder(req, res, next) {
    try {
      const result = await orderService.createOrder(req.body);
      res.status(201).json(successResponse(result, '订单创建成功'));
    } catch (error) {
      logger.error('Create order controller error:', error);
      next(error);
    }
  }

  /**
   * 更新订单
   */
  async updateOrder(req, res, next) {
    try {
      const { orderNo } = req.params;

      const order = await orderService.updateOrder(orderNo, req.body);
      res.status(200).json(successResponse(order, '订单更新成功'));
    } catch (error) {
      logger.error('Update order controller error:', error);
      next(error);
    }
  }

  /**
   * 删除订单
   */
  async deleteOrder(req, res, next) {
    try {
      const { orderNo } = req.params;

      const result = await orderService.deleteOrder(orderNo);
      res.status(200).json(successResponse(result, '删除成功'));
    } catch (error) {
      logger.error('Delete order controller error:', error);
      next(error);
    }
  }

  /**
   * 订单预处理
   */
  async preprocessOrders(req, res, next) {
    try {
      const result = await orderService.preprocessOrders(req.body);
      res.status(200).json(successResponse(result, '预处理完成'));
    } catch (error) {
      logger.error('Preprocess orders controller error:', error);
      next(error);
    }
  }
}

module.exports = new OrderController();
