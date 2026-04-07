const express = require('express');
const router = express.Router();
const workpieceBillService = require('../services-v2/workpieceBillService');
const logger = require('../utils/logger');

/**
 * @route   GET /api/v2/workpiece-bills
 * @desc    获取工件清单列表
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const result = await workpieceBillService.getWorkpieceBillList(req.query);
    res.json({
      success: true,
      data: result,
      message: '查询成功'
    });
  } catch (error) {
    logger.error('Get workpiece bills error:', error);
    res.status(500).json({
      success: false,
      message: error.message || '查询工件清单失败'
    });
  }
});

/**
 * @route   GET /api/v2/workpiece-bills/:billNo
 * @desc    获取工件清单详情
 * @access  Private
 */
router.get('/:billNo', async (req, res) => {
  try {
    const result = await workpieceBillService.getWorkpieceBillDetail(req.params.billNo);
    res.json({
      success: true,
      data: result,
      message: '查询成功'
    });
  } catch (error) {
    logger.error('Get workpiece bill detail error:', error);
    res.status(error.message === '工件清单不存在' ? 404 : 500).json({
      success: false,
      message: error.message || '查询工件清单详情失败'
    });
  }
});

/**
 * @route   POST /api/v2/workpiece-bills
 * @desc    创建工件清单
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const result = await workpieceBillService.createWorkpieceBill(req.body);
    res.json({
      success: true,
      data: result,
      message: '工件清单创建成功'
    });
  } catch (error) {
    logger.error('Create workpiece bill error:', error);
    res.status(400).json({
      success: false,
      message: error.message || '创建工件清单失败'
    });
  }
});

/**
 * @route   PUT /api/v2/workpiece-bills/:billNo
 * @desc    更新工件清单
 * @access  Private
 */
router.put('/:billNo', async (req, res) => {
  try {
    const result = await workpieceBillService.updateWorkpieceBill(req.params.billNo, req.body);
    res.json({
      success: true,
      data: result,
      message: '工件清单更新成功'
    });
  } catch (error) {
    logger.error('Update workpiece bill error:', error);
    res.status(error.message === '工件清单不存在' ? 404 : 400).json({
      success: false,
      message: error.message || '更新工件清单失败'
    });
  }
});

/**
 * @route   DELETE /api/v2/workpiece-bills/:billNo
 * @desc    删除工件清单
 * @access  Private
 */
router.delete('/:billNo', async (req, res) => {
  try {
    const result = await workpieceBillService.deleteWorkpieceBill(req.params.billNo);
    res.json({
      success: true,
      data: result,
      message: '工件清单删除成功'
    });
  } catch (error) {
    logger.error('Delete workpiece bill error:', error);
    res.status(error.message === '工件清单不存在' ? 404 : 400).json({
      success: false,
      message: error.message || '删除工件清单失败'
    });
  }
});

module.exports = router;
