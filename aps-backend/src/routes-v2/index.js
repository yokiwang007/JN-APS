/**
 * Routes V2 Index
 * 导出所有V2 API路由
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// 导入各模块路由
const orderRoutes = require('./orderRoutes');
const decompositionRoutes = require('./decompositionRoutes');
const coarseSchedulingRoutes = require('./coarseSchedulingRoutes');
const mergeBatchingRoutes = require('./mergeBatchingRoutes');
const fineSchedulingRoutes = require('./fineSchedulingRoutes');
const productionExecutionRoutes = require('./productionExecutionRoutes');
const fulfillmentManagementRoutes = require('./fulfillmentManagementRoutes');
const productionLinesRoutes = require('./productionLinesRoutes');
const workpieceBillRoutes = require('./workpieceBillRoutes');
const processRouteRoutes = require('./processRouteRoutes');
const equipmentRoutes = require('./equipmentRoutes');

// 注册路由
router.use('/api/v2', orderRoutes);
router.use('/api/v2', decompositionRoutes);
router.use('/api/v2', coarseSchedulingRoutes);
router.use('/api/v2', mergeBatchingRoutes);
router.use('/api/v2', fineSchedulingRoutes);
router.use('/api/v2', productionExecutionRoutes);
router.use('/api/v2', fulfillmentManagementRoutes);
router.use('/api/v2', productionLinesRoutes);
router.use('/api/v2/workpiece-bills', workpieceBillRoutes);
router.use('/api/v2/process-routes', processRouteRoutes);
router.use('/api/v2/equipments', equipmentRoutes);

// API根路径
router.get('/api/v2', (req, res) => {
  res.json({
    message: 'JN-APS API V2',
    version: '2.0.0',
    description: '重新设计的JN-APS后端API,支持7阶段业务流程',
    endpoints: {
      // 订单管理
      'POST /api/v2/erp-orders': '创建销售订单',
      'GET /api/v2/erp-orders': '查询销售订单列表',
      'GET /api/v2/erp-orders/:orderId': '查询销售订单详情',
      'PUT /api/v2/erp-orders/:orderId': '更新销售订单',
      'DELETE /api/v2/erp-orders/:orderId': '删除销售订单',

      // 订单拆解
      'POST /api/v2/orders/:orderId/decompose': '订单拆解',
      'GET /api/v2/orders/:orderId/production-orders': '查询生产子订单',
      'GET /api/v2/orders/:orderId/parts': '查询零件明细',

      // 粗排程
      'POST /api/v2/scheduling/coarse': '粗排程',
      'GET /api/v2/schedule-tasks': '查询排程任务',
      'GET /api/v2/schedule-tasks/:taskId': '查询排程任务详情',
      'PUT /api/v2/schedule-tasks/:taskId': '更新排程任务',

      // 揉单合并
      'POST /api/v2/merging/merge': '揉单合并',
      'GET /api/v2/merge-batches': '查询生产批次',
      'GET /api/v2/merge-batches/:batchId': '查询批次详情',

      // 细排程
      'POST /api/v2/scheduling/fine': '细排程',
      'GET /api/v2/cutting-patterns/:batchId': '查询排版图',
      'GET /api/v2/cutting-patterns': '查询排版图列表',
      'PUT /api/v2/cutting-patterns/:patternId': '更新排版图',
      'GET /api/v2/cutting-statistics': '查询开料统计数据',

      // 生产执行
      'POST /api/v2/production/issue': '下发生产指令',
      'PUT /api/v2/production/wip-tracking/:trackingId': '更新工序状态',
      'GET /api/v2/production/wip-tracking': '查询工序追踪',
      'GET /api/v2/production/batch/:batchId/progress': '查询批次生产进度',
      'GET /api/v2/production/statistics': '查询生产统计数据',

      // 齐套管理
      'POST /api/v2/fulfillment/slots': '初始化齐套货位',
      'PUT /api/v2/fulfillment/slots/:orderId/progress': '更新齐套进度',
      'GET /api/v2/fulfillment/slots': '查询齐套货位',
      'GET /api/v2/fulfillment/slots/:slotId': '查询齐套货位详情',
      'POST /api/v2/fulfillment/shipments': '生成发货单',
      'GET /api/v2/fulfillment/statistics': '查询齐套统计数据',

      // 产线管理
      'GET /api/v2/production-lines': '查询产线列表',
      'GET /api/v2/production-lines/:lineId': '查询产线详情',
      'PUT /api/v2/production-lines/:lineId': '更新产线信息',

      // 工件清单
      'GET /api/v2/workpiece-bills': '查询工件清单列表',
      'GET /api/v2/workpiece-bills/:billNo': '查询工件清单详情',
      'POST /api/v2/workpiece-bills': '创建工件清单',
      'PUT /api/v2/workpiece-bills/:billNo': '更新工件清单',
      'DELETE /api/v2/workpiece-bills/:billNo': '删除工件清单'
    }
  });
});

module.exports = router;
