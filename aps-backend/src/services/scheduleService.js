/**
 * 排程服务
 */

const { Schedule, Batch } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class ScheduleService {
  /**
   * 查询排程列表
   * @param {Object} params - 查询参数
   * @returns {Object} 排程列表
   */
  async getSchedules({ batchNo, processName, startDate, endDate, page = 1, pageSize = 20 }) {
    try {
      logger.info('Fetching schedules with params:', { batchNo, processName, startDate, endDate, page, pageSize });

      const where = { deleted_at: null };

      if (batchNo) {
        where.batch_no = batchNo;
      }
      if (processName) {
        where.process_name = {
          [Op.like]: `%${processName}%`
        };
      }
      if (startDate) {
        where.start_time = {
          [Op.gte]: new Date(startDate)
        };
      }
      if (endDate) {
        where.end_time = {
          [Op.lte]: new Date(endDate)
        };
      }

      const currentPage = Math.max(1, parseInt(page));
      const currentPageSize = Math.max(1, parseInt(pageSize));
      const offset = (currentPage - 1) * currentPageSize;

      const { count, rows } = await Schedule.findAndCountAll({
        where,
        limit: currentPageSize,
        offset,
        order: [['start_time', 'ASC']],
        include: [
          {
            model: Batch,
            as: 'batch',
            required: false
          }
        ]
      });

      const schedules = rows.map(schedule => this.formatSchedule(schedule));

      logger.info(`Found ${count} schedules`);

      return {
        total: count,
        list: schedules,
        page: currentPage,
        pageSize: currentPageSize
      };
    } catch (error) {
      logger.error('Get schedules error:', error);
      throw error;
    }
  }

  /**
   * 排程优化
   * @param {Object} params - 优化参数
   * @returns {Object} 优化结果
   */
  async optimizeSchedule({ batchNos, optimizationTarget = 'BALANCE', timeWindow = 7 }) {
    try {
      logger.info('Optimizing schedule:', { batchNos, optimizationTarget, timeWindow });

      // 模拟排程优化逻辑
      const optimizationResults = [];

      for (const batchNo of batchNos) {
        const batch = await Batch.findOne({
          where: {
            batch_no: batchNo,
            deleted_at: null
          }
        });

        if (!batch) {
          logger.warn(`Batch not found: ${batchNo}`);
          continue;
        }

        // 模拟生成排程数据
        const processes = ['开料', '封边', '钻孔', '质检'];
        const equipments = ['电子锯1', '封边机1', '六面钻1', '质检台1'];

        for (let i = 0; i < processes.length; i++) {
          const startTime = new Date(Date.now() + i * 2 * 60 * 60 * 1000);
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

          const schedule = await Schedule.create({
            schedule_id: `SCH${Date.now()}${i}`,
            batch_no: batchNo,
            process_name: processes[i],
            start_time: startTime,
            end_time: endTime,
            equipment_name: equipments[i]
          });

          optimizationResults.push({
            scheduleId: schedule.schedule_id,
            batchNo: batchNo,
            processName: schedule.process_name,
            startTime: schedule.start_time,
            endTime: schedule.end_time,
            equipmentName: schedule.equipment_name
          });
        }

        // 更新批次状态
        await batch.update({ status: '已排产' });
      }

      // 模拟优化指标
      const optimizationMetrics = {
        totalBatches: batchNos.length,
        totalSchedules: optimizationResults.length,
        averageUtilization: 87.5,
        timeWindow: `${timeWindow}天`,
        optimizationTarget: optimizationTarget === 'BALANCE' ? '产能均衡' : optimizationTarget === 'EFFICIENCY' ? '效率优先' : '交期优先',
        generatedAt: new Date().toISOString()
      };

      logger.info(`Schedule optimization completed: ${optimizationResults.length} schedules generated`);

      return {
        metrics: optimizationMetrics,
        schedules: optimizationResults
      };
    } catch (error) {
      logger.error('Optimize schedule error:', error);
      throw error;
    }
  }

  /**
   * 下发指令
   * @param {Object} params - 下发参数
   * @returns {Object} 下发结果
   */
  async issueSchedule({ batchNos, issueMode = 'AUTO' }) {
    try {
      logger.info('Issuing schedule:', { batchNos, issueMode });

      const issueResults = [];

      for (const batchNo of batchNos) {
        const batch = await Batch.findOne({
          where: {
            batch_no: batchNo,
            deleted_at: null
          }
        });

        if (!batch) {
          logger.warn(`Batch not found: ${batchNo}`);
          issueResults.push({
            batchNo,
            success: false,
            message: '批次不存在'
          });
          continue;
        }

        // 检查批次状态
        if (batch.status !== '已排产') {
          logger.warn(`Batch status invalid for issue: ${batchNo}`);
          issueResults.push({
            batchNo,
            success: false,
            message: '批次状态不允许下发'
          });
          continue;
        }

        // 模拟下发逻辑
        await batch.update({ status: '生产中' });

        issueResults.push({
          batchNo,
          success: true,
          message: '下发成功',
          issuedAt: new Date().toISOString(),
          issuedBy: issueMode === 'AUTO' ? '系统自动' : '手动下发'
        });
      }

      const successCount = issueResults.filter(r => r.success).length;
      const failCount = issueResults.filter(r => !r.success).length;

      logger.info(`Schedule issue completed: ${successCount} success, ${failCount} failed`);

      return {
        total: batchNos.length,
        successCount,
        failCount,
        results: issueResults
      };
    } catch (error) {
      logger.error('Issue schedule error:', error);
      throw error;
    }
  }

  /**
   * 格式化排程数据
   * @param {Object} schedule - 排程对象
   * @returns {Object} 格式化后的排程
   */
  formatSchedule(schedule) {
    const plain = schedule.get({ plain: true });
    return {
      scheduleId: plain.schedule_id,
      batchNo: plain.batch_no,
      processName: plain.process_name,
      startTime: plain.start_time,
      endTime: plain.end_time,
      equipmentName: plain.equipment_name,
      createdAt: plain.created_at,
      updatedAt: plain.updated_at
    };
  }
}

module.exports = new ScheduleService();
