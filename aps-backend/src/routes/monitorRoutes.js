/**
 * 监控路由
 */

const express = require('express');
const router = express.Router();
const monitorController = require('../controllers/monitorController');
const { authMiddleware } = require('../middleware/authMiddleware');

// 查询生产进度
router.get('/progress', authMiddleware, monitorController.getProgress);

// 查询异常预警
router.get('/anomalies', authMiddleware, monitorController.getAnomalies);

module.exports = router;
