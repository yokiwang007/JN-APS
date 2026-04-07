/**
 * 订单拆解服务 (阶段2)
 * 负责将销售订单按BOM拆解为生产子订单
 */

const { ErpSalesOrder, CadBomPart, ApsProductionOrder } = require('../models-v2');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class OrderDecompositionService {
  /**
   * 执行订单拆解
   * @param {string} orderId - 订单号
   * @param {Object} bomData - BOM数据
   * @returns {Object} 拆解结果
   */
  async decomposeOrder(orderId, bomData) {
    try {
      logger.info(`Decomposing order: ${orderId}`);

      // 查询销售订单
      const salesOrder = await ErpSalesOrder.findOne({
        where: {
          order_id: orderId,
          deleted_at: null
        }
      });

      if (!salesOrder) {
        logger.warn(`Sales order not found: ${orderId}`);
        throw new Error('订单不存在');
      }

      // 检查订单状态
      if (salesOrder.status !== '待拆解') {
        logger.warn(`Order status invalid for decomposition: ${salesOrder.status}`);
        throw new Error('订单状态不允许拆解');
      }

      // 使用事务执行拆解
      const result = await ErpSalesOrder.sequelize.transaction(async (t) => {
        // 1. 创建零件明细
        const parts = [];
        for (let i = 0; i < bomData.parts.length; i++) {
          const part = bomData.parts[i];
          const createdPart = await CadBomPart.create({
            part_id: part.partId || `PART${orderId}${String(i + 1).padStart(4, '0')}`,
            order_id: orderId,
            part_type: part.partType,
            length: part.length,
            width: part.width,
            thickness: part.thickness,
            material: part.material,
            color: part.color,
            edge_banding: part.edgeBanding,
            barcode: part.barcode,
            area: part.length * part.width / 1000000, // 平方米
            process_route: this.matchProcessRoute(part)
          }, { transaction: t });

          parts.push(createdPart);
        }

        // 2. 按工艺路线分组生成生产子订单
        const productionOrders = await this.groupByProcessRoute(orderId, parts, t);

        // 3. 更新销售订单状态
        await salesOrder.update({ status: '已拆解' }, { transaction: t });

        return {
          salesOrder: this.formatSalesOrder(salesOrder),
          parts: parts.map(p => this.formatPart(p)),
          productionOrders: productionOrders.map(po => this.formatProductionOrder(po))
        };
      });

      logger.info(`Order decomposed successfully: ${orderId}`);

      return result;
    } catch (error) {
      logger.error('Decompose order error:', error);
      throw error;
    }
  }

  /**
   * 查询生产子订单列表
   * @param {Object} params - 查询参数
   * @returns {Object} 生产子订单列表
   */
  async getProductionOrders({ status, orderId, processRoute, page = 1, pageSize = 20 }) {
    try {
      logger.info('Fetching production orders with params:', { status, orderId, processRoute, page, pageSize });

      const where = { deleted_at: null };

      if (status) {
        where.status = status;
      }
      if (orderId) {
        where.order_id = orderId;
      }
      if (processRoute) {
        where.process_route = {
          [Op.like]: `%${processRoute}%`
        };
      }

      const currentPage = Math.max(1, parseInt(page));
      const currentPageSize = Math.max(1, parseInt(pageSize));
      const offset = (currentPage - 1) * currentPageSize;

      const { count, rows } = await ApsProductionOrder.findAndCountAll({
        where,
        limit: currentPageSize,
        offset,
        order: [['planned_date', 'ASC']],
        include: [
          {
            model: ErpSalesOrder,
            as: 'salesOrder',
            attributes: ['order_id', 'customer_name', 'due_date', 'fulfillment_rule']
          }
        ]
      });

      const productionOrders = rows.map(po => this.formatProductionOrder(po));

      logger.info(`Found ${count} production orders`);

      return {
        total: count,
        list: productionOrders,
        page: currentPage,
        pageSize: currentPageSize
      };
    } catch (error) {
      logger.error('Get production orders error:', error);
      throw error;
    }
  }

  /**
   * 查询零件明细
   * @param {Object} params - 查询参数
   * @returns {Object} 零件明细列表
   */
  async getParts({ orderId, partType, material, color, page = 1, pageSize = 20 }) {
    try {
      logger.info('Fetching parts with params:', { orderId, partType, material, color, page, pageSize });

      const where = { deleted_at: null };

      if (orderId) {
        where.order_id = orderId;
      }
      if (partType) {
        where.part_type = partType;
      }
      if (material) {
        where.material = material;
      }
      if (color) {
        where.color = color;
      }

      const currentPage = Math.max(1, parseInt(page));
      const currentPageSize = Math.max(1, parseInt(pageSize));
      const offset = (currentPage - 1) * currentPageSize;

      const { count, rows } = await CadBomPart.findAndCountAll({
        where,
        limit: currentPageSize,
        offset,
        order: [['part_id', 'ASC']]
      });

      const parts = rows.map(part => this.formatPart(part));

      logger.info(`Found ${count} parts`);

      return {
        total: count,
        list: parts,
        page: currentPage,
        pageSize: currentPageSize
      };
    } catch (error) {
      logger.error('Get parts error:', error);
      throw error;
    }
  }

  /**
   * 按工艺路线分组生成生产子订单
   * @param {string} orderId - 订单号
   * @param {Array} parts - 零件列表
   * @param {Object} transaction - 事务对象
   * @returns {Array} 生产子订单列表
   */
  async groupByProcessRoute(orderId, parts, transaction) {
    const groups = {};

    // 按工艺路线分组
    parts.forEach(part => {
      const route = part.process_route;
      if (!groups[route]) {
        groups[route] = {
          material: part.material,
          thickness: part.thickness,
          color: part.color,
          edgeBanding: part.edge_banding,
          parts: []
        };
      }
      groups[route].parts.push(part);
    });

    // 为每个分组创建生产子订单
    const productionOrders = [];
    let groupIndex = 1;

    for (const [processRoute, group] of Object.entries(groups)) {
      const productionOrderId = `PO${orderId}${String(groupIndex).padStart(3, '0')}`;

      const productionOrder = await ApsProductionOrder.create({
        production_order_id: productionOrderId,
        order_id: orderId,
        process_route: processRoute,
        total_part_count: group.parts.length,
        material: group.material,
        thickness: group.thickness,
        color: group.color,
        edge_banding: group.edgeBanding,
        status: '待排程'
      }, { transaction });

      productionOrders.push(productionOrder);
      groupIndex++;
    }

    return productionOrders;
  }

  /**
   * 匹配工艺路线
   * @param {Object} part - 零件信息
   * @returns {string} 工艺路线
   */
  matchProcessRoute(part) {
    // 工艺映射规则
    const rules = [
      {
        condition: (p) => p.material === '颗粒板' && p.thickness === 18 && ['柜体板', '背板'].includes(p.part_type),
        route: '标准柜体线'
      },
      {
        condition: (p) => ['密度板', '多层板'].includes(p.material) && ['门板'].includes(p.part_type),
        route: '吸塑门板线'
      },
      {
        condition: (p) => p.material === '颗粒板' && p.thickness === 9 && ['背板'].includes(p.part_type),
        route: '背板线'
      },
      {
        condition: (p) => ['五金件'].includes(p.part_type),
        route: '外购件'
      }
    ];

    // 查找匹配的规则
    for (const rule of rules) {
      if (rule.condition(part)) {
        return rule.route;
      }
    }

    // 默认返回标准柜体线
    return '标准柜体线';
  }

  /**
   * 格式化销售订单
   * @param {Object} order - 销售订单对象
   * @returns {Object} 格式化后的销售订单
   */
  formatSalesOrder(order) {
    const plain = order.get({ plain: true });
    return {
      orderId: plain.order_id,
      customerName: plain.customer_name,
      dueDate: plain.due_date,
      totalAmount: plain.total_amount,
      priority: plain.priority,
      fulfillmentRule: plain.fulfillment_rule,
      status: plain.status,
      createdAt: plain.created_at,
      updatedAt: plain.updated_at
    };
  }

  /**
   * 格式化零件
   * @param {Object} part - 零件对象
   * @returns {Object} 格式化后的零件
   */
  formatPart(part) {
    const plain = part.get({ plain: true });
    return {
      partId: plain.part_id,
      orderId: plain.order_id,
      partType: plain.part_type,
      length: plain.length,
      width: plain.width,
      thickness: plain.thickness,
      material: plain.material,
      color: plain.color,
      edgeBanding: plain.edge_banding,
      barcode: plain.barcode,
      area: plain.area,
      processRoute: plain.process_route
    };
  }

  /**
   * 格式化生产子订单
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

module.exports = new OrderDecompositionService();
