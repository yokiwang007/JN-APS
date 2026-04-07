/**
 * 产能服务
 */

const { ProductionLine, ProcessRoute, Material } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class CapacityService {
  /**
   * 查询产线列表
   * @param {Object} params - 查询参数
   * @returns {Object} 产线列表
   */
  async getProductionLines({ status, lineType, workshop, page = 1, pageSize = 20 }) {
    try {
      logger.info('Fetching production lines with params:', { status, lineType, workshop, page, pageSize });

      const where = { deleted_at: null };

      if (status) {
        where.status = status;
      }
      if (lineType) {
        where.line_type = lineType;
      }
      if (workshop) {
        where.workshop = {
          [Op.like]: `%${workshop}%`
        };
      }

      const currentPage = Math.max(1, parseInt(page));
      const currentPageSize = Math.max(1, parseInt(pageSize));
      const offset = (currentPage - 1) * currentPageSize;

      const { count, rows } = await ProductionLine.findAndCountAll({
        where,
        limit: currentPageSize,
        offset,
        order: [['line_id', 'ASC']]
      });

      const productionLines = rows.map(line => this.formatProductionLine(line));

      logger.info(`Found ${count} production lines`);

      return {
        total: count,
        list: productionLines,
        page: currentPage,
        pageSize: currentPageSize
      };
    } catch (error) {
      logger.error('Get production lines error:', error);
      throw error;
    }
  }

  /**
   * 创建产线
   * @param {Object} data - 产线数据
   * @returns {Object} 创建的产线
   */
  async createProductionLine(data) {
    try {
      logger.info('Creating production line:', data);

      // 生成产线编号
      const lineId = data.lineId || this.generateLineId(data.lineType);

      // 创建产线
      const line = await ProductionLine.create({
        line_id: lineId,
        line_name: data.lineName,
        line_type: data.lineType,
        standard_capacity: data.standardCapacity,
        status: data.status || '正常',
        workshop: data.workshop,
        main_equipment: data.mainEquipments ? data.mainEquipments.join(',') : ''
      });

      logger.info(`Production line created successfully: ${lineId}`);

      return this.formatProductionLine(line);
    } catch (error) {
      logger.error('Create production line error:', error);
      throw error;
    }
  }

  /**
   * 生成产线编号
   * @param {string} lineType - 产线类型
   * @returns {string} 产线编号
   */
  generateLineId(lineType) {
    const prefixMap = {
      '开料线': 'SAW',
      '封边线': 'EDG',
      '钻孔线': 'DRILL',
      '包装线': 'PKG'
    };
    const prefix = prefixMap[lineType] || 'LINE';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  }

  /**
   * 更新产线
   * @param {string} lineId - 产线ID
   * @param {Object} data - 更新数据
   * @returns {Object} 更新后的产线
   */
  async updateProductionLine(lineId, data) {
    try {
      logger.info(`Updating production line: ${lineId}`);

      const line = await ProductionLine.findOne({
        where: {
          line_id: lineId,
          deleted_at: null
        }
      });

      if (!line) {
        logger.warn(`Production line not found: ${lineId}`);
        throw new Error('产线不存在');
      }

      // 更新产线
      const updateData = {};
      if (data.lineName) updateData.line_name = data.lineName;
      if (data.lineType) updateData.line_type = data.lineType;
      if (data.standardCapacity !== undefined) updateData.standard_capacity = data.standardCapacity;
      if (data.status) updateData.status = data.status;
      if (data.workshop) updateData.workshop = data.workshop;
      if (data.mainEquipment) updateData.main_equipment = data.mainEquipment;

      await line.update(updateData);

      logger.info(`Production line updated successfully: ${lineId}`);

      return this.formatProductionLine(line);
    } catch (error) {
      logger.error('Update production line error:', error);
      throw error;
    }
  }

  /**
   * 删除产线
   * @param {string} lineId - 产线ID
   * @returns {boolean} 删除成功
   */
  async deleteProductionLine(lineId) {
    try {
      logger.info(`Deleting production line: ${lineId}`);

      const line = await ProductionLine.findOne({
        where: {
          line_id: lineId,
          deleted_at: null
        }
      });

      if (!line) {
        logger.warn(`Production line not found: ${lineId}`);
        throw new Error('产线不存在');
      }

      // 软删除
      await line.destroy();

      logger.info(`Production line deleted successfully: ${lineId}`);

      return true;
    } catch (error) {
      logger.error('Delete production line error:', error);
      throw error;
    }
  }

  /**
   * 查询工艺路线列表
   * @param {Object} params - 查询参数
   * @returns {Object} 工艺路线列表
   */
  async getProcessRoutes({ panelType, page = 1, pageSize = 20 }) {
    try {
      logger.info('Fetching process routes with params:', { panelType, page, pageSize });

      const where = { deleted_at: null };

      if (panelType) {
        where.panel_type = {
          [Op.like]: `%${panelType}%`
        };
      }

      const currentPage = Math.max(1, parseInt(page));
      const currentPageSize = Math.max(1, parseInt(pageSize));
      const offset = (currentPage - 1) * currentPageSize;

      const { count, rows } = await ProcessRoute.findAndCountAll({
        where,
        limit: currentPageSize,
        offset,
        order: [['route_id', 'ASC']]
      });

      const processRoutes = rows.map(route => this.formatProcessRoute(route));

      logger.info(`Found ${count} process routes`);

      return {
        total: count,
        list: processRoutes,
        page: currentPage,
        pageSize: currentPageSize
      };
    } catch (error) {
      logger.error('Get process routes error:', error);
      throw error;
    }
  }

  /**
   * 更新工艺路线
   * @param {string} routeId - 路线ID
   * @param {Object} data - 更新数据
   * @returns {Object} 更新后的工艺路线
   */
  async updateProcessRoute(routeId, data) {
    try {
      logger.info(`Updating process route: ${routeId}`);

      const route = await ProcessRoute.findOne({
        where: {
          route_id: routeId,
          deleted_at: null
        }
      });

      if (!route) {
        logger.warn(`Process route not found: ${routeId}`);
        throw new Error('工艺路线不存在');
      }

      // 更新工艺路线
      const updateData = {};
      if (data.panelType) updateData.panel_type = data.panelType;
      if (data.processSequence) updateData.process_sequence = data.processSequence;
      if (data.standardTime !== undefined) updateData.standard_time = data.standardTime;
      if (data.requiredEquipment) updateData.required_equipment = data.requiredEquipment;
      if (data.processRequirement !== undefined) updateData.process_requirement = data.processRequirement;

      await route.update(updateData);

      logger.info(`Process route updated successfully: ${routeId}`);

      return this.formatProcessRoute(route);
    } catch (error) {
      logger.error('Update process route error:', error);
      throw error;
    }
  }

  /**
   * 格式化产线数据
   * @param {Object} line - 产线对象
   * @returns {Object} 格式化后的产线
   */
  formatProductionLine(line) {
    const plain = line.get({ plain: true });
    return {
      lineId: plain.line_id,
      lineName: plain.line_name,
      lineType: plain.line_type,
      standardCapacity: plain.standard_capacity,
      standardCapacityArea: null, // 暂时设置为null，后续可以从数据库添加
      status: plain.status,
      workshop: plain.workshop,
      mainEquipments: plain.main_equipment ? plain.main_equipment.split(',') : [],
      mainEquipment: plain.main_equipment,
      createdAt: plain.created_at,
      updatedAt: plain.updated_at
    };
  }

  /**
   * 格式化工艺路线数据
   * @param {Object} route - 工艺路线对象
   * @returns {Object} 格式化后的工艺路线
   */
  formatProcessRoute(route) {
    const plain = route.get({ plain: true });
    return {
      routeId: plain.route_id,
      panelType: plain.panel_type,
      processSequence: plain.process_sequence,
      standardTime: plain.standard_time,
      requiredEquipment: plain.required_equipment,
      processRequirement: plain.process_requirement,
      createdAt: plain.created_at,
      updatedAt: plain.updated_at
    };
  }
}

module.exports = new CapacityService();
