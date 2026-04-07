/**
 * 细排程服务 (阶段5)
 * 负责精确排程和开料优化
 */

const { ApsMergeBatch, CamCuttingPattern, ApsBatchDetail, CadBomPart } = require('../models-v2');
const logger = require('../utils/logger');

class FineSchedulingService {
  /**
   * 执行细排程
   * @param {Object} params - 排程参数
   * @returns {Object} 排程结果
   */
  async scheduleFine(params) {
    try {
      logger.info('Starting fine scheduling:', params);

      const { batchId, boardSpecification = '1220x2440mm 18mm' } = params;

      // 查询批次信息
      const batch = await ApsMergeBatch.findOne({
        where: {
          batch_id: batchId,
          status: '待排程',
          deleted_at: null
        },
        include: [
          {
            model: ApsBatchDetail,
            as: 'details',
            required: true,
            include: [
              {
                model: CadBomPart,
                as: 'part',
                required: true
              }
            ]
          }
        ]
      });

      if (!batch) {
        logger.warn(`Batch not found or invalid status: ${batchId}`);
        throw new Error('批次不存在或状态不允许排程');
      }

      // 执行开料优化
      const optimizationResult = await this.optimizeCutting(batch, boardSpecification);

      // 使用事务创建排版图
      const result = await ApsMergeBatch.sequelize.transaction(async (t) => {
        // 创建排版图
        const pattern = await CamCuttingPattern.create({
          pattern_id: `PATTERN${batchId}`,
          batch_id: batchId,
          required_board_count: optimizationResult.requiredBoardCount,
          board_specification: boardSpecification,
          utilization_rate: optimizationResult.utilizationRate,
          waste_rate: optimizationResult.wasteRate,
          image_path: optimizationResult.imagePath
        }, { transaction: t });

        // 更新批次状态
        await batch.update({
          optimize_status: '已优化',
          utilization_rate: optimizationResult.utilizationRate,
          status: '已排程'
        }, { transaction: t });

        return {
          batchId: batch.batch_id,
          patternId: pattern.pattern_id,
          requiredBoardCount: pattern.required_board_count,
          boardSpecification: pattern.board_specification,
          utilizationRate: pattern.utilization_rate,
          wasteRate: pattern.waste_rate,
          imagePath: pattern.image_path,
          totalParts: batch.total_part_count,
          partCount: batch.details.length
        };
      });

      logger.info(`Fine scheduling completed for batch: ${batchId}`);

      return result;
    } catch (error) {
      logger.error('Fine scheduling error:', error);
      throw error;
    }
  }

  /**
   * 开料优化
   * @param {Object} batch - 批次对象
   * @param {string} boardSpecification - 大板规格
   * @returns {Object} 优化结果
   */
  async optimizeCutting(batch, boardSpecification) {
    try {
      logger.info(`Optimizing cutting for batch: ${batch.batch_id}`);

      // 解析大板规格
      const boardSpec = this.parseBoardSpecification(boardSpecification);

      // 获取所有零件尺寸
      const parts = batch.details.map(detail => ({
        partId: detail.part_id,
        length: detail.part.length,
        width: detail.part.width,
        area: detail.part.area
      }));

      // 计算总零件面积
      const totalPartArea = parts.reduce((sum, part) => sum + part.area, 0);

      // 计算所需大板数量(简化算法)
      const boardArea = (boardSpec.length * boardSpec.width) / 1000000; // 平方米
      const requiredBoardCount = Math.ceil(totalPartArea / (boardArea * 0.85)); // 假设85%利用率

      // 计算利用率
      const utilizationRate = (totalPartArea / (requiredBoardCount * boardArea) * 100).toFixed(2);

      // 计算废料率
      const wasteRate = (100 - utilizationRate).toFixed(2);

      // 生成排版图路径(简化处理)
      const imagePath = `/uploads/optimization/${batch.batch_id}.png`;

      logger.info(`Cutting optimization completed. Boards required: ${requiredBoardCount}, Utilization: ${utilizationRate}%`);

      return {
        requiredBoardCount,
        boardSpecification,
        utilizationRate: parseFloat(utilizationRate),
        wasteRate: parseFloat(wasteRate),
        imagePath
      };
    } catch (error) {
      logger.error('Optimize cutting error:', error);
      throw error;
    }
  }

  /**
   * 解析大板规格
   * @param {string} specification - 规格字符串
   * @returns {Object} 规格对象
   */
  parseBoardSpecification(specification) {
    // 解析格式: "1220x2440mm 18mm"
    const sizeMatch = specification.match(/(\d+)x(\d+)mm/);
    const thicknessMatch = specification.match(/\s(\d+)mm$/);

    if (!sizeMatch) {
      throw new Error('无效的大板规格格式');
    }

    return {
      length: parseInt(sizeMatch[1]),
      width: parseInt(sizeMatch[2]),
      thickness: thicknessMatch ? parseInt(thicknessMatch[1]) : 18
    };
  }

  /**
   * 查询排版图
   * @param {string} batchId - 批次号
   * @returns {Object} 排版图信息
   */
  async getCuttingPattern(batchId) {
    try {
      logger.info(`Fetching cutting pattern for batch: ${batchId}`);

      const pattern = await CamCuttingPattern.findOne({
        where: {
          batch_id: batchId,
          deleted_at: null
        },
        include: [
          {
            model: ApsMergeBatch,
            as: 'batch'
          }
        ]
      });

      if (!pattern) {
        logger.warn(`Cutting pattern not found for batch: ${batchId}`);
        throw new Error('排版图不存在');
      }

      const formattedPattern = this.formatCuttingPattern(pattern);

      logger.info(`Cutting pattern fetched for batch: ${batchId}`);

      return formattedPattern;
    } catch (error) {
      logger.error('Get cutting pattern error:', error);
      throw error;
    }
  }

  /**
   * 查询排版图列表
   * @param {Object} params - 查询参数
   * @returns {Object} 排版图列表
   */
  async getCuttingPatterns({ batchId, minUtilizationRate, page = 1, pageSize = 20 }) {
    try {
      logger.info('Fetching cutting patterns with params:', { batchId, minUtilizationRate, page, pageSize });

      const where = { deleted_at: null };

      if (batchId) {
        where.batch_id = batchId;
      }
      if (minUtilizationRate) {
        where.utilization_rate = { [require('sequelize').Op.gte]: minUtilizationRate };
      }

      const currentPage = Math.max(1, parseInt(page));
      const currentPageSize = Math.max(1, parseInt(pageSize));
      const offset = (currentPage - 1) * currentPageSize;

      const { count, rows } = await CamCuttingPattern.findAndCountAll({
        where,
        limit: currentPageSize,
        offset,
        order: [['utilization_rate', 'DESC']],
        include: [
          {
            model: ApsMergeBatch,
            as: 'batch'
          }
        ]
      });

      const patterns = rows.map(pattern => this.formatCuttingPattern(pattern));

      logger.info(`Found ${count} cutting patterns`);

      return {
        total: count,
        list: patterns,
        page: currentPage,
        pageSize: currentPageSize
      };
    } catch (error) {
      logger.error('Get cutting patterns error:', error);
      throw error;
    }
  }

  /**
   * 更新排版图
   * @param {string} patternId - 排版图ID
   * @param {Object} data - 更新数据
   * @returns {Object} 更新后的排版图
   */
  async updateCuttingPattern(patternId, data) {
    try {
      logger.info(`Updating cutting pattern: ${patternId}`);

      const pattern = await CamCuttingPattern.findOne({
        where: {
          pattern_id: patternId,
          deleted_at: null
        }
      });

      if (!pattern) {
        logger.warn(`Cutting pattern not found: ${patternId}`);
        throw new Error('排版图不存在');
      }

      // 更新排版图
      const updateData = {};
      if (data.requiredBoardCount) updateData.required_board_count = data.requiredBoardCount;
      if (data.boardSpecification) updateData.board_specification = data.boardSpecification;
      if (data.utilizationRate) updateData.utilization_rate = data.utilizationRate;
      if (data.wasteRate) updateData.waste_rate = data.wasteRate;
      if (data.imagePath) updateData.image_path = data.imagePath;

      await pattern.update(updateData);

      logger.info(`Cutting pattern updated successfully: ${patternId}`);

      return this.getCuttingPattern(pattern.batch_id);
    } catch (error) {
      logger.error('Update cutting pattern error:', error);
      throw error;
    }
  }

  /**
   * 格式化排版图
   * @param {Object} pattern - 排版图对象
   * @returns {Object} 格式化后的排版图
   */
  formatCuttingPattern(pattern) {
    const plain = pattern.get({ plain: true });
    return {
      patternId: plain.pattern_id,
      batchId: plain.batch_id,
      requiredBoardCount: plain.required_board_count,
      boardSpecification: plain.board_specification,
      utilizationRate: plain.utilization_rate,
      wasteRate: plain.waste_rate,
      imagePath: plain.image_path,
      batch: plain.batch ? {
        batchId: plain.batch.batch_id,
        lineId: plain.batch.line_id,
        productionDate: plain.batch.production_date,
        material: plain.batch.material,
        thickness: plain.batch.thickness,
        color: plain.batch.color,
        totalPartCount: plain.batch.total_part_count,
        status: plain.batch.status
      } : null,
      createdAt: plain.created_at,
      updatedAt: plain.updated_at
    };
  }

  /**
   * 获取开料统计数据
   * @param {Object} params - 统计参数
   * @returns {Object} 统计数据
   */
  async getCuttingStatistics({ startDate, endDate }) {
    try {
      logger.info('Fetching cutting statistics:', { startDate, endDate });

      const where = { deleted_at: null };

      if (startDate) {
        where.created_at = { ...where.created_at, [require('sequelize').Op.gte]: startDate };
      }
      if (endDate) {
        where.created_at = { ...where.created_at, [require('sequelize').Op.lte]: endDate };
      }

      const patterns = await CamCuttingPattern.findAll({ where });

      const totalPatterns = patterns.length;
      const totalBoards = patterns.reduce((sum, p) => sum + p.required_board_count, 0);
      const avgUtilization = totalPatterns > 0
        ? (patterns.reduce((sum, p) => sum + p.utilization_rate, 0) / totalPatterns).toFixed(2)
        : 0;
      const avgWasteRate = totalPatterns > 0
        ? (patterns.reduce((sum, p) => sum + p.waste_rate, 0) / totalPatterns).toFixed(2)
        : 0;

      logger.info('Cutting statistics fetched');

      return {
        totalPatterns,
        totalBoards,
        avgUtilization: parseFloat(avgUtilization),
        avgWasteRate: parseFloat(avgWasteRate)
      };
    } catch (error) {
      logger.error('Get cutting statistics error:', error);
      throw error;
    }
  }
}

module.exports = new FineSchedulingService();
