/**
 * 粗排程服务 (阶段3)
 * 负责基于倒排计划,确定计划日期和产线分配
 */

const { ApsProductionOrder, ApsScheduleTask, SysWorkCenter, ErpSalesOrder } = require('../models-v2');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class CoarseSchedulingService {
  /**
   * 执行粗排程
   * @param {Object} params - 排程参数
   * @returns {Object} 排程结果
   */
  async scheduleCoarse(params) {
    try {
      logger.info('Starting coarse scheduling:', params);

      const { orderIds, productionDays = 10, fulfillmentBufferDays = 2 } = params;

      // 查询待排程的生产子订单
      const where = {
        status: '待排程',
        deleted_at: null
      };

      if (orderIds && orderIds.length > 0) {
        where.order_id = { [Op.in]: orderIds };
      }

      const productionOrders = await ApsProductionOrder.findAll({
        where,
        include: [
          {
            model: ErpSalesOrder,
            as: 'salesOrder',
            required: true
          }
        ],
        order: [
          [{ model: ErpSalesOrder, as: 'salesOrder' }, 'priority', 'ASC'],
          [{ model: ErpSalesOrder, as: 'salesOrder' }, 'due_date', 'ASC']
        ]
      });

      if (productionOrders.length === 0) {
        logger.info('No production orders to schedule');
        return { message: '没有待排程的生产子订单' };
      }

      // 查询工作中心信息
      const workCenters = await SysWorkCenter.findAll({
        where: { status: '正常', deleted_at: null }
      });

      const workCenterMap = {};
      workCenters.forEach(wc => {
        workCenterMap[wc.line_name] = wc;
      });

      // 执行排程
      const scheduleResults = [];
      for (const po of productionOrders) {
        const result = await this.scheduleProductionOrder(po, workCenterMap, fulfillmentBufferDays);
        scheduleResults.push(result);
      }

      logger.info(`Coarse scheduling completed: ${scheduleResults.length} orders scheduled`);

      return {
        total: scheduleResults.length,
        schedules: scheduleResults
      };
    } catch (error) {
      logger.error('Coarse scheduling error:', error);
      throw error;
    }
  }

  /**
   * 为单个生产子订单排程
   * @param {Object} productionOrder - 生产子订单
   * @param {Object} workCenterMap - 工作中心映射
   * @param {number} fulfillmentBufferDays - 齐套缓冲天数
   * @returns {Object} 排程结果
   */
  async scheduleProductionOrder(productionOrder, workCenterMap, fulfillmentBufferDays) {
    try {
      const salesOrder = productionOrder.salesOrder;

      // 倒排计划计算
      const scheduleDates = this.calculateBackwardSchedule(
        salesOrder.due_date,
        fulfillmentBufferDays
      );

      // 分配产线
      const lineId = this.assignLine(productionOrder.process_route, workCenterMap);

      // 使用事务创建排程任务
      const result = await ApsProductionOrder.sequelize.transaction(async (t) => {
        // 更新生产子订单
        await productionOrder.update({
          planned_date: scheduleDates.plannedDate,
          line_id: lineId,
          status: '已排程'
        }, { transaction: t });

        // 创建排程任务
        const task = await ApsScheduleTask.create({
          task_id: `TASK${productionOrder.production_order_id}`,
          production_order_id: productionOrder.production_order_id,
          planned_start_date: scheduleDates.plannedStartDate,
          planned_end_date: scheduleDates.plannedEndDate,
          line_id: lineId,
          priority: salesOrder.priority,
          schedule_status: '已排定'
        }, { transaction: t });

        return {
          productionOrderId: productionOrder.production_order_id,
          orderId: productionOrder.order_id,
          processRoute: productionOrder.process_route,
          plannedDate: scheduleDates.plannedDate,
          plannedStartDate: scheduleDates.plannedStartDate,
          plannedEndDate: scheduleDates.plannedEndDate,
          lineId: lineId,
          priority: salesOrder.priority
        };
      });

      return result;
    } catch (error) {
      logger.error('Schedule production order error:', error);
      throw error;
    }
  }

  /**
   * 倒排计划计算
   * @param {string} dueDate - 交期
   * @param {number} fulfillmentBufferDays - 齐套缓冲天数
   * @returns {Object} 计划日期
   */
  calculateBackwardSchedule(dueDate, fulfillmentBufferDays) {
    const due = new Date(dueDate);

    // 最迟完工日 = 交期 - 齐套缓冲期
    const latestFinishDate = new Date(due);
    latestFinishDate.setDate(due.getDate() - fulfillmentBufferDays);

    // 最迟开工日 = 最迟完工日 - 生产周期(假设1天)
    const latestStartDate = new Date(latestFinishDate);
    latestStartDate.setDate(latestFinishDate.getDate() - 1);

    // 计划生产日 = 最迟开工日
    const plannedDate = latestStartDate;

    return {
      plannedDate: this.formatDate(plannedDate),
      plannedStartDate: this.formatDate(latestStartDate),
      plannedEndDate: this.formatDate(latestFinishDate)
    };
  }

  /**
   * 分配产线
   * @param {string} processRoute - 工艺路线
   * @param {Object} workCenterMap - 工作中心映射
   * @returns {string} 产线ID
   */
  assignLine(processRoute, workCenterMap) {
    // 工艺路线到产线的映射
    const routeToLineMap = {
      '标准柜体线': ['LINE001', 'LINE002'],
      '吸塑门板线': ['LINE003'],
      '背板线': ['LINE004'],
      '吸塑线': ['LINE005'],
      '包装线': ['LINE006']
    };

    const possibleLines = routeToLineMap[processRoute] || ['LINE001'];

    // 简单策略:选择第一个可用产线
    // 实际应用中应该考虑产线负载、产能等因素
    return possibleLines[0];
  }

  /**
   * 查询排程任务列表
   * @param {Object} params - 查询参数
   * @returns {Object} 排程任务列表
   */
  async getScheduleTasks({ status, lineId, startDate, endDate, page = 1, pageSize = 20 }) {
    try {
      logger.info('Fetching schedule tasks with params:', { status, lineId, startDate, endDate, page, pageSize });

      const where = { deleted_at: null };

      if (status) {
        where.schedule_status = status;
      }
      if (lineId) {
        where.line_id = lineId;
      }
      if (startDate) {
        where.planned_start_date = { ...where.planned_start_date, [Op.gte]: startDate };
      }
      if (endDate) {
        where.planned_end_date = { ...where.planned_end_date, [Op.lte]: endDate };
      }

      const currentPage = Math.max(1, parseInt(page));
      const currentPageSize = Math.max(1, parseInt(pageSize));
      const offset = (currentPage - 1) * currentPageSize;

      const { count, rows } = await ApsScheduleTask.findAndCountAll({
        where,
        limit: currentPageSize,
        offset,
        order: [['planned_start_date', 'ASC']],
        include: [
          {
            model: ApsProductionOrder,
            as: 'productionOrder',
            include: [
              {
                model: ErpSalesOrder,
                as: 'salesOrder',
                attributes: ['order_id', 'customer_name', 'due_date']
              }
            ]
          }
        ]
      });

      const tasks = rows.map(task => this.formatScheduleTask(task));

      logger.info(`Found ${count} schedule tasks`);

      return {
        total: count,
        list: tasks,
        page: currentPage,
        pageSize: currentPageSize
      };
    } catch (error) {
      logger.error('Get schedule tasks error:', error);
      throw error;
    }
  }

  /**
   * 更新排程任务
   * @param {string} taskId - 任务ID
   * @param {Object} data - 更新数据
   * @returns {Object} 更新后的任务
   */
  async updateScheduleTask(taskId, data) {
    try {
      logger.info(`Updating schedule task: ${taskId}`);

      const task = await ApsScheduleTask.findOne({
        where: {
          task_id: taskId,
          deleted_at: null
        },
        include: [
          {
            model: ApsProductionOrder,
            as: 'productionOrder'
          }
        ]
      });

      if (!task) {
        logger.warn(`Schedule task not found: ${taskId}`);
        throw new Error('排程任务不存在');
      }

      // 检查任务状态是否允许更新
      if (task.schedule_status === '已揉单') {
        logger.warn(`Cannot update task in status: ${task.schedule_status}`);
        throw new Error('任务已揉单,无法更新');
      }

      // 更新任务
      const updateData = {};
      if (data.plannedStartDate) updateData.planned_start_date = data.plannedStartDate;
      if (data.plannedEndDate) updateData.planned_end_date = data.plannedEndDate;
      if (data.lineId) updateData.line_id = data.lineId;
      if (data.priority) updateData.priority = parseInt(data.priority);

      await task.update(updateData);

      // 同步更新生产子订单
      if (task.productionOrder) {
        await task.productionOrder.update({
          planned_date: data.plannedStartDate || task.planned_start_date,
          line_id: data.lineId || task.line_id
        });
      }

      logger.info(`Schedule task updated successfully: ${taskId}`);

      return this.getScheduleTaskDetail(taskId);
    } catch (error) {
      logger.error('Update schedule task error:', error);
      throw error;
    }
  }

  /**
   * 查询排程任务详情
   * @param {string} taskId - 任务ID
   * @returns {Object} 任务详情
   */
  async getScheduleTaskDetail(taskId) {
    try {
      logger.info(`Fetching schedule task detail: ${taskId}`);

      const task = await ApsScheduleTask.findOne({
        where: {
          task_id: taskId,
          deleted_at: null
        },
        include: [
          {
            model: ApsProductionOrder,
            as: 'productionOrder',
            include: [
              {
                model: ErpSalesOrder,
                as: 'salesOrder'
              }
            ]
          }
        ]
      });

      if (!task) {
        logger.warn(`Schedule task not found: ${taskId}`);
        throw new Error('排程任务不存在');
      }

      return this.formatScheduleTask(task);
    } catch (error) {
      logger.error('Get schedule task detail error:', error);
      throw error;
    }
  }

  /**
   * 格式化排程任务
   * @param {Object} task - 排程任务对象
   * @returns {Object} 格式化后的任务
   */
  formatScheduleTask(task) {
    const plain = task.get({ plain: true });
    return {
      taskId: plain.task_id,
      productionOrderId: plain.production_order_id,
      plannedStartDate: plain.planned_start_date,
      plannedEndDate: plain.planned_end_date,
      lineId: plain.line_id,
      priority: plain.priority,
      scheduleStatus: plain.schedule_status,
      productionOrder: plain.productionOrder ? {
        productionOrderId: plain.productionOrder.production_order_id,
        orderId: plain.productionOrder.order_id,
        processRoute: plain.productionOrder.process_route,
        totalPartCount: plain.productionOrder.total_part_count,
        status: plain.productionOrder.status
      } : null,
      salesOrder: plain.productionOrder?.salesOrder ? {
        orderId: plain.productionOrder.salesOrder.order_id,
        customerName: plain.productionOrder.salesOrder.customer_name,
        dueDate: plain.productionOrder.salesOrder.due_date
      } : null,
      createdAt: plain.created_at,
      updatedAt: plain.updated_at
    };
  }

  /**
   * 格式化日期
   * @param {Date} date - 日期对象
   * @returns {string} 格式化后的日期字符串
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

module.exports = new CoarseSchedulingService();
