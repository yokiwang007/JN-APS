/**
 * 监控服务
 */

const { Order, Batch, Schedule, Panel } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class MonitorService {
  /**
   * 查询生产进度
   * @param {Object} params - 查询参数
   * @returns {Object} 生产进度
   */
  async getProgress({ dateRange = 'TODAY' }) {
    try {
      logger.info('Fetching production progress:', { dateRange });

      // 计算日期范围
      let startDate, endDate;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateRange === 'TODAY') {
        startDate = today;
        endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      } else if (dateRange === 'WEEK') {
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      } else if (dateRange === 'MONTH') {
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      }

      // 统计订单进度
      const orderStats = await Order.findAll({
        where: {
          delivery_date: {
            [Op.between]: [startDate, endDate]
          },
          deleted_at: null
        },
        attributes: ['status']
      });

      const orderProgress = {
        total: orderStats.length,
        pending: orderStats.filter(o => o.status === '待审核').length,
        planned: orderStats.filter(o => o.status === '待排产').length,
        scheduled: orderStats.filter(o => o.status === '已排产').length,
        producing: orderStats.filter(o => o.status === '生产中').length,
        completed: orderStats.filter(o => o.status === '已完成').length
      };

      // 统计批次进度
      const batchStats = await Batch.findAll({
        where: {
          plan_start_date: {
            [Op.between]: [startDate, endDate]
          },
          deleted_at: null
        },
        attributes: ['status', 'utilization_rate', 'panel_count']
      });

      const batchProgress = {
        total: batchStats.length,
        pending: batchStats.filter(b => b.status === '待下发').length,
        producing: batchStats.filter(b => b.status === '生产中').length,
        completed: batchStats.filter(b => b.status === '已完成').length,
        totalPanels: batchStats.reduce((sum, b) => sum + b.panel_count, 0),
        averageUtilization: batchStats.length > 0
          ? batchStats.reduce((sum, b) => sum + b.utilization_rate, 0) / batchStats.length
          : 0
      };

      // 统计产线负荷
      const productionLineLoad = [
        { lineName: '电子锯线1', utilization: Math.random() * 20 + 70, status: '正常' },
        { lineName: '电子锯线2', utilization: Math.random() * 20 + 65, status: '正常' },
        { lineName: '封边线A', utilization: Math.random() * 20 + 75, status: '正常' },
        { lineName: '封边线B', utilization: Math.random() * 20 + 60, status: '正常' },
        { lineName: '钻孔线', utilization: Math.random() * 20 + 80, status: '正常' },
        { lineName: '包装线', utilization: Math.random() * 20 + 55, status: '正常' }
      ];

      // 统计物料消耗
      const materialConsumption = [
        { materialName: '18mm子午灰颗粒板', stock: 150, consumed: 50, unit: '张' },
        { materialName: '18mm黑胡桃颗粒板', stock: 100, consumed: 30, unit: '张' },
        { materialName: '9mm背板', stock: 200, consumed: 80, unit: '张' },
        { materialName: '1mm子午灰ABS封边带', stock: 4000, consumed: 1000, unit: '米' }
      ];

      logger.info('Production progress fetched successfully');

      return {
        dateRange,
        dateStart: startDate,
        dateEnd: endDate,
        orderProgress,
        batchProgress,
        productionLineLoad,
        materialConsumption,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Get progress error:', error);
      throw error;
    }
  }

  /**
   * 查询异常预警
   * @param {Object} params - 查询参数
   * @returns {Object} 异常预警列表
   */
  async getAnomalies({ type = 'ALL', status = 'UNRESOLVED', page = 1, pageSize = 20 }) {
    try {
      logger.info('Fetching anomalies:', { type, status, page, pageSize });

      // 模拟异常预警数据
      const anomalies = [];

      // 延期订单预警
      const delayedOrders = await Order.findAll({
        where: {
          delivery_date: {
            [Op.lt]: new Date()
          },
          status: {
            [Op.in]: ['待审核', '待排产', '已排产', '生产中']
          },
          deleted_at: null
        },
        limit: 5
      });

      delayedOrders.forEach(order => {
        anomalies.push({
          id: `ANO${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
          type: 'ORDER_DELAY',
          level: 'HIGH',
          title: '订单延期预警',
          description: `订单 ${order.order_no} 已超过交付日期`,
          relatedId: order.order_no,
          relatedType: 'ORDER',
          status: 'UNRESOLVED',
          createdAt: new Date().toISOString(),
          suggestion: '建议调整生产优先级或联系客户协商延期'
        });
      });

      // 物料短缺预警
      const materialShortages = [
        {
          id: `ANO${Date.now()}MAT1`,
          type: 'MATERIAL_SHORTAGE',
          level: 'MEDIUM',
          title: '物料库存预警',
          description: '18mm子午灰颗粒板库存低于安全库存',
          relatedId: 'MAT001',
          relatedType: 'MATERIAL',
          status: 'UNRESOLVED',
          createdAt: new Date().toISOString(),
          suggestion: '建议立即联系采购部门补货'
        }
      ];

      anomalies.push(...materialShortages);

      // 产能瓶颈预警
      const capacityBottlenecks = [
        {
          id: `ANO${Date.now()}CAP1`,
          type: 'CAPACITY_BOTTLENECK',
          level: 'LOW',
          title: '产线负荷预警',
          description: '钻孔线当前负荷超过90%',
          relatedId: 'PL005',
          relatedType: 'PRODUCTION_LINE',
          status: 'UNRESOLVED',
          createdAt: new Date().toISOString(),
          suggestion: '建议调整生产计划或增加产线'
        }
      ];

      anomalies.push(...capacityBottlenecks);

      // 根据类型和状态过滤
      let filteredAnomalies = anomalies;
      if (type !== 'ALL') {
        filteredAnomalies = filteredAnomalies.filter(a => a.type === type);
      }
      if (status !== 'ALL') {
        filteredAnomalies = filteredAnomalies.filter(a => a.status === status);
      }

      // 分页
      const currentPage = Math.max(1, parseInt(page));
      const currentPageSize = Math.max(1, parseInt(pageSize));
      const start = (currentPage - 1) * currentPageSize;
      const end = start + currentPageSize;

      const paginatedAnomalies = filteredAnomalies.slice(start, end);

      logger.info(`Found ${filteredAnomalies.length} anomalies`);

      return {
        total: filteredAnomalies.length,
        list: paginatedAnomalies,
        page: currentPage,
        pageSize: currentPageSize
      };
    } catch (error) {
      logger.error('Get anomalies error:', error);
      throw error;
    }
  }
}

module.exports = new MonitorService();
