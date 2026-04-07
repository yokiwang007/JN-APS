const WorkpieceBill = require('../models-v2/WorkpieceBill');
const WorkpieceBillDetail = require('../models-v2/WorkpieceBillDetail');
const ErpSalesOrder = require('../models-v2/ErpSalesOrder');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class WorkpieceBillService {
  /**
   * 获取工件清单列表
   * @param {Object} params - 查询参数
   * @returns {Object} 工件清单列表
   */
  async getWorkpieceBillList(params = {}) {
    try {
      const {
        page = 1,
        pageSize = 20,
        orderId,
        organization,
        orderType,
        customerName,
        status,
        startDate,
        endDate
      } = params;

      const where = { deleted_at: null };

      if (orderId) where.order_id = orderId;
      if (organization) where.organization = organization;
      if (orderType) where.order_type = orderType;
      if (customerName) where.customer_name = { [Op.like]: `%${customerName}%` };
      if (status) where.status = status;
      if (startDate && endDate) {
        where.split_date = {
          [Op.between]: [startDate, endDate]
        };
      }

      const { count, rows } = await WorkpieceBill.findAndCountAll({
        where,
        limit: parseInt(pageSize),
        offset: (parseInt(page) - 1) * parseInt(pageSize),
        order: [['created_at', 'DESC']]
      });

      // 转换为前端格式
      const list = rows.map(bill => this.formatWorkpieceBill(bill));

      return {
        total: count,
        list,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      };
    } catch (error) {
      logger.error('Get workpiece bill list error:', error);
      throw error;
    }
  }

  /**
   * 根据订单创建工件清单
   * @param {Object} data - 工件清单数据
   * @returns {Object} 创建的工件清单
   */
  async createWorkpieceBill(data) {
    try {
      logger.info(`Creating workpiece bill for order: ${data.orderId}`);

      // 检查订单是否存在
      const order = await ErpSalesOrder.findOne({
        where: {
          order_id: data.orderId,
          deleted_at: null
        }
      });

      if (!order) {
        logger.warn(`Order not found: ${data.orderId}`);
        throw new Error('订单不存在');
      }

      // 检查是否已存在工件清单
      const existingBill = await WorkpieceBill.findOne({
        where: {
          order_id: data.orderId,
          deleted_at: null
        }
      });

      if (existingBill) {
        logger.warn(`Workpiece bill already exists for order: ${data.orderId}`);
        throw new Error('该订单已存在工件清单');
      }

      // 生成单据号
      const billNo = data.billNo || `WB${Date.now().toString().slice(-6)}`;

      // 创建表头
      const bill = await WorkpieceBill.create({
        bill_no: billNo,
        order_id: data.orderId,
        organization: order.organization,
        order_type: order.order_type,
        customer_name: order.customer_name,
        order_date: order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : null,
        due_date: order.due_date,
        product_name: order.product_type,
        splitter: data.splitter || '系统',
        split_date: data.splitDate || new Date().toISOString().split('T')[0],
        workpiece_count: data.details ? data.details.length : 0,
        status: '待处理',
        remark: data.remark || ''
      });

      // 创建表体
      if (data.details && Array.isArray(data.details)) {
        for (const detail of data.details) {
          await WorkpieceBillDetail.create({
            bill_id: bill.id,
            order_id: data.orderId,
            panel_no: detail.panelNo,
            panel_name: detail.panelName,
            panel_type: detail.panelType,
            item_type: detail.itemType,
            length: detail.length,
            width: detail.width,
            thickness: detail.thickness,
            color: detail.color,
            material: detail.material,
            edge_requirement: detail.edgeRequirement,
            area: detail.area,
            quantity: detail.quantity || 1,
            process_route: Array.isArray(detail.processRoute) ? JSON.stringify(detail.processRoute) : null
          });
        }
      }

      logger.info(`Workpiece bill created successfully: ${billNo}`);

      return this.getWorkpieceBillDetail(billNo);
    } catch (error) {
      logger.error('Create workpiece bill error:', error);
      throw error;
    }
  }

  /**
   * 获取工件清单详情
   * @param {string} billNo - 单据号
   * @returns {Object} 工件清单详情
   */
  async getWorkpieceBillDetail(billNo) {
    try {
      const bill = await WorkpieceBill.findOne({
        where: {
          bill_no: billNo
        }
      });

      if (!bill) {
        logger.warn(`Workpiece bill not found: ${billNo}`);
        throw new Error('工件清单不存在');
      }

      // 获取表体明细
      const details = await WorkpieceBillDetail.findAll({
        where: {
          bill_id: bill.id
        },
        order: [['id', 'ASC']],
        paranoid: false  // 不检查 deleted_at 字段
      });

      const formattedDetails = details.map(detail => this.formatWorkpieceBillDetail(detail));

      return {
        ...this.formatWorkpieceBill(bill),
        details: formattedDetails
      };
    } catch (error) {
      logger.error('Get workpiece bill detail error:', error);
      throw error;
    }
  }

  /**
   * 更新工件清单
   * @param {string} billNo - 单据号
   * @param {Object} data - 更新数据
   * @returns {Object} 更新后的工件清单
   */
  async updateWorkpieceBill(billNo, data) {
    try {
      logger.info(`Updating workpiece bill: ${billNo}`);

      const bill = await WorkpieceBill.findOne({
        where: {
          bill_no: billNo,
          deleted_at: null
        }
      });

      if (!bill) {
        logger.warn(`Workpiece bill not found: ${billNo}`);
        throw new Error('工件清单不存在');
      }

      // 检查状态是否允许更新
      if (['已处理', '已完成'].includes(bill.status)) {
        logger.warn(`Cannot update workpiece bill in status: ${bill.status}`);
        throw new Error('工件清单已处理,无法更新');
      }

      // 更新表头
      const updateData = {};
      if (data.splitter !== undefined) updateData.splitter = data.splitter;
      if (data.splitDate !== undefined) updateData.split_date = data.splitDate;
      if (data.remark !== undefined) updateData.remark = data.remark;

      await bill.update(updateData);

      // 更新表体
      if (data.details && Array.isArray(data.details)) {
        // 删除原有明细（强制删除，不使用软删除）
        await WorkpieceBillDetail.destroy({
          where: { bill_id: bill.id },
          force: true
        });

        // 重新创建明细
        for (const detail of data.details) {
          await WorkpieceBillDetail.create({
            bill_id: bill.id,
            order_id: bill.order_id,
            panel_no: detail.panelNo,
            panel_name: detail.panelName,
            panel_type: detail.panelType,
            item_type: detail.itemType,
            length: detail.length,
            width: detail.width,
            thickness: detail.thickness,
            color: detail.color,
            material: detail.material,
            edge_requirement: detail.edgeRequirement,
            area: detail.area,
            quantity: detail.quantity || 1,
            process_route: Array.isArray(detail.processRoute) ? JSON.stringify(detail.processRoute) : null
          });
        }

        // 更新工件数量
        await bill.update({ workpiece_count: data.details.length });
      }

      logger.info(`Workpiece bill updated successfully: ${billNo}`);

      return this.getWorkpieceBillDetail(billNo);
    } catch (error) {
      logger.error('Update workpiece bill error:', error);
      throw error;
    }
  }

  /**
   * 删除工件清单
   * @param {string} billNo - 单据号
   * @returns {Object} 删除结果
   */
  async deleteWorkpieceBill(billNo) {
    try {
      logger.info(`Deleting workpiece bill: ${billNo}`);

      const bill = await WorkpieceBill.findOne({
        where: {
          bill_no: billNo,
          deleted_at: null
        }
      });

      if (!bill) {
        logger.warn(`Workpiece bill not found: ${billNo}`);
        throw new Error('工件清单不存在');
      }

      // 检查状态是否允许删除
      if (['已处理', '已完成'].includes(bill.status)) {
        logger.warn(`Cannot delete workpiece bill in status: ${bill.status}`);
        throw new Error('工件清单已处理,无法删除');
      }

      // 软删除表头
      await bill.update({ deleted_at: new Date() });

      // 删除表体
      await WorkpieceBillDetail.destroy({
        where: { bill_id: bill.id }
      });

      logger.info(`Workpiece bill deleted successfully: ${billNo}`);

      return { message: '删除成功' };
    } catch (error) {
      logger.error('Delete workpiece bill error:', error);
      throw error;
    }
  }

  /**
   * 格式化工件清单表头
   * @param {Object} bill - 工件清单表头对象
   * @returns {Object} 格式化后的表头
   */
  formatWorkpieceBill(bill) {
    const plain = bill.get({ plain: true });
    return {
      billNo: plain.bill_no,
      orderId: plain.order_id,
      organization: plain.organization,
      orderType: plain.order_type,
      customerName: plain.customer_name,
      orderDate: plain.order_date,
      dueDate: plain.due_date,
      productName: plain.product_name,
      splitter: plain.splitter,
      splitDate: plain.split_date,
      workpieceCount: plain.workpiece_count,
      status: plain.status,
      remark: plain.remark,
      createdAt: plain.created_at,
      updatedAt: plain.updated_at
    };
  }

  /**
   * 格式化工件清单表体
   * @param {Object} detail - 工件清单表体对象
   * @returns {Object} 格式化后的表体
   */
  formatWorkpieceBillDetail(detail) {
    const plain = detail.get({ plain: true });
    return {
      panelNo: plain.panel_no,
      panelName: plain.panel_name,
      panelType: plain.panel_type,
      itemType: plain.item_type,
      length: plain.length,
      width: plain.width,
      thickness: plain.thickness,
      color: plain.color,
      material: plain.material,
      edgeRequirement: plain.edge_requirement,
      area: plain.area,
      quantity: plain.quantity,
      processRoute: plain.process_route ? JSON.parse(plain.process_route) : []
    };
  }
}

module.exports = new WorkpieceBillService();
