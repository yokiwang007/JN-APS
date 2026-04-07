/**
 * 产能路由
 */

const express = require('express');
const router = express.Router();
const capacityController = require('../controllers/capacityController');
const { authMiddleware } = require('../middleware/authMiddleware');

// 查询产线列表
router.get('/production-lines', capacityController.getProductionLines);

// 创建产线
router.post('/production-lines', capacityController.createProductionLine);

// 更新产线
router.put('/production-lines/:lineId', capacityController.updateProductionLine);

// 删除产线
router.delete('/production-lines/:lineId', capacityController.deleteProductionLine);

// 查询工艺路线列表
router.get('/process-routes', capacityController.getProcessRoutes);

// 更新工艺路线
router.put('/process-routes/:routeId', capacityController.updateProcessRoute);

module.exports = router;
