/**
 * 揉单合并API路由
 */

const express = require('express');
const router = express.Router();
const { mergeBatchingService } = require('../services-v2');
const logger = require('../utils/logger');

/**
 * @route POST /api/v2/merging/merge
 * @desc 揉单合并
 */
router.post('/merging/merge', async (req, res) => {
  try {
    const params = req.body;
    logger.info('POST /api/v2/merging/merge - Merge batching', params);

    const result = await mergeBatchingService.mergeBatches(params);

    res.status(200).json({
      success: true,
      data: result,
      message: '揉单合并成功'
    });
  } catch (error) {
    logger.error('Merge batching error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/merge-batches
 * @desc 查询生产批次
 */
router.get('/merge-batches', async (req, res) => {
  try {
    const params = req.query;
    logger.info('GET /api/v2/merge-batches - Fetching merge batches', params);

    const result = await mergeBatchingService.getMergeBatches(params);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get merge batches error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/merge-batches/:batchId
 * @desc 查询批次详情
 */
router.get('/merge-batches/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    logger.info(`GET /api/v2/merge-batches/${batchId} - Fetching merge batch detail`);

    const batch = await mergeBatchingService.getMergeBatchDetail(batchId);

    res.status(200).json({
      success: true,
      data: batch
    });
  } catch (error) {
    logger.error('Get merge batch detail error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
