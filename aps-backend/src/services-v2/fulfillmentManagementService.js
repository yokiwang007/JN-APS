/**
 * 齐套管理服务 (阶段7)
 * 负责齐套状态监控、分拣货位管理和发货单生成
 */

const { MesSortingSlot, MesFulfillmentDetail, ErpSalesOrder, ApsProductionOrder, MesWipTracking, CadBomPart } = require('../models-v2');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class FulfillmentManagementService {
  /**
   * 初始化齐套货位
   * @param {Object} params - 初始化参数
   * @returns {Object} 初始化结果
   */
  async initializeSortingSlot(params) {
    try {
      logger.info('Initializing sorting slot:', params);

      const { orderId, totalParts, estimatedCompletionDate } = params;

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

      // 检查是否已有齐套货位
      const existingSlot = await MesSortingSlot.findOne({
        where: {
          order_id: orderId,
          deleted_at: null
        }
      });

      if (existingSlot) {
        logger.warn(`Sorting slot already exists for order: ${orderId}`);
        throw new Error('订单已有齐套货位');
      }

      // 生成货位ID
      const slotId = `SLOT${orderId}`;

      // 创建齐套货位
      const slot = await MesSortingSlot.create({
        slot_id: slotId,
        order_id: orderId,
        total_parts: totalParts,
        completed_parts: 0,
        completion_progress: `0/${totalParts}`,
        completion_rate: 0,
        estimated_completion_date: estimatedCompletionDate,
        waiting_days: 0,
        sort_status: '待齐套'
      });

      logger.info(`Sorting slot initialized: ${slotId}`);

      return this.formatSortingSlot(slot);
    } catch (error) {
      logger.error('Initialize sorting slot error:', error);
      throw error;
    }
  }

  /**
   * 更新齐套进度
   * @param {string} orderId - 订单号
   * @returns {Object} 更新结果
   */
  async updateFulfillmentProgress(orderId) {
    try {
      logger.info(`Updating fulfillment progress for order: ${orderId}`);

      // 查询齐套货位
      const slot = await MesSortingSlot.findOne({
        where: {
          order_id: orderId,
          deleted_at: null
        }
      });

      if (!slot) {
        logger.warn(`Sorting slot not found for order: ${orderId}`);
        throw new Error('齐套货位不存在');
      }

      // 查询该订单的所有生产子订单
      const productionOrders = await ApsProductionOrder.findAll({
        where: {
          order_id: orderId,
          deleted_at: null
        }
      });

      if (productionOrders.length === 0) {
        logger.warn(`No production orders found for order: ${orderId}`);
        throw new Error('订单没有生产子订单');
      }

      // 查询每个生产子订单的零件完成情况
      let totalCompletedParts = 0;
      let totalParts = 0;

      for (const po of productionOrders) {
        // 查询该生产子订单的所有零件
        const parts = await CadBomPart.findAll({
          where: {
            order_id: orderId,
            deleted_at: null
          }
        });

        totalParts += parts.length;

        // 查询每个零件的工序追踪
        for (const part of parts) {
          const tracking = await MesWipTracking.findOne({
            where: {
              part_id: part.part_id,
              current_process: '已完成',
              status: '已完成',
              deleted_at: null
            }
          });

          if (tracking) {
            totalCompletedParts++;

            // 检查是否已有齐套明细
            const existingDetail = await MesFulfillmentDetail.findOne({
              where: {
                slot_id: slot.slot_id,
                production_order_id: po.production_order_id,
                part_id: part.part_id
              }
            });

            if (!existingDetail) {
              // 创建齐套明细
              await MesFulfillmentDetail.create({
                slot_id: slot.slot_id,
                production_order_id: po.production_order_id,
                part_id: part.part_id,
                completed_parts: 1,
                completion_date: tracking.operation_time
              });
            }
          }
        }
      }

      // 更新齐套货位
      const completionRate = totalParts > 0 ? (totalCompletedParts / totalParts * 100).toFixed(2) : 0;
      const completionProgress = `${totalCompletedParts}/${totalParts}`;

      // 判断齐套状态
      let sortStatus = slot.sort_status;
      if (totalCompletedParts === totalParts) {
        sortStatus = '已齐套';
      } else if (totalCompletedParts > 0) {
        sortStatus = '部分齐套';
      }

      await slot.update({
        completed_parts: totalCompletedParts,
        completion_progress: completionProgress,
        completion_rate: parseFloat(completionRate),
        sort_status: sortStatus
      });

      logger.info(`Fulfillment progress updated for order: ${orderId}`);

      return this.formatSortingSlot(slot);
    } catch (error) {
      logger.error('Update fulfillment progress error:', error);
      throw error;
    }
  }

  /**
   * 查询齐套货位列表
   * @param {Object} params - 查询参数
   * @returns {Object} 齐套货位列表
   */
  async getSortingSlots({ status, orderId, minCompletionRate, page = 1, pageSize = 20 }) {
    try {
      logger.info('Fetching sorting slots with params:', { status, orderId, minCompletionRate, page, pageSize });

      const where = { deleted_at: null };

      if (status) {
        where.sort_status = status;
      }
      if (orderId) {
        where.order_id = orderId;
      }
      if (minCompletionRate) {
        where.completion_rate = { [Op.gte]: minCompletionRate };
      }

      const currentPage = Math.max(1, parseInt(page));
      const currentPageSize = Math.max(1, parseInt(pageSize));
      const offset = (currentPage - 1) * currentPageSize;

      const { count, rows } = await MesSortingSlot.findAndCountAll({
        where,
        limit: currentPageSize,
        offset,
        order: [['completion_rate', 'DESC']],
        include: [
          {
            model: ErpSalesOrder,
            as: 'salesOrder',
            attributes: ['order_id', 'customer_name', 'due_date', 'total_amount']
          }
        ]
      });

      const slots = rows.map(slot => this.formatSortingSlot(slot));

      logger.info(`Found ${count} sorting slots`);

      return {
        total: count,
        list: slots,
        page: currentPage,
        pageSize: currentPageSize
      };
    } catch (error) {
      logger.error('Get sorting slots error:', error);
      throw error;
    }
  }

  /**
   * 查询齐套货位详情
   * @param {string} slotId - 货位ID
   * @returns {Object} 货位详情
   */
  async getSortingSlotDetail(slotId) {
    try {
      logger.info(`Fetching sorting slot detail: ${slotId}`);

      const slot = await MesSortingSlot.findOne({
        where: {
          slot_id: slotId,
          deleted_at: null
        },
        include: [
          {
            model: ErpSalesOrder,
            as: 'salesOrder'
          },
          {
            model: MesFulfillmentDetail,
            as: 'fulfillmentDetails',
            include: [
              {
                model: ApsProductionOrder,
                as: 'productionOrder'
              },
              {
                model: CadBomPart,
                as: 'part'
              }
            ]
          }
        ]
      });

      if (!slot) {
        logger.warn(`Sorting slot not found: ${slotId}`);
        throw new Error('齐套货位不存在');
      }

      const formattedSlot = this.formatSortingSlot(slot);
      formattedSlot.fulfillmentDetails = slot.fulfillmentDetails?.map(detail => this.formatFulfillmentDetail(detail)) || [];

      logger.info(`Sorting slot detail fetched: ${slotId}`);

      return formattedSlot;
    } catch (error) {
      logger.error('Get sorting slot detail error:', error);
      throw error;
    }
  }

  /**
   * 生成发货单
   * @param {string} slotId - 货位ID
   * @returns {Object} 发货单信息
   */
  async generateShipment(slotId) {
    try {
      logger.info(`Generating shipment for slot: ${slotId}`);

      // 查询齐套货位
      const slot = await MesSortingSlot.findOne({
        where: {
          slot_id: slotId,
          deleted_at: null
        },
        include: [
          {
            model: ErpSalesOrder,
            as: 'salesOrder'
          }
        ]
      });

      if (!slot) {
        logger.warn(`Sorting slot not found: ${slotId}`);
        throw new Error('齐套货位不存在');
      }

      // 检查是否已齐套
      if (slot.sort_status !== '已齐套') {
        logger.warn(`Slot not fully fulfilled: ${slotId}`);
        throw new Error('订单未齐套,无法生成发货单');
      }

      // 检查是否已发货
      if (slot.sort_status === '已发货') {
        logger.warn(`Slot already shipped: ${slotId}`);
        throw new Error('订单已发货');
      }

      // 更新货位状态
      await slot.update({ sort_status: '已发货' });

      // 生成发货单号
      const shipmentId = `SHIP${slot.order_id}`;

      logger.info(`Shipment generated: ${shipmentId}`);

      return {
        shipmentId,
        slotId: slot.slot_id,
        orderId: slot.order_id,
        customerName: slot.salesOrder?.customer_name,
        totalParts: slot.total_parts,
        completedParts: slot.completed_parts,
        completionRate: slot.completion_rate,
        shipmentDate: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Generate shipment error:', error);
      throw error;
    }
  }

  /**
   * 查询齐套统计数据
   * @param {Object} params - 统计参数
   * @returns {Object} 统计数据
   */
  async getFulfillmentStatistics({ startDate, endDate }) {
    try {
      logger.info('Fetching fulfillment statistics:', { startDate, endDate });

      const where = { deleted_at: null };

      if (startDate) {
        where.created_at = { ...where.created_at, [Op.gte]: startDate };
      }
      if (endDate) {
        where.created_at = { ...where.created_at, [Op.lte]: endDate };
      }

      const slots = await MesSortingSlot.findAll({ where });

      const totalSlots = slots.length;
      const fullyFulfilled = slots.filter(s => s.sort_status === '已齐套' || s.sort_status === '已发货').length;
      const partiallyFulfilled = slots.filter(s => s.sort_status === '部分齐套').length;
      const waitingFulfillment = slots.filter(s => s.sort_status === '待齐套').length;

      const totalParts = slots.reduce((sum, s) => sum + s.total_parts, 0);
      const completedParts = slots.reduce((sum, s) => sum + s.completed_parts, 0);
      const avgCompletionRate = totalSlots > 0
        ? (slots.reduce((sum, s) => sum + s.completion_rate, 0) / totalSlots).toFixed(2)
        : 0;

      logger.info('Fulfillment statistics fetched');

      return {
        totalSlots,
        fullyFulfilled,
        partiallyFulfilled,
        waitingFulfillment,
        totalParts,
        completedParts,
        avgCompletionRate: parseFloat(avgCompletionRate)
      };
    } catch (error) {
      logger.error('Get fulfillment statistics error:', error);
      throw error;
    }
  }

  /**
   * 格式化齐套货位
   * @param {Object} slot - 齐套货位对象
   * @returns {Object} 格式化后的货位
   */
  formatSortingSlot(slot) {
    const plain = slot.get({ plain: true });
    return {
      slotId: plain.slot_id,
      orderId: plain.order_id,
      totalParts: plain.total_parts,
      completedParts: plain.completed_parts,
      completionProgress: plain.completion_progress,
      completionRate: plain.completion_rate,
      estimatedCompletionDate: plain.estimated_completion_date,
      waitingDays: plain.waiting_days,
      sortStatus: plain.sort_status,
      salesOrder: plain.salesOrder ? {
        orderId: plain.salesOrder.order_id,
        customerName: plain.salesOrder.customer_name,
        dueDate: plain.salesOrder.due_date,
        totalAmount: plain.salesOrder.total_amount
      } : null,
      createdAt: plain.created_at,
      updatedAt: plain.updated_at
    };
  }

  /**
   * 格式化齐套明细
   * @param {Object} detail - 齐套明细对象
   * @returns {Object} 格式化后的明细
   */
  formatFulfillmentDetail(detail) {
    const plain = detail.get({ plain: true });
    return {
      id: plain.id,
      slotId: plain.slot_id,
      productionOrderId: plain.production_order_id,
      partId: plain.part_id,
      completedParts: plain.completed_parts,
      completionDate: plain.completion_date,
      productionOrder: plain.productionOrder ? {
        productionOrderId: plain.productionOrder.production_order_id,
        orderId: plain.productionOrder.order_id,
        processRoute: plain.productionOrder.process_route
      } : null,
      part: plain.part ? {
        partId: plain.part.part_id,
        partType: plain.part.part_type,
        material: plain.part.material,
        color: plain.part.color
      } : null
    };
  }
}

module.exports = new FulfillmentManagementService();
