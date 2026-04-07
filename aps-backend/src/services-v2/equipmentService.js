const Equipment = require('../models-v2/Equipment');
const logger = require('../utils/logger');

class EquipmentService {
  /**
   * 获取所有设备
   */
  async getEquipments() {
    try {
      const equipments = await Equipment.findAll({
        where: { deleted_at: null },
        order: [['equipment_id', 'ASC']]
      });
      return equipments.map(e => this.formatEquipment(e));
    } catch (error) {
      logger.error('Get equipments error:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取设备
   */
  async getEquipmentById(equipmentId) {
    try {
      const equipment = await Equipment.findOne({
        where: { equipment_id: equipmentId, deleted_at: null }
      });
      if (!equipment) throw new Error('设备不存在');
      return this.formatEquipment(equipment);
    } catch (error) {
      logger.error('Get equipment by id error:', error);
      throw error;
    }
  }

  /**
   * 创建设备
   */
  async createEquipment(data) {
    try {
      logger.info(`Creating equipment: ${data.equipmentId}`);
      const existing = await Equipment.findOne({
        where: { equipment_id: data.equipmentId, deleted_at: null }
      });
      if (existing) throw new Error('设备编号已存在');

      const equipment = await Equipment.create({
        equipment_id: data.equipmentId,
        equipment_name: data.equipmentName,
        type: data.type,
        precision_level: data.precision,
        supported_processes: Array.isArray(data.supportedProcesses) 
          ? data.supportedProcesses.join(',') : data.supportedProcesses,
        status: data.status || '正常',
        load_rate: data.loadRate || 0
      });

      logger.info(`Equipment created successfully: ${data.equipmentId}`);
      return this.getEquipmentById(data.equipmentId);
    } catch (error) {
      logger.error('Create equipment error:', error);
      throw error;
    }
  }

  /**
   * 更新设备
   */
  async updateEquipment(equipmentId, data) {
    try {
      logger.info(`Updating equipment: ${equipmentId}`);
      const equipment = await Equipment.findOne({
        where: { equipment_id: equipmentId, deleted_at: null }
      });
      if (!equipment) throw new Error('设备不存在');

      await equipment.update({
        equipment_name: data.equipmentName,
        type: data.type,
        precision_level: data.precision,
        supported_processes: Array.isArray(data.supportedProcesses) 
          ? data.supportedProcesses.join(',') : data.supportedProcesses,
        status: data.status,
        load_rate: data.loadRate
      });

      logger.info(`Equipment updated successfully: ${equipmentId}`);
      return this.getEquipmentById(equipmentId);
    } catch (error) {
      logger.error('Update equipment error:', error);
      throw error;
    }
  }

  /**
   * 删除设备
   */
  async deleteEquipment(equipmentId) {
    try {
      logger.info(`Deleting equipment: ${equipmentId}`);
      const equipment = await Equipment.findOne({
        where: { equipment_id: equipmentId, deleted_at: null }
      });
      if (!equipment) throw new Error('设备不存在');

      await equipment.destroy();
      logger.info(`Equipment deleted successfully: ${equipmentId}`);
      return { success: true, message: '删除成功' };
    } catch (error) {
      logger.error('Delete equipment error:', error);
      throw error;
    }
  }

  /**
   * 格式化设备数据
   */
  formatEquipment(equipment) {
    const plain = equipment.get({ plain: true });
    return {
      equipmentId: plain.equipment_id,
      equipmentName: plain.equipment_name,
      type: plain.type,
      precision: plain.precision_level,
      supportedProcesses: plain.supported_processes ? plain.supported_processes.split(',') : [],
      status: plain.status,
      loadRate: plain.load_rate
    };
  }
}

module.exports = new EquipmentService();
