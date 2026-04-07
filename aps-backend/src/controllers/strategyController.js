/**
 * 策略控制器
 */

const strategyService = require('../services/strategyService');
const { successResponse } = require('../utils/response');
const logger = require('../utils/logger');

class StrategyController {
  /**
   * 查询策略列表
   */
  async getStrategies(req, res, next) {
    try {
      const { enabled, page, pageSize } = req.query;

      const result = await strategyService.getStrategies({
        enabled,
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 20
      });

      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Get strategies controller error:', error);
      next(error);
    }
  }

  /**
   * 创建策略
   */
  async createStrategy(req, res, next) {
    try {
      const result = await strategyService.createStrategy(req.body);
      res.status(201).json(successResponse(result, '策略创建成功'));
    } catch (error) {
      logger.error('Create strategy controller error:', error);
      next(error);
    }
  }

  /**
   * 更新策略
   */
  async updateStrategy(req, res, next) {
    try {
      const { strategyId } = req.params;

      const strategy = await strategyService.updateStrategy(strategyId, req.body);
      res.status(200).json(successResponse(strategy, '策略更新成功'));
    } catch (error) {
      logger.error('Update strategy controller error:', error);
      next(error);
    }
  }

  /**
   * 激活策略
   */
  async activateStrategy(req, res, next) {
    try {
      const { strategyId } = req.params;

      const strategy = await strategyService.activateStrategy(strategyId);
      res.status(200).json(successResponse(strategy, '策略激活成功'));
    } catch (error) {
      logger.error('Activate strategy controller error:', error);
      next(error);
    }
  }

  /**
   * 删除策略
   */
  async deleteStrategy(req, res, next) {
    try {
      const { strategyId } = req.params;

      const result = await strategyService.deleteStrategy(strategyId);
      res.status(200).json(successResponse(result, '删除成功'));
    } catch (error) {
      logger.error('Delete strategy controller error:', error);
      next(error);
    }
  }
}

module.exports = new StrategyController();
