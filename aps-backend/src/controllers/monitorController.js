/**
 * 监控控制器
 */

const monitorService = require('../services/monitorService');
const { successResponse } = require('../utils/response');
const logger = require('../utils/logger');

class MonitorController {
  /**
   * 查询生产进度
   */
  async getProgress(req, res, next) {
    try {
      const { dateRange } = req.query;

      const result = await monitorService.getProgress({
        dateRange: dateRange || 'TODAY'
      });

      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Get progress controller error:', error);
      next(error);
    }
  }

  /**
   * 查询异常预警
   */
  async getAnomalies(req, res, next) {
    try {
      const { type, status, page, pageSize } = req.query;

      const result = await monitorService.getAnomalies({
        type: type || 'ALL',
        status: status || 'UNRESOLVED',
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 20
      });

      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Get anomalies controller error:', error);
      next(error);
    }
  }
}

module.exports = new MonitorController();
