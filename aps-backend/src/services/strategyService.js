/**
 * 策略服务
 */

const { Strategy } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class StrategyService {
  /**
   * 查询策略列表
   * @param {Object} params - 查询参数
   * @returns {Object} 策略列表
   */
  async getStrategies({ enabled, page = 1, pageSize = 20 }) {
    try {
      logger.info('Fetching strategies with params:', { enabled, page, pageSize });

      const where = { deleted_at: null };

      if (enabled !== undefined) {
        where.enabled = enabled === 'true' || enabled === true;
      }

      const currentPage = Math.max(1, parseInt(page));
      const currentPageSize = Math.max(1, parseInt(pageSize));
      const offset = (currentPage - 1) * currentPageSize;

      const { count, rows } = await Strategy.findAndCountAll({
        where,
        limit: currentPageSize,
        offset,
        order: [['created_at', 'DESC']]
      });

      const strategies = rows.map(strategy => this.formatStrategy(strategy));

      logger.info(`Found ${count} strategies`);

      return {
        total: count,
        list: strategies,
        page: currentPage,
        pageSize: currentPageSize
      };
    } catch (error) {
      logger.error('Get strategies error:', error);
      throw error;
    }
  }

  /**
   * 创建策略
   * @param {Object} data - 策略数据
   * @returns {Object} 创建的策略
   */
  async createStrategy(data) {
    const {
      strategyId,
      strategyName,
      description,
      priorityWeights,
      constraints,
      enabled = false
    } = data;

    try {
      logger.info(`Creating strategy: ${strategyId}`);

      // 检查策略ID是否已存在
      const existingStrategy = await Strategy.findOne({
        where: {
          strategy_id: strategyId,
          deleted_at: null
        }
      });

      if (existingStrategy) {
        logger.warn(`Strategy already exists: ${strategyId}`);
        throw new Error('策略ID已存在');
      }

      // 创建策略
      const strategy = await Strategy.create({
        strategy_id: strategyId,
        strategy_name: strategyName,
        description,
        priority_weights: JSON.stringify(priorityWeights),
        constraints: JSON.stringify(constraints),
        enabled
      });

      logger.info(`Strategy created successfully: ${strategyId}`);

      return this.formatStrategy(strategy);
    } catch (error) {
      logger.error('Create strategy error:', error);
      throw error;
    }
  }

  /**
   * 更新策略
   * @param {string} strategyId - 策略ID
   * @param {Object} data - 更新数据
   * @returns {Object} 更新后的策略
   */
  async updateStrategy(strategyId, data) {
    try {
      logger.info(`Updating strategy: ${strategyId}`);

      const strategy = await Strategy.findOne({
        where: {
          strategy_id: strategyId,
          deleted_at: null
        }
      });

      if (!strategy) {
        logger.warn(`Strategy not found: ${strategyId}`);
        throw new Error('策略不存在');
      }

      // 更新策略
      const updateData = {};
      if (data.strategyName) updateData.strategy_name = data.strategyName;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.priorityWeights !== undefined) {
        updateData.priority_weights = JSON.stringify(data.priorityWeights);
      }
      if (data.constraints !== undefined) {
        updateData.constraints = JSON.stringify(data.constraints);
      }
      if (data.enabled !== undefined) updateData.enabled = data.enabled;

      await strategy.update(updateData);

      logger.info(`Strategy updated successfully: ${strategyId}`);

      return this.formatStrategy(strategy);
    } catch (error) {
      logger.error('Update strategy error:', error);
      throw error;
    }
  }

  /**
   * 激活策略
   * @param {string} strategyId - 策略ID
   * @returns {Object} 激活结果
   */
  async activateStrategy(strategyId) {
    try {
      logger.info(`Activating strategy: ${strategyId}`);

      const strategy = await Strategy.findOne({
        where: {
          strategy_id: strategyId,
          deleted_at: null
        }
      });

      if (!strategy) {
        logger.warn(`Strategy not found: ${strategyId}`);
        throw new Error('策略不存在');
      }

      // 禁用所有策略
      await Strategy.update(
        { enabled: false },
        {
          where: {
            deleted_at: null
          }
        }
      );

      // 启用当前策略
      await strategy.update({ enabled: true });

      logger.info(`Strategy activated successfully: ${strategyId}`);

      return this.formatStrategy(strategy);
    } catch (error) {
      logger.error('Activate strategy error:', error);
      throw error;
    }
  }

  /**
   * 删除策略
   * @param {string} strategyId - 策略ID
   * @returns {Object} 删除结果
   */
  async deleteStrategy(strategyId) {
    try {
      logger.info(`Deleting strategy: ${strategyId}`);

      const strategy = await Strategy.findOne({
        where: {
          strategy_id: strategyId,
          deleted_at: null
        }
      });

      if (!strategy) {
        logger.warn(`Strategy not found: ${strategyId}`);
        throw new Error('策略不存在');
      }

      // 检查策略是否启用
      if (strategy.enabled) {
        logger.warn(`Cannot delete enabled strategy: ${strategyId}`);
        throw new Error('策略已启用,无法删除');
      }

      // 软删除
      await strategy.destroy();

      logger.info(`Strategy deleted successfully: ${strategyId}`);

      return { message: '删除成功' };
    } catch (error) {
      logger.error('Delete strategy error:', error);
      throw error;
    }
  }

  /**
   * 格式化策略数据
   * @param {Object} strategy - 策略对象
   * @returns {Object} 格式化后的策略
   */
  formatStrategy(strategy) {
    const plain = strategy.get({ plain: true });

    // 数据库中存储的是字符串格式,直接返回
    return {
      strategyId: plain.strategy_id,
      strategyName: plain.strategy_name,
      description: plain.description,
      priorityWeights: plain.priority_weights,
      constraints: plain.constraints,
      enabled: plain.enabled,
      createdAt: plain.created_at,
      updatedAt: plain.updated_at
    };
  }
}

module.exports = new StrategyService();
