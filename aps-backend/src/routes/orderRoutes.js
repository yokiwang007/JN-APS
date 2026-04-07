/**
 * 订单路由
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');

// 查询订单列表
router.get('/', orderController.getOrders);

// 查询订单详情
router.get('/:orderNo', orderController.getOrderDetail);

// 创建订单
router.post('/', orderController.createOrder);

// 更新订单
router.put('/:orderNo', orderController.updateOrder);

// 删除订单
router.delete('/:orderNo', orderController.deleteOrder);

// 订单预处理
router.post('/preprocess', orderController.preprocessOrders);

module.exports = router;
