/**
 * 产能控制器
 */

const capacityService = require('../services/capacityService');
const { successResponse } = require('../utils/response');
const logger = require('../utils/logger');

class CapacityController {
  /**
   * 查询产线列表
   */
  async getProductionLines(req, res, next) {
    try {
      const { status, lineType, workshop, page, pageSize } = req.query;

      const result = await capacityService.getProductionLines({
        status,
        lineType,
        workshop,
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 20
      });

      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Get production lines controller error:', error);
      next(error);
    }
  }

  /**
   * 创建产线
   */
  async createProductionLine(req, res, next) {
    try {
      const line = await capacityService.createProductionLine(req.body);
      res.status(201).json(successResponse(line, '产线创建成功'));
    } catch (error) {
      logger.error('Create production line controller error:', error);
      next(error);
    }
  }

  /**
   * 更新产线
   */
  async updateProductionLine(req, res, next) {
    try {
      const { lineId } = req.params;

      const line = await capacityService.updateProductionLine(lineId, req.body);
      res.status(200).json(successResponse(line, '产线更新成功'));
    } catch (error) {
      logger.error('Update production line controller error:', error);
      next(error);
    }
  }

  /**
   * 删除产线
   */
  async deleteProductionLine(req, res, next) {
    try {
      const { lineId } = req.params;

      await capacityService.deleteProductionLine(lineId);
      res.status(200).json(successResponse(null, '产线删除成功'));
    } catch (error) {
      logger.error('Delete production line controller error:', error);
      next(error);
    }
  }

  /**
   * 查询工艺路线列表
   */
  async getProcessRoutes(req, res, next) {
    try {
      const { panelType, page, pageSize } = req.query;

      const result = await capacityService.getProcessRoutes({
        panelType,
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 20
      });

      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Get process routes controller error:', error);
      next(error);
    }
  }

  /**
   * 更新工艺路线
   */
  async updateProcessRoute(req, res, next) {
    try {
      const { routeId } = req.params;

      const route = await capacityService.updateProcessRoute(routeId, req.body);
      res.status(200).json(successResponse(route, '工艺路线更新成功'));
    } catch (error) {
      logger.error('Update process route controller error:', error);
      next(error);
    }
  }
}

module.exports = new CapacityController();
