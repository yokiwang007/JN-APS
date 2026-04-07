/**
 * 细排程API路由
 */

const express = require('express');
const router = express.Router();
const { fineSchedulingService } = require('../services-v2');
const logger = require('../utils/logger');

/**
 * @route POST /api/v2/scheduling/fine
 * @desc 细排程
 */
router.post('/scheduling/fine', async (req, res) => {
  try {
    const params = req.body;
    logger.info('POST /api/v2/scheduling/fine - Fine scheduling', params);

    const result = await fineSchedulingService.scheduleFine(params);

    res.status(200).json({
      success: true,
      data: result,
      message: '细排程成功'
    });
  } catch (error) {
    logger.error('Fine scheduling error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/cutting-patterns/:batchId
 * @desc 查询排版图
 */
router.get('/cutting-patterns/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    logger.info(`GET /api/v2/cutting-patterns/${batchId} - Fetching cutting pattern`);

    const pattern = await fineSchedulingService.getCuttingPattern(batchId);

    res.status(200).json({
      success: true,
      data: pattern
    });
  } catch (error) {
    logger.error('Get cutting pattern error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/cutting-patterns
 * @desc 查询排版图列表
 */
router.get('/cutting-patterns', async (req, res) => {
  try {
    const params = req.query;
    logger.info('GET /api/v2/cutting-patterns - Fetching cutting patterns', params);

    const result = await fineSchedulingService.getCuttingPatterns(params);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get cutting patterns error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route PUT /api/v2/cutting-patterns/:patternId
 * @desc 更新排版图
 */
router.put('/cutting-patterns/:patternId', async (req, res) => {
  try {
    const { patternId } = req.params;
    const data = req.body;
    logger.info(`PUT /api/v2/cutting-patterns/${patternId} - Updating cutting pattern`, data);

    const pattern = await fineSchedulingService.updateCuttingPattern(patternId, data);

    res.status(200).json({
      success: true,
      data: pattern,
      message: '排版图更新成功'
    });
  } catch (error) {
    logger.error('Update cutting pattern error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/cutting-statistics
 * @desc 查询开料统计数据
 */
router.get('/cutting-statistics', async (req, res) => {
  try {
    const params = req.query;
    logger.info('GET /api/v2/cutting-statistics - Fetching cutting statistics', params);

    const result = await fineSchedulingService.getCuttingStatistics(params);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get cutting statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
