/**
 * 订单服务
 */

const { Order, Panel } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class OrderService {
  /**
   * 查询订单列表
   * @param {Object} params - 查询参数
   * @returns {Object} 订单列表
   */
  async getOrders({ status, priority, customerName, page = 1, pageSize = 20 }) {
    try {
      logger.info('Fetching orders with params:', { status, priority, customerName, page, pageSize });

      const where = { deleted_at: null };

      if (status) {
        where.status = status;
      }
      if (priority) {
        where.priority = priority;
      }
      if (customerName) {
        where.customer_name = {
          [Op.like]: `%${customerName}%`
        };
      }

      const currentPage = Math.max(1, parseInt(page));
      const currentPageSize = Math.max(1, parseInt(pageSize));
      const offset = (currentPage - 1) * currentPageSize;

      const { count, rows } = await Order.findAndCountAll({
        where,
        limit: currentPageSize,
        offset,
        order: [['delivery_date', 'ASC']]
      });

      const orders = rows.map(order => this.formatOrder(order));

      logger.info(`Found ${count} orders`);

      return {
        total: count,
        list: orders,
        page: currentPage,
        pageSize: currentPageSize
      };
    } catch (error) {
      logger.error('Get orders error:', error);
      throw error;
    }
  }

  /**
   * 查询订单详情
   * @param {string} orderNo - 订单号
   * @returns {Object} 订单详情
   */
  async getOrderDetail(orderNo) {
    try {
      logger.info(`Fetching order detail: ${orderNo}`);

      const order = await Order.findOne({
        where: {
          order_no: orderNo,
          deleted_at: null
        },
        include: [
          {
            model: Panel,
            as: 'panels',
            where: { deleted_at: null },
            required: false
          }
        ]
      });

      if (!order) {
        logger.warn(`Order not found: ${orderNo}`);
        throw new Error('订单不存在');
      }

      const formattedOrder = this.formatOrder(order);
      formattedOrder.panels = order.panels?.map(panel => this.formatPanel(panel)) || [];

      logger.info(`Order detail fetched: ${orderNo}`);

      return formattedOrder;
    } catch (error) {
      logger.error('Get order detail error:', error);
      throw error;
    }
  }

  /**
   * 创建订单
   * @param {Object} data - 订单数据
   * @returns {Object} 创建的订单
   */
  async createOrder(data) {
    const { orderNo, customerName, productType, deliveryDate, priority, specialProcess, remark, panels } = data;

    try {
      logger.info(`Creating order: ${orderNo}`);

      // 检查订单号是否已存在
      const existingOrder = await Order.findOne({
        where: {
          order_no: orderNo,
          deleted_at: null
        }
      });

      if (existingOrder) {
        logger.warn(`Order already exists: ${orderNo}`);
        throw new Error('订单号已存在');
      }

      // 使用Sequelize事务
      const result = await Order.sequelize.transaction(async (t) => {
        // 创建订单
        const order = await Order.create(
          {
            order_no: orderNo,
            customer_name: customerName,
            product_type: productType,
            delivery_date: deliveryDate,
            status: '待审核',
            priority: priority || '普通',
            special_process: specialProcess,
            remark
          },
          { transaction: t }
        );

        // 创建板件
        if (panels && panels.length > 0) {
          const panelData = panels.map((panel, index) => ({
            panel_no: `BJ${orderNo}${String(index + 1).padStart(3, '0')}`,
            order_no: orderNo,
            panel_type: panel.panelType,
            length: panel.length,
            width: panel.width,
            thickness: panel.thickness,
            color: panel.color,
            material: panel.material,
            edge_requirement: panel.edgeRequirement,
            process_route: panel.processRoute
          }));

          await Panel.bulkCreate(panelData, { transaction: t });
        }

        return order;
      });

      logger.info(`Order created successfully: ${orderNo}`);

      return this.getOrderDetail(orderNo);
    } catch (error) {
      logger.error('Create order error:', error);
      throw error;
    }
  }

  /**
   * 更新订单
   * @param {string} orderNo - 订单号
   * @param {Object} data - 更新数据
   * @returns {Object} 更新后的订单
   */
  async updateOrder(orderNo, data) {
    try {
      logger.info(`Updating order: ${orderNo}`);

      const order = await Order.findOne({
        where: {
          order_no: orderNo,
          deleted_at: null
        }
      });

      if (!order) {
        logger.warn(`Order not found: ${orderNo}`);
        throw new Error('订单不存在');
      }

      // 检查订单状态是否允许更新
      if (['已排产', '生产中'].includes(order.status)) {
        logger.warn(`Cannot update order in status: ${order.status}`);
        throw new Error('订单已排产或生产中,无法更新');
      }

      // 更新订单
      const updateData = {};
      if (data.customerName) updateData.customer_name = data.customerName;
      if (data.productType) updateData.product_type = data.productType;
      if (data.deliveryDate) updateData.delivery_date = data.deliveryDate;
      if (data.priority) updateData.priority = data.priority;
      if (data.specialProcess !== undefined) updateData.special_process = data.specialProcess;
      if (data.remark !== undefined) updateData.remark = data.remark;

      await order.update(updateData);

      logger.info(`Order updated successfully: ${orderNo}`);

      return this.getOrderDetail(orderNo);
    } catch (error) {
      logger.error('Update order error:', error);
      throw error;
    }
  }

  /**
   * 删除订单
   * @param {string} orderNo - 订单号
   * @returns {Object} 删除结果
   */
  async deleteOrder(orderNo) {
    try {
      logger.info(`Deleting order: ${orderNo}`);

      const order = await Order.findOne({
        where: {
          order_no: orderNo,
          deleted_at: null
        }
      });

      if (!order) {
        logger.warn(`Order not found: ${orderNo}`);
        throw new Error('订单不存在');
      }

      // 检查订单状态是否允许删除
      if (['已排产', '生产中'].includes(order.status)) {
        logger.warn(`Cannot delete order in status: ${order.status}`);
        throw new Error('订单已排产或生产中,无法删除');
      }

      // 软删除
      await order.destroy();

      logger.info(`Order deleted successfully: ${orderNo}`);

      return { message: '删除成功' };
    } catch (error) {
      logger.error('Delete order error:', error);
      throw error;
    }
  }

  /**
   * 订单预处理
   * @param {Object} params - 预处理参数
   * @returns {Object} 预处理结果
   */
  async preprocessOrders({ orderPoolScope = 'TODAY', customOrderIds = [] }) {
    try {
      logger.info('Preprocessing orders:', { orderPoolScope, customOrderIds });

      let where = {
        status: '待审核',
        deleted_at: null
      };

      if (orderPoolScope === 'CUSTOM' && customOrderIds.length > 0) {
        where.order_no = {
          [Op.in]: customOrderIds
        };
      }

      const orders = await Order.findAll({
        where,
        include: [
          {
            model: Panel,
            as: 'panels',
            where: { deleted_at: null },
            required: false
          }
        ]
      });

      const qualifiedOrders = [];
      const unqualifiedOrders = [];

      // 模拟预处理逻辑
      for (const order of orders) {
        const isQualified = Math.random() > 0.2;

        if (isQualified) {
          await order.update({ status: '待排产' });

          qualifiedOrders.push({
            orderNo: order.order_no,
            customerName: order.customer_name,
            productType: order.product_type,
            deliveryDate: order.delivery_date,
            priority: order.priority,
            panelCount: order.panels?.length || 0,
            preprocessTime: new Date().toISOString(),
            executor: '系统'
          });
        } else {
          await order.update({ status: '审核失败' });

          const failureReasons = [
            { reason: '物料缺料', details: '18mm子午灰颗粒板库存不足', suggestion: '联系采购部门补货' },
            { reason: '拆单数据缺失', details: '订单缺少背板尺寸数据', suggestion: '联系设计部门补充拆单数据' },
            { reason: '信息不完整', details: '客户安装地址信息缺失', suggestion: '联系销售人员补全客户信息' }
          ];

          const reason = failureReasons[Math.floor(Math.random() * failureReasons.length)];

          unqualifiedOrders.push({
            orderNo: order.order_no,
            customerName: order.customer_name,
            productType: order.product_type,
            orderType: order.product_type,
            reason: reason.reason,
            details: reason.details,
            suggestion: reason.suggestion,
            checkTime: new Date().toISOString(),
            executor: '系统'
          });
        }
      }

      logger.info(`Preprocessing completed: ${orders.length} orders, ${qualifiedOrders.length} qualified, ${unqualifiedOrders.length} unqualified`);

      return {
        total: orders.length,
        qualifiedOrderCount: qualifiedOrders.length,
        unqualifiedOrderCount: unqualifiedOrders.length,
        qualifiedOrders,
        unqualifiedOrders
      };
    } catch (error) {
      logger.error('Preprocess orders error:', error);
      throw error;
    }
  }

  /**
   * 格式化订单数据
   * @param {Object} order - 订单对象
   * @returns {Object} 格式化后的订单
   */
  formatOrder(order) {
    const plain = order.get({ plain: true });
    return {
      orderNo: plain.order_no,
      customerName: plain.customer_name,
      productType: plain.product_type,
      deliveryDate: plain.delivery_date,
      status: plain.status,
      priority: plain.priority,
      specialProcess: plain.special_process,
      remark: plain.remark,
      createdAt: plain.created_at,
      updatedAt: plain.updated_at
    };
  }

  /**
   * 格式化板件数据
   * @param {Object} panel - 板件对象
   * @returns {Object} 格式化后的板件
   */
  formatPanel(panel) {
    const plain = panel.get({ plain: true });
    return {
      panelNo: plain.panel_no,
      orderNo: plain.order_no,
      batchNo: plain.batch_no,
      panelType: plain.panel_type,
      length: plain.length,
      width: plain.width,
      thickness: plain.thickness,
      color: plain.color,
      material: plain.material,
      edgeRequirement: plain.edge_requirement,
      processRoute: plain.process_route
    };
  }
}

module.exports = new OrderService();
