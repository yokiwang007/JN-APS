/**
 * 排程路由
 */

const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authMiddleware } = require('../middleware/authMiddleware');

// 查询排程列表
router.get('/', authMiddleware, scheduleController.getSchedules);

// 排程优化
router.post('/optimize', authMiddleware, scheduleController.optimizeSchedule);

// 下发指令
router.post('/issue', authMiddleware, scheduleController.issueSchedule);

module.exports = router;
