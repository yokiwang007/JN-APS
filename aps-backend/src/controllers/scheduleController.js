/**
 * 排程控制器
 */

const scheduleService = require('../services/scheduleService');
const { successResponse } = require('../utils/response');
const logger = require('../utils/logger');

class ScheduleController {
  /**
   * 查询排程列表
   */
  async getSchedules(req, res, next) {
    try {
      const { batchNo, processName, startDate, endDate, page, pageSize } = req.query;

      const result = await scheduleService.getSchedules({
        batchNo,
        processName,
        startDate,
        endDate,
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 20
      });

      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Get schedules controller error:', error);
      next(error);
    }
  }

  /**
   * 排程优化
   */
  async optimizeSchedule(req, res, next) {
    try {
      const result = await scheduleService.optimizeSchedule(req.body);
      res.status(200).json(successResponse(result, '排程优化完成'));
    } catch (error) {
      logger.error('Optimize schedule controller error:', error);
      next(error);
    }
  }

  /**
   * 下发指令
   */
  async issueSchedule(req, res, next) {
    try {
      const result = await scheduleService.issueSchedule(req.body);
      res.status(200).json(successResponse(result, '下发完成'));
    } catch (error) {
      logger.error('Issue schedule controller error:', error);
      next(error);
    }
  }
}

module.exports = new ScheduleController();
