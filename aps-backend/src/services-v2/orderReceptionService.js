/**
 * 订单接收服务 (阶段1)
 * 负责从ERP系统接收销售订单
 */

const { ErpSalesOrder } = require('../models-v2');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class OrderReceptionService {
  /**
   * 创建销售订单
   * @param {Object} data - 订单数据
   * @returns {Object} 创建的订单
   */
  async createSalesOrder(data) {
    // 兼容前端字段名
    const orderId = data.orderId || data.orderNo || `ORD${Date.now().toString().slice(-6)}`;
    const customerName = data.customerName || '';
    const dueDate = data.deliveryDate || data.dueDate || '';
    const totalAmount = data.totalAmount || 0;
    const priority = data.priority === '普通' ? 3 : (data.priority === '紧急' ? 2 : (data.priority === '特急' ? 1 : 3));
    const fulfillmentRule = 'full';
    const organization = data.organization || '';
    const documentType = data.documentType || '';
    const orderType = data.orderType || '标准订单'; // 订单类型
    const salesman = data.salesman || data.creator || ''; // 创建人
    const creator = data.creator || '计划员-王斌'; // 当前登录用户
    const productType = data.productType || '';
    const specialProcess = data.specialProcess || '';
    const remark = data.remark || '';

    try {
      logger.info(`Creating sales order: ${orderId}`);

      // 检查订单号是否已存在
      const existingOrder = await ErpSalesOrder.findOne({
        where: {
          order_id: orderId,
          deleted_at: null
        }
      });

      if (existingOrder) {
        logger.warn(`Order already exists: ${orderId}`);
        throw new Error('订单号已存在');
      }

      // 创建销售订单
      const order = await ErpSalesOrder.create({
        order_id: orderId,
        organization,
        document_type: documentType,
        order_type: orderType,
        salesman,
        creator,
        customer_name: customerName,
        product_type: productType,
        due_date: dueDate,
        special_process: specialProcess,
        remark,
        total_amount: parseFloat(totalAmount) || 0,
        priority: parseInt(priority),
        fulfillment_rule: fulfillmentRule,
        status: '待审核'
      });

      logger.info(`Sales order created successfully: ${orderId}`);

      return this.formatOrder(order);
    } catch (error) {
      logger.error('Create sales order error:', error);
      throw error;
    }
  }

  /**
   * 查询销售订单列表
   * @param {Object} params - 查询参数
   * @returns {Object} 订单列表
   */
  async getSalesOrders({ status, customerName, page = 1, pageSize = 20 }) {
    try {
      logger.info('Fetching sales orders with params:', { status, customerName, page, pageSize });

      const where = { deleted_at: null };

      if (status) {
        where.status = status;
      }
      if (customerName) {
        where.customer_name = {
          [Op.like]: `%${customerName}%`
        };
      }

      const currentPage = Math.max(1, parseInt(page));
      const currentPageSize = Math.max(1, parseInt(pageSize));
      const offset = (currentPage - 1) * currentPageSize;

      const { count, rows } = await ErpSalesOrder.findAndCountAll({
        where,
        limit: currentPageSize,
        offset,
        order: [['due_date', 'ASC']]
      });

      const orders = rows.map(order => this.formatOrder(order));

      logger.info(`Found ${count} sales orders`);

      return {
        total: count,
        list: orders,
        page: currentPage,
        pageSize: currentPageSize
      };
    } catch (error) {
      logger.error('Get sales orders error:', error);
      throw error;
    }
  }

  /**
   * 查询销售订单详情
   * @param {string} orderId - 订单号
   * @returns {Object} 订单详情
   */
  async getSalesOrderDetail(orderId) {
    try {
      logger.info(`Fetching sales order detail: ${orderId}`);

      const order = await ErpSalesOrder.findOne({
        where: {
          order_id: orderId,
          deleted_at: null
        },
        include: [
          {
            model: require('../models-v2').ApsProductionOrder,
            as: 'productionOrders',
            required: false
          }
        ]
      });

      if (!order) {
        logger.warn(`Sales order not found: ${orderId}`);
        throw new Error('订单不存在');
      }

      const formattedOrder = this.formatOrder(order);
      formattedOrder.productionOrders = order.productionOrders?.map(po => this.formatProductionOrder(po)) || [];

      logger.info(`Sales order detail fetched: ${orderId}`);

      return formattedOrder;
    } catch (error) {
      logger.error('Get sales order detail error:', error);
      throw error;
    }
  }

  /**
   * 更新销售订单
   * @param {string} orderId - 订单号
   * @param {Object} data - 更新数据
   * @returns {Object} 更新后的订单
   */
  async updateSalesOrder(orderId, data) {
    try {
      logger.info(`Updating sales order: ${orderId}`);

      const order = await ErpSalesOrder.findOne({
        where: {
          order_id: orderId,
          deleted_at: null
        }
      });

      if (!order) {
        logger.warn(`Sales order not found: ${orderId}`);
        throw new Error('订单不存在');
      }

      // 检查订单状态是否允许更新
      if (['已排程', '生产中', '已完成'].includes(order.status)) {
        logger.warn(`Cannot update order in status: ${order.status}`);
        throw new Error('订单已开始处理,无法更新');
      }

      // 更新订单（兼容前端字段名）
      const updateData = {};
      if (data.customerName) updateData.customer_name = data.customerName;
      if (data.dueDate || data.deliveryDate) updateData.due_date = data.dueDate || data.deliveryDate;
      if (data.totalAmount !== undefined) updateData.total_amount = parseFloat(data.totalAmount);
      if (data.priority) {
        updateData.priority = data.priority === '普通' ? 3 : (data.priority === '紧急' ? 2 : (data.priority === '特急' ? 1 : 3));
      }
      if (data.organization !== undefined) updateData.organization = data.organization;
      if (data.documentType !== undefined) updateData.document_type = data.documentType;
      if (data.orderType !== undefined) updateData.order_type = data.orderType;
      if (data.salesman !== undefined) updateData.salesman = data.salesman;
      if (data.productType !== undefined) updateData.product_type = data.productType;
      if (data.specialProcess !== undefined) updateData.special_process = data.specialProcess;
      if (data.remark !== undefined) updateData.remark = data.remark;

      await order.update(updateData);

      logger.info(`Sales order updated successfully: ${orderId}`);

      return this.getSalesOrderDetail(orderId);
    } catch (error) {
      logger.error('Update sales order error:', error);
      throw error;
    }
  }

  /**
   * 删除销售订单
   * @param {string} orderId - 订单号
   * @returns {Object} 删除结果
   */
  async deleteSalesOrder(orderId) {
    try {
      logger.info(`Deleting sales order: ${orderId}`);

      const order = await ErpSalesOrder.findOne({
        where: {
          order_id: orderId,
          deleted_at: null
        }
      });

      if (!order) {
        logger.warn(`Sales order not found: ${orderId}`);
        throw new Error('订单不存在');
      }

      // 检查订单状态是否允许删除
      if (['已排程', '生产中', '已完成'].includes(order.status)) {
        logger.warn(`Cannot delete order in status: ${order.status}`);
        throw new Error('订单已开始处理,无法删除');
      }

      // 软删除
      await order.destroy();

      logger.info(`Sales order deleted successfully: ${orderId}`);

      return { message: '删除成功' };
    } catch (error) {
      logger.error('Delete sales order error:', error);
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
      orderNo: plain.order_id,  // 兼容前端
      orderId: plain.order_id,  // V2标准字段
      organization: plain.organization,  // 兼容前端
      documentType: plain.document_type,  // 兼容前端
      orderType: plain.order_type || '标准订单',  // 兼容前端
      customerName: plain.customer_name,
      salesman: plain.salesman,  // 兼容前端
      creator: plain.creator,  // 兼容前端
      productType: plain.product_type,  // 兼容前端
      deliveryDate: plain.due_date,  // 兼容前端
      dueDate: plain.due_date,  // V2标准字段
      status: plain.status,
      priority: plain.priority === 3 ? '普通' : (plain.priority === 2 ? '紧急' : '特急'),
      specialProcess: plain.special_process,  // 兼容前端
      remark: plain.remark,  // 兼容前端
      createdAt: plain.created_at,
      updatedAt: plain.updated_at
    };
  }

  /**
   * 格式化生产子订单数据
   * @param {Object} productionOrder - 生产子订单对象
   * @returns {Object} 格式化后的生产子订单
   */
  formatProductionOrder(productionOrder) {
    const plain = productionOrder.get({ plain: true });
    return {
      productionOrderId: plain.production_order_id,
      orderId: plain.order_id,
      processRoute: plain.process_route,
      totalPartCount: plain.total_part_count,
      material: plain.material,
      thickness: plain.thickness,
      color: plain.color,
      edgeBanding: plain.edge_banding,
      plannedDate: plain.planned_date,
      lineId: plain.line_id,
      status: plain.status
    };
  }
}

module.exports = new OrderReceptionService();
