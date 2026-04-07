const ErpSalesOrder = require('./ErpSalesOrder');
const CadBomPart = require('./CadBomPart');
const ApsProductionOrder = require('./ApsProductionOrder');
const SysWorkCenter = require('./SysWorkCenter');
const ApsScheduleTask = require('./ApsScheduleTask');
const ApsMergeBatch = require('./ApsMergeBatch');
const ApsBatchDetail = require('./ApsBatchDetail');
const CamCuttingPattern = require('./CamCuttingPattern');
const MesWipTracking = require('./MesWipTracking');
const MesSortingSlot = require('./MesSortingSlot');
const MesFulfillmentDetail = require('./MesFulfillmentDetail');

// 定义关联关系

// erp_sales_order (销售订单) → aps_production_order (生产子订单) [1:N]
ErpSalesOrder.hasMany(ApsProductionOrder, {
  foreignKey: 'order_id',
  sourceKey: 'order_id',
  as: 'productionOrders'
});
ApsProductionOrder.belongsTo(ErpSalesOrder, {
  foreignKey: 'order_id',
  targetKey: 'order_id',
  as: 'salesOrder'
});

// aps_production_order (生产子订单) → cad_bom_part (零件明细) [1:N]
ApsProductionOrder.hasMany(CadBomPart, {
  foreignKey: 'order_id',
  sourceKey: 'order_id',
  as: 'parts'
});
CadBomPart.belongsTo(ApsProductionOrder, {
  foreignKey: 'order_id',
  targetKey: 'order_id',
  as: 'productionOrder'
});

// erp_sales_order (销售订单) → cad_bom_part (零件明细) [1:N]
ErpSalesOrder.hasMany(CadBomPart, {
  foreignKey: 'order_id',
  sourceKey: 'order_id',
  as: 'parts'
});
CadBomPart.belongsTo(ErpSalesOrder, {
  foreignKey: 'order_id',
  targetKey: 'order_id',
  as: 'salesOrder'
});

// aps_production_order (生产子订单) → aps_schedule_task (排程任务) [1:1]
ApsProductionOrder.hasOne(ApsScheduleTask, {
  foreignKey: 'production_order_id',
  sourceKey: 'production_order_id',
  as: 'scheduleTask'
});
ApsScheduleTask.belongsTo(ApsProductionOrder, {
  foreignKey: 'production_order_id',
  targetKey: 'production_order_id',
  as: 'productionOrder'
});

// sys_work_center (工作中心) → aps_schedule_task (排程任务) [1:N]
SysWorkCenter.hasMany(ApsScheduleTask, {
  foreignKey: 'line_id',
  sourceKey: 'line_id',
  as: 'scheduleTasks'
});
ApsScheduleTask.belongsTo(SysWorkCenter, {
  foreignKey: 'line_id',
  targetKey: 'line_id',
  as: 'workCenter'
});

// sys_work_center (工作中心) → aps_merge_batch (生产批次) [1:N]
SysWorkCenter.hasMany(ApsMergeBatch, {
  foreignKey: 'line_id',
  sourceKey: 'line_id',
  as: 'batches'
});
ApsMergeBatch.belongsTo(SysWorkCenter, {
  foreignKey: 'line_id',
  targetKey: 'line_id',
  as: 'workCenter'
});

// aps_merge_batch (生产批次) → aps_batch_detail (批次明细) [1:N]
ApsMergeBatch.hasMany(ApsBatchDetail, {
  foreignKey: 'batch_id',
  sourceKey: 'batch_id',
  as: 'details'
});
ApsBatchDetail.belongsTo(ApsMergeBatch, {
  foreignKey: 'batch_id',
  targetKey: 'batch_id',
  as: 'batch'
});

// aps_batch_detail (批次明细) → aps_production_order (生产子订单) [N:1]
ApsBatchDetail.belongsTo(ApsProductionOrder, {
  foreignKey: 'production_order_id',
  targetKey: 'production_order_id',
  as: 'productionOrder'
});
ApsProductionOrder.hasMany(ApsBatchDetail, {
  foreignKey: 'production_order_id',
  sourceKey: 'production_order_id',
  as: 'batchDetails'
});

// aps_batch_detail (批次明细) → cad_bom_part (零件) [N:1]
ApsBatchDetail.belongsTo(CadBomPart, {
  foreignKey: 'part_id',
  targetKey: 'part_id',
  as: 'part'
});
CadBomPart.hasMany(ApsBatchDetail, {
  foreignKey: 'part_id',
  sourceKey: 'part_id',
  as: 'batchDetails'
});

// aps_merge_batch (生产批次) → cam_cutting_pattern (排版图) [1:1]
ApsMergeBatch.hasOne(CamCuttingPattern, {
  foreignKey: 'batch_id',
  sourceKey: 'batch_id',
  as: 'cuttingPattern'
});
CamCuttingPattern.belongsTo(ApsMergeBatch, {
  foreignKey: 'batch_id',
  targetKey: 'batch_id',
  as: 'batch'
});

// aps_merge_batch (生产批次) → mes_wip_tracking (工序追踪) [1:N]
ApsMergeBatch.hasMany(MesWipTracking, {
  foreignKey: 'batch_id',
  sourceKey: 'batch_id',
  as: 'wipTracking'
});
MesWipTracking.belongsTo(ApsMergeBatch, {
  foreignKey: 'batch_id',
  targetKey: 'batch_id',
  as: 'batch'
});

// mes_wip_tracking (工序追踪) → cad_bom_part (零件) [N:1]
MesWipTracking.belongsTo(CadBomPart, {
  foreignKey: 'part_id',
  targetKey: 'part_id',
  as: 'part'
});
CadBomPart.hasMany(MesWipTracking, {
  foreignKey: 'part_id',
  sourceKey: 'part_id',
  as: 'wipTracking'
});

// erp_sales_order (销售订单) → mes_sorting_slot (齐套货位) [1:1]
ErpSalesOrder.hasOne(MesSortingSlot, {
  foreignKey: 'order_id',
  sourceKey: 'order_id',
  as: 'sortingSlot'
});
MesSortingSlot.belongsTo(ErpSalesOrder, {
  foreignKey: 'order_id',
  targetKey: 'order_id',
  as: 'salesOrder'
});

// mes_sorting_slot (齐套货位) → mes_fulfillment_detail (齐套明细) [1:N]
MesSortingSlot.hasMany(MesFulfillmentDetail, {
  foreignKey: 'slot_id',
  sourceKey: 'slot_id',
  as: 'fulfillmentDetails'
});
MesFulfillmentDetail.belongsTo(MesSortingSlot, {
  foreignKey: 'slot_id',
  targetKey: 'slot_id',
  as: 'sortingSlot'
});

// mes_fulfillment_detail (齐套明细) → aps_production_order (生产子订单) [N:1]
MesFulfillmentDetail.belongsTo(ApsProductionOrder, {
  foreignKey: 'production_order_id',
  targetKey: 'production_order_id',
  as: 'productionOrder'
});
ApsProductionOrder.hasMany(MesFulfillmentDetail, {
  foreignKey: 'production_order_id',
  sourceKey: 'production_order_id',
  as: 'fulfillmentDetails'
});

module.exports = {
  ErpSalesOrder,
  CadBomPart,
  ApsProductionOrder,
  SysWorkCenter,
  ApsScheduleTask,
  ApsMergeBatch,
  ApsBatchDetail,
  CamCuttingPattern,
  MesWipTracking,
  MesSortingSlot,
  MesFulfillmentDetail
};
