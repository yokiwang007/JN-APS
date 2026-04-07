/**
 * 批次路由
 */

const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { authMiddleware } = require('../middleware/authMiddleware');

// 查询批次列表
router.get('/', authMiddleware, batchController.getBatches);

// 查询批次详情
router.get('/:batchNo', authMiddleware, batchController.getBatchDetail);

// 批次规划
router.post('/plan', authMiddleware, batchController.planBatch);

// 更新批次
router.put('/:batchNo', authMiddleware, batchController.updateBatch);

// 删除批次
router.delete('/:batchNo', authMiddleware, batchController.deleteBatch);

module.exports = router;
