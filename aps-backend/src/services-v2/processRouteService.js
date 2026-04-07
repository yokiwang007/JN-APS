const ProcessRoute = require('../models-v2/ProcessRoute');
const logger = require('../utils/logger');

class ProcessRouteService {
  /**
   * 获取所有工艺路线
   * @returns {Array} 工艺路线列表
   */
  async getProcessRoutes() {
    try {
      const routes = await ProcessRoute.findAll({
        where: {
          deleted_at: null
        },
        order: [['route_id', 'ASC']]
      });

      return routes.map(route => this.formatProcessRoute(route));
    } catch (error) {
      logger.error('Get process routes error:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取工艺路线
   * @param {string} routeId - 路线编号
   * @returns {Object} 工艺路线详情
   */
  async getProcessRouteById(routeId) {
    try {
      const route = await ProcessRoute.findOne({
        where: {
          route_id: routeId,
          deleted_at: null
        }
      });

      if (!route) {
        throw new Error('工艺路线不存在');
      }

      return this.formatProcessRoute(route);
    } catch (error) {
      logger.error('Get process route by id error:', error);
      throw error;
    }
  }

  /**
   * 创建工艺路线
   * @param {Object} data - 创建数据
   * @returns {Object} 创建后的工艺路线
   */
  async createProcessRoute(data) {
    try {
      logger.info(`Creating process route: ${data.routeId}`);

      // 检查是否已存在
      const existing = await ProcessRoute.findOne({
        where: {
          route_id: data.routeId,
          deleted_at: null
        }
      });

      if (existing) {
        throw new Error('工艺路线编号已存在');
      }

      // 创建数据
      const createData = {
        route_id: data.routeId,
        route_name: data.routeName,
        panel_type: data.panelType,
        process_sequence: Array.isArray(data.processSequence) 
          ? data.processSequence.join(',') 
          : data.processSequence,
        standard_time: data.standardWorkTime,
        production_cycle: data.productionCycle,
        delivery_commitment: data.deliveryCommitment,
        required_equipment: Array.isArray(data.requiredEquipments)
          ? data.requiredEquipments.join(',')
          : data.requiredEquipments,
        process_requirement: data.processRequirement || ''
      };

      const route = await ProcessRoute.create(createData);

      logger.info(`Process route created successfully: ${data.routeId}`);

      return this.getProcessRouteById(data.routeId);
    } catch (error) {
      logger.error('Create process route error:', error);
      throw error;
    }
  }

  /**
   * 删除工艺路线
   * @param {string} routeId - 路线编号
   * @returns {Object} 删除结果
   */
  async deleteProcessRoute(routeId) {
    try {
      logger.info(`Deleting process route: ${routeId}`);

      const route = await ProcessRoute.findOne({
        where: {
          route_id: routeId,
          deleted_at: null
        }
      });

      if (!route) {
        throw new Error('工艺路线不存在');
      }

      await route.destroy();

      logger.info(`Process route deleted successfully: ${routeId}`);

      return { success: true, message: '删除成功' };
    } catch (error) {
      logger.error('Delete process route error:', error);
      throw error;
    }
  }

  /**
   * 更新工艺路线
   * @param {string} routeId - 路线编号
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
        throw new Error('工艺路线不存在');
      }

      // 准备更新数据
      const updateData = {
        route_name: data.routeName,
        panel_type: data.panelType,
        process_sequence: Array.isArray(data.processSequence) 
          ? data.processSequence.join(',') 
          : data.processSequence,
        standard_time: data.standardWorkTime,
        production_cycle: data.productionCycle,
        delivery_commitment: data.deliveryCommitment,
        required_equipment: Array.isArray(data.requiredEquipments)
          ? data.requiredEquipments.join(',')
          : data.requiredEquipments,
        process_requirement: data.processRequirement || ''
      };

      await route.update(updateData);

      logger.info(`Process route updated successfully: ${routeId}`);

      return this.getProcessRouteById(routeId);
    } catch (error) {
      logger.error('Update process route error:', error);
      throw error;
    }
  }

  /**
   * 格式化工艺路线数据
   * @param {Object} route - 数据库记录
   * @returns {Object} 格式化后的数据
   */
  formatProcessRoute(route) {
    const plain = route.get({ plain: true });
    return {
      routeId: plain.route_id,
      routeName: plain.route_name,
      panelType: plain.panel_type,
      processSequence: plain.process_sequence ? plain.process_sequence.split(',') : [],
      standardWorkTime: plain.standard_time,
      productionCycle: plain.production_cycle,
      deliveryCommitment: plain.delivery_commitment,
      requiredEquipments: plain.required_equipment ? plain.required_equipment.split(',') : [],
      processRequirement: plain.process_requirement || ''
    };
  }
}

module.exports = new ProcessRouteService();
