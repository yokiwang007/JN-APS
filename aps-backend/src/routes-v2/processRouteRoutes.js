const express = require('express');
const router = express.Router();
const processRouteService = require('../services-v2/processRouteService');
const logger = require('../utils/logger');

/**
 * 获取所有工艺路线
 * GET /api/v2/process-routes
 */
router.get('/', async (req, res) => {
  try {
    const routes = await processRouteService.getProcessRoutes();
    res.json({
      success: true,
      data: routes,
      message: '查询成功'
    });
  } catch (error) {
    logger.error('Get process routes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取工艺路线列表失败'
    });
  }
});

/**
 * 创建工艺路线
 * POST /api/v2/process-routes
 */
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const route = await processRouteService.createProcessRoute(data);
    res.json({
      success: true,
      data: route,
      message: '创建成功'
    });
  } catch (error) {
    logger.error('Create process route error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '创建工艺路线失败'
    });
  }
});

/**
 * 根据ID获取工艺路线
 * GET /api/v2/process-routes/:routeId
 */
router.get('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const route = await processRouteService.getProcessRouteById(routeId);
    res.json({
      success: true,
      data: route,
      message: '查询成功'
    });
  } catch (error) {
    logger.error('Get process route by id error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取工艺路线详情失败'
    });
  }
});

/**
 * 更新工艺路线
 * PUT /api/v2/process-routes/:routeId
 */
router.put('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const data = req.body;
    const route = await processRouteService.updateProcessRoute(routeId, data);
    res.json({
      success: true,
      data: route,
      message: '更新成功'
    });
  } catch (error) {
    logger.error('Update process route error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '更新工艺路线失败'
    });
  }
});

/**
 * 删除工艺路线
 * DELETE /api/v2/process-routes/:routeId
 */
router.delete('/:routeId', async (req, res) => {
  try {
    const { routeId } = req.params;
    const result = await processRouteService.deleteProcessRoute(routeId);
    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    logger.error('Delete process route error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '删除工艺路线失败'
    });
  }
});

module.exports = router;
