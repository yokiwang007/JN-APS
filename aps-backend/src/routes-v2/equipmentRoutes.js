const express = require('express');
const router = express.Router();
const equipmentService = require('../services-v2/equipmentService');
const logger = require('../utils/logger');

router.get('/', async (req, res) => {
  try {
    const equipments = await equipmentService.getEquipments();
    res.json({ success: true, data: equipments, message: '查询成功' });
  } catch (error) {
    logger.error('Get equipments error:', error);
    res.status(500).json({ success: false, message: error.message || '获取设备列表失败' });
  }
});

router.post('/', async (req, res) => {
  try {
    const equipment = await equipmentService.createEquipment(req.body);
    res.json({ success: true, data: equipment, message: '创建成功' });
  } catch (error) {
    logger.error('Create equipment error:', error);
    res.status(500).json({ success: false, message: error.message || '创建设备失败' });
  }
});

router.put('/:equipmentId', async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const equipment = await equipmentService.updateEquipment(equipmentId, req.body);
    res.json({ success: true, data: equipment, message: '更新成功' });
  } catch (error) {
    logger.error('Update equipment error:', error);
    res.status(500).json({ success: false, message: error.message || '更新设备失败' });
  }
});

router.delete('/:equipmentId', async (req, res) => {
  try {
    const { equipmentId } = req.params;
    await equipmentService.deleteEquipment(equipmentId);
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    logger.error('Delete equipment error:', error);
    res.status(500).json({ success: false, message: error.message || '删除设备失败' });
  }
});

module.exports = router;
