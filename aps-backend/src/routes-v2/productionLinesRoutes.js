/**
 * 产线管理API路由
 */

const express = require('express');
const router = express.Router();
const ProductionLine = require('../models/ProductionLine');
const logger = require('../utils/logger');

/**
 * @route GET /api/v2/production-lines
 * @desc 查询产线列表
 */
router.get('/production-lines', async (req, res) => {
  try {
    const params = req.query;
    logger.info('GET /api/v2/production-lines - Fetching production lines', params);

    const where = {};

    if (params.status) {
      where.status = params.status;
    }
    if (params.lineType) {
      where.line_type = params.lineType;
    }

    const lines = await ProductionLine.findAll({
      where,
      order: [['line_name', 'ASC']]
    });

    const productionLines = lines.map(line => ({
      lineId: line.line_id,
      lineName: line.line_name,
      lineType: line.line_type,
      standardCapacity: line.standard_capacity,
      standardCapacityArea: line.standard_capacity_area,
      status: line.status,
      workshop: line.workshop,
      mainEquipments: line.main_equipment ? line.main_equipment.split(',') : [],
      createdAt: line.created_at,
      updatedAt: line.updated_at
    }));

    res.status(200).json({
      success: true,
      data: productionLines
    });
  } catch (error) {
    logger.error('Get production lines error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route GET /api/v2/production-lines/:lineId
 * @desc 查询产线详情
 */
router.get('/production-lines/:lineId', async (req, res) => {
  try {
    const { lineId } = req.params;
    logger.info(`GET /api/v2/production-lines/${lineId} - Fetching production line detail`);

    const line = await ProductionLine.findOne({
      where: {
        line_id: lineId
      }
    });

    if (!line) {
      logger.warn(`Production line not found: ${lineId}`);
      res.status(404).json({
        success: false,
        message: '产线不存在'
      });
      return;
    }

    const productionLine = {
      lineId: line.line_id,
      lineName: line.line_name,
      lineType: line.line_type,
      standardCapacity: line.standard_capacity,
      standardCapacityArea: line.standard_capacity_area,
      status: line.status,
      workshop: line.workshop,
      mainEquipments: line.main_equipment ? line.main_equipment.split(',') : [],
      createdAt: line.created_at,
      updatedAt: line.updated_at
    };

    res.status(200).json({
      success: true,
      data: productionLine
    });
  } catch (error) {
    logger.error('Get production line detail error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route PUT /api/v2/production-lines/:lineId
 * @desc 更新产线信息
 */
router.put('/production-lines/:lineId', async (req, res) => {
  try {
    const { lineId } = req.params;
    const data = req.body;
    logger.info(`PUT /api/v2/production-lines/${lineId} - Updating production line`, data);

    const line = await ProductionLine.findOne({
      where: {
        line_id: lineId
      }
    });

    if (!line) {
      logger.warn(`Production line not found: ${lineId}`);
      res.status(404).json({
        success: false,
        message: '产线不存在'
      });
      return;
    }

    // 更新产线信息
    const updateData = {};
    if (data.lineName) updateData.line_name = data.lineName;
    if (data.lineType) updateData.line_type = data.lineType;
    if (data.standardCapacity !== undefined) updateData.standard_capacity = parseFloat(data.standardCapacity);
    if (data.standardCapacityArea !== undefined) updateData.standard_capacity_area = parseFloat(data.standardCapacityArea);
    if (data.status) updateData.status = data.status;
    if (data.workshop !== undefined) updateData.workshop = data.workshop;
    if (data.mainEquipments) updateData.main_equipment = Array.isArray(data.mainEquipments) ? data.mainEquipments.join(',') : data.mainEquipments;

    await line.update(updateData);

    const productionLine = {
      lineId: line.line_id,
      lineName: line.line_name,
      lineType: line.line_type,
      standardCapacity: line.standard_capacity,
      standardCapacityArea: line.standard_capacity_area,
      status: line.status,
      workshop: line.workshop,
      mainEquipments: line.main_equipment ? line.main_equipment.split(',') : [],
      createdAt: line.created_at,
      updatedAt: line.updated_at
    };

    res.status(200).json({
      success: true,
      data: productionLine,
      message: '产线更新成功'
    });
  } catch (error) {
    logger.error('Update production line error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route POST /api/v2/production-lines
 * @desc 创建产线
 */
router.post('/production-lines', async (req, res) => {
  try {
    const data = req.body;
    logger.info('POST /api/v2/production-lines - Creating production line', data);

    // 检查产线ID是否已存在
    const existingLine = await ProductionLine.findOne({
      where: {
        line_id: data.lineId
      }
    });

    if (existingLine) {
      res.status(400).json({
        success: false,
        message: '产线ID已存在'
      });
      return;
    }

    // 创建产线
    const line = await ProductionLine.create({
      line_id: data.lineId,
      line_name: data.lineName,
      line_type: data.lineType,
      standard_capacity: parseFloat(data.standardCapacity) || 0,
      standard_capacity_area: parseFloat(data.standardCapacityArea) || 0,
      status: data.status || '正常',
      workshop: data.workshop || '',
      main_equipment: Array.isArray(data.mainEquipments) ? data.mainEquipments.join(',') : (data.mainEquipments || '')
    });

    const productionLine = {
      lineId: line.line_id,
      lineName: line.line_name,
      lineType: line.line_type,
      standardCapacity: line.standard_capacity,
      standardCapacityArea: line.standard_capacity_area,
      status: line.status,
      workshop: line.workshop,
      mainEquipments: line.main_equipment ? line.main_equipment.split(',') : [],
      createdAt: line.created_at,
      updatedAt: line.updated_at
    };

    res.status(201).json({
      success: true,
      data: productionLine,
      message: '产线创建成功'
    });
  } catch (error) {
    logger.error('Create production line error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/v2/production-lines/:lineId
 * @desc 删除产线（软删除）
 */
router.delete('/production-lines/:lineId', async (req, res) => {
  try {
    const { lineId } = req.params;
    logger.info(`DELETE /api/v2/production-lines/${lineId} - Deleting production line`);

    const line = await ProductionLine.findOne({
      where: {
        line_id: lineId
      }
    });

    if (!line) {
      logger.warn(`Production line not found: ${lineId}`);
      res.status(404).json({
        success: false,
        message: '产线不存在'
      });
      return;
    }

    // 软删除
    await line.destroy();

    res.status(200).json({
      success: true,
      message: '产线删除成功'
    });
  } catch (error) {
    logger.error('Delete production line error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
