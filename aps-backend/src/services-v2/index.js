/**
 * Services V2 Index
 * 导出所有V2业务服务
 */

const orderReceptionService = require('./orderReceptionService');
const orderDecompositionService = require('./orderDecompositionService');
const coarseSchedulingService = require('./coarseSchedulingService');
const mergeBatchingService = require('./mergeBatchingService');
const fineSchedulingService = require('./fineSchedulingService');
const productionExecutionService = require('./productionExecutionService');
const fulfillmentManagementService = require('./fulfillmentManagementService');

module.exports = {
  // 阶段1: 订单接收服务
  orderReceptionService,

  // 阶段2: 订单拆解服务
  orderDecompositionService,

  // 阶段3: 粗排程服务
  coarseSchedulingService,

  // 阶段4: 揉单合并服务
  mergeBatchingService,

  // 阶段5: 细排程服务
  fineSchedulingService,

  // 阶段6: 生产执行服务
  productionExecutionService,

  // 阶段7: 齐套管理服务
  fulfillmentManagementService
};
