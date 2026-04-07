/**
 * 粗排程API路由
 */

const express = require('express');
const router = express.Router();
const { coarseSchedulingService } = require('../services-v2');
const logger = require('../utils/logger');

/**
 * @route POST /api/v2/scheduling/coarse
 * @desc 粗排程
 */
router.post('/scheduling/coarse', async (req, res) => {
  try {
    const params = req.body;
    logger.info('POST /api/v2/scheduling/coarse - Coarse scheduling', params);

    const result = await coarseSchedulingService.scheduleCoarse(params);

    res.status(200).json({
      success: true,
      data: result,
      message: '粗排程成功'
    });
  } catch (error) {
    logger.error('Coarse scheduling error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/schedule-tasks
 * @desc 查询排程任务
 */
router.get('/schedule-tasks', async (req, res) => {
  try {
    const params = req.query;
    logger.info('GET /api/v2/schedule-tasks - Fetching schedule tasks', params);

    const result = await coarseSchedulingService.getScheduleTasks(params);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get schedule tasks error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/schedule-tasks/:taskId
 * @desc 查询排程任务详情
 */
router.get('/schedule-tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    logger.info(`GET /api/v2/schedule-tasks/${taskId} - Fetching schedule task detail`);

    const task = await coarseSchedulingService.getScheduleTaskDetail(taskId);

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    logger.error('Get schedule task detail error:', error);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route PUT /api/v2/schedule-tasks/:taskId
 * @desc 更新排程任务
 */
router.put('/schedule-tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const data = req.body;
    logger.info(`PUT /api/v2/schedule-tasks/${taskId} - Updating schedule task`, data);

    const task = await coarseSchedulingService.updateScheduleTask(taskId, data);

    res.status(200).json({
      success: true,
      data: task,
      message: '排程任务更新成功'
    });
  } catch (error) {
    logger.error('Update schedule task error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
