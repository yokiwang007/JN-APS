/**
 * 策略路由
 */

const express = require('express');
const router = express.Router();
const strategyController = require('../controllers/strategyController');
const { authMiddleware } = require('../middleware/authMiddleware');

// 查询策略列表
router.get('/', authMiddleware, strategyController.getStrategies);

// 创建策略
router.post('/', authMiddleware, strategyController.createStrategy);

// 更新策略
router.put('/:strategyId', authMiddleware, strategyController.updateStrategy);

// 激活策略
router.put('/:strategyId/activate', authMiddleware, strategyController.activateStrategy);

// 删除策略
router.delete('/:strategyId', authMiddleware, strategyController.deleteStrategy);

module.exports = router;
