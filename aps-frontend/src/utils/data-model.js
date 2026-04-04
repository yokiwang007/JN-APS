/**
 * 数据模型定义
 * 包含所有新增和扩展的数据表结构
 */

// ============================================
// 阶段1: 订单接收
// ============================================

/**
 * erp_sales_order (销售订单主表)
 * 作用: 存储客户订单的基本信息,是整个生产流程的顶层业务对象
 */
export const erpSalesOrderModel = {
  tableName: 'erp_sales_order',
  fields: {
    order_id: { type: 'string', primaryKey: true, label: '订单号' },
    customer_name: { type: 'string', label: '客户名称' },
    due_date: { type: 'date', label: '承诺交期' },
    total_amount: { type: 'number', label: '订单总金额' },
    priority: { type: 'number', label: '优先级(1-5)' },
    fulfillment_rule: { type: 'string', label: '齐套规则', enum: ['full', 'partial'] },
    status: { type: 'string', label: '订单状态', enum: ['待拆解', '已拆解', '已排程', '生产中', '已完成'] },
    created_at: { type: 'datetime', label: '创建时间' },
    updated_at: { type: 'datetime', label: '更新时间' }
  },
  indexes: ['order_id', 'customer_name', 'due_date', 'status']
}

// ============================================
// 阶段2: 订单拆解
// ============================================

/**
 * cad_bom_part (底层零件明细表)
 * 作用: 存储订单的最小生产单元(每块板件、每个五金件)
 */
export const cadBomPartModel = {
  tableName: 'cad_bom_part',
  fields: {
    part_id: { type: 'string', primaryKey: true, label: '零件ID' },
    order_id: { type: 'string', foreignKey: 'erp_sales_order.order_id', label: '所属销售订单' },
    part_type: { type: 'string', label: '零件类型', enum: ['柜体板', '门板', '背板', '装饰条', '抽面', '五金件'] },
    length: { type: 'number', label: '长度' },
    width: { type: 'number', label: '宽度' },
    thickness: { type: 'number', label: '厚度' },
    material: { type: 'string', label: '材质', enum: ['颗粒板', '多层板', '密度板', '实木'] },
    color: { type: 'string', label: '花色' },
    edge_banding: { type: 'string', label: '封边模式' },
    barcode: { type: 'string', label: '条码号' },
    area: { type: 'number', label: '面积' },
    process_route: { type: 'string', label: '工艺路线' }
  },
  indexes: ['part_id', 'order_id', 'part_type', 'material', 'color']
}

/**
 * aps_production_order (生产子订单表)
 * 作用: APS排程的输入对象,按工艺路线划分的生产单元
 */
export const apsProductionOrderModel = {
  tableName: 'aps_production_order',
  fields: {
    production_order_id: { type: 'string', primaryKey: true, label: '子订单ID' },
    order_id: { type: 'string', foreignKey: 'erp_sales_order.order_id', label: '所属销售订单' },
    process_route: { type: 'string', label: '工艺路线', enum: ['标准柜体线', '异形门板线', '吸塑门板线', '背板线'] },
    total_part_count: { type: 'number', label: '总件数' },
    material: { type: 'string', label: '材质' },
    thickness: { type: 'number', label: '厚度' },
    color: { type: 'string', label: '花色' },
    edge_banding: { type: 'string', label: '封边模式' },
    planned_date: { type: 'date', label: '计划生产日期' },
    line_id: { type: 'string', foreignKey: 'sys_work_center.line_id', label: '分配产线' },
    status: { type: 'string', label: '状态', enum: ['待排程', '已排程', '已合并', '生产中', '已完成'] },
    created_at: { type: 'datetime', label: '创建时间' },
    updated_at: { type: 'datetime', label: '更新时间' }
  },
  indexes: ['production_order_id', 'order_id', 'process_route', 'planned_date', 'line_id', 'status']
}

// ============================================
// 阶段3: 粗排程
// ============================================

/**
 * sys_work_center (工作中心/虚拟产线表)
 * 作用: 定义各个生产线的产能信息,是排程时的资源约束
 */
export const sysWorkCenterModel = {
  tableName: 'sys_work_center',
  fields: {
    line_id: { type: 'string', primaryKey: true, label: '产线ID' },
    line_name: { type: 'string', label: '产线名称' },
    line_type: { type: 'string', label: '产线类型', enum: ['开料线', '封边线', '钻孔线', '吸塑线'] },
    daily_capacity: { type: 'number', label: '日产能(部件件数)' },
    daily_capacity_area: { type: 'number', label: '日产能(平方米)' },
    work_center_ids: { type: 'string', label: '关联的设备工作中心ID列表' },
    status: { type: 'string', label: '状态', enum: ['正常', '维护', '停用'] }
  },
  indexes: ['line_id', 'line_name', 'line_type', 'status']
}

/**
 * aps_schedule_task (排程任务表)
 * 作用: 固化粗排程结果,记录计划日期和产线分配
 */
export const apsScheduleTaskModel = {
  tableName: 'aps_schedule_task',
  fields: {
    task_id: { type: 'string', primaryKey: true, label: '任务ID' },
    production_order_id: { type: 'string', foreignKey: 'aps_production_order.production_order_id', label: '关联生产子订单ID' },
    planned_start_date: { type: 'date', label: '计划开工日期' },
    planned_end_date: { type: 'date', label: '计划完工日期' },
    line_id: { type: 'string', foreignKey: 'sys_work_center.line_id', label: '分配的产线编码' },
    priority: { type: 'number', label: '优先级' },
    schedule_status: { type: 'string', label: '排产状态', enum: ['已排定', '已揉单'] },
    created_at: { type: 'datetime', label: '创建时间' },
    updated_at: { type: 'datetime', label: '更新时间' }
  },
  indexes: ['task_id', 'production_order_id', 'planned_start_date', 'line_id', 'schedule_status']
}

// ============================================
// 阶段4: 揉单合并
// ============================================

/**
 * aps_merge_batch (生产批次主表)
 * 作用: 车间执行的基本单元,下发给开料机和封边机的对象
 */
export const apsMergeBatchModel = {
  tableName: 'aps_merge_batch',
  fields: {
    batch_id: { type: 'string', primaryKey: true, label: '批次号' },
    line_id: { type: 'string', foreignKey: 'sys_work_center.line_id', label: '生产产线' },
    production_date: { type: 'date', label: '计划生产日期' },
    material: { type: 'string', label: '材质' },
    thickness: { type: 'number', label: '厚度' },
    color: { type: 'string', label: '花色' },
    total_part_count: { type: 'number', label: '批次总部件数' },
    merge_rule: { type: 'string', label: '使用的合并规则', enum: ['板材利用率优先', '设备利用率优先'] },
    utilization_rate: { type: 'number', label: '板材利用率' },
    optimize_status: { type: 'string', label: '优化状态', enum: ['待优化', '已优化'] },
    status: { type: 'string', label: '状态', enum: ['待排程', '已排程', '生产中', '已完成'] },
    // 新增字段 - 时间窗相关
    time_window_forward: { type: 'number', label: '提前天数', defaultValue: 0 },
    time_window_backward: { type: 'number', label: '延后天数', defaultValue: 0 },
    is_force_merge: { type: 'boolean', label: '是否强制合并', defaultValue: false },
    created_at: { type: 'datetime', label: '创建时间' },
    updated_at: { type: 'datetime', label: '更新时间' }
  },
  indexes: ['batch_id', 'line_id', 'production_date', 'material', 'color', 'status']
}

/**
 * aps_batch_detail (批次明细映射表)
 * 作用: 记录批次包含的零件明细,承上启下的关键关联表
 */
export const apsBatchDetailModel = {
  tableName: 'aps_batch_detail',
  fields: {
    id: { type: 'number', primaryKey: true, autoIncrement: true, label: '自增ID' },
    batch_id: { type: 'string', foreignKey: 'aps_merge_batch.batch_id', label: '批次ID' },
    production_order_id: { type: 'string', foreignKey: 'aps_production_order.production_order_id', label: '生产子订单ID' },
    part_id: { type: 'string', foreignKey: 'cad_bom_part.part_id', label: '零件ID' }
  },
  indexes: ['id', 'batch_id', 'production_order_id', 'part_id']
}

// ============================================
// 阶段5: 细排程
// ============================================

/**
 * cam_cutting_pattern (排版图/锯切图表)
 * 作用: 存储开料优化结果,包括排版图和利用率
 */
export const camCuttingPatternModel = {
  tableName: 'cam_cutting_pattern',
  fields: {
    pattern_id: { type: 'string', primaryKey: true, label: '图纸ID' },
    batch_id: { type: 'string', foreignKey: 'aps_merge_batch.batch_id', label: '关联批次号' },
    required_board_count: { type: 'number', label: '所需原大板数量' },
    board_specification: { type: 'string', label: '大板规格' },
    utilization_rate: { type: 'number', label: '预计利用率' },
    waste_rate: { type: 'number', label: '废料率' },
    image_path: { type: 'string', label: '优化图路径' },
    // 新增字段 - 排程明细
    start_time: { type: 'datetime', label: '开始时间' },
    end_time: { type: 'datetime', label: '结束时间' },
    duration_minutes: { type: 'number', label: '耗时(分钟)' },
    equipment_id: { type: 'string', label: '设备ID' },
    created_at: { type: 'datetime', label: '创建时间' }
  },
  indexes: ['pattern_id', 'batch_id', 'start_time', 'equipment_id']
}

// ============================================
// 阶段6: 生产执行
// ============================================

/**
 * mes_wip_tracking (在制品工序扫码表)
 * 作用: 追踪每块板件在各个工序的完成情况
 */
export const mesWipTrackingModel = {
  tableName: 'mes_wip_tracking',
  fields: {
    tracking_id: { type: 'string', primaryKey: true, label: '追踪ID' },
    part_id: { type: 'string', foreignKey: 'cad_bom_part.part_id', label: '零件ID' },
    batch_id: { type: 'string', foreignKey: 'aps_merge_batch.batch_id', label: '所属批次' },
    current_process: { type: 'string', label: '当前工序', enum: ['已开料', '已封边', '已打孔', '已完成'] },
    operation_time: { type: 'datetime', label: '操作时间' },
    operator: { type: 'string', label: '操作人' },
    equipment_id: { type: 'string', label: '设备ID' },
    status: { type: 'string', label: '状态', enum: ['进行中', '已完成', '异常'] }
  },
  indexes: ['tracking_id', 'part_id', 'batch_id', 'current_process', 'operation_time']
}

// ============================================
// 阶段7: 成品齐套
// ============================================

/**
 * mes_sorting_slot (齐套分拣货位表)
 * 作用: 记录订单齐套进度,管理分拣货位
 */
export const mesSortingSlotModel = {
  tableName: 'mes_sorting_slot',
  fields: {
    slot_id: { type: 'string', primaryKey: true, label: '货架槽位ID' },
    order_id: { type: 'string', foreignKey: 'erp_sales_order.order_id', label: '当前分配的销售订单号' },
    total_parts: { type: 'number', label: '总部件数' },
    completed_parts: { type: 'number', label: '已完成部件数' },
    completion_progress: { type: 'string', label: '齐套进度(如 98/100)' },
    completion_rate: { type: 'number', label: '齐套率(如 98)' },
    estimated_completion_date: { type: 'date', label: '预计齐套日期' },
    waiting_days: { type: 'number', label: '等待天数' },
    sort_status: { type: 'string', label: '分拣状态', enum: ['待齐套', '部分齐套', '已齐套', '已发货'] },
    created_at: { type: 'datetime', label: '创建时间' },
    updated_at: { type: 'datetime', label: '更新时间' }
  },
  indexes: ['slot_id', 'order_id', 'sort_status', 'updated_at']
}

// ============================================
// 导出所有模型
// ============================================

export const dataModels = {
  erpSalesOrder: erpSalesOrderModel,
  cadBomPart: cadBomPartModel,
  apsProductionOrder: apsProductionOrderModel,
  sysWorkCenter: sysWorkCenterModel,
  apsScheduleTask: apsScheduleTaskModel,
  apsMergeBatch: apsMergeBatchModel,
  apsBatchDetail: apsBatchDetailModel,
  camCuttingPattern: camCuttingPatternModel,
  mesWipTracking: mesWipTrackingModel,
  mesSortingSlot: mesSortingSlotModel
}

// ============================================
// 数据模型关系图
// ============================================

export const dataModelRelations = `
数据模型关系图:

erp_sales_order (销售订单)
  ├─→ aps_production_order (生产子订单) [1:N]
  │     ├─→ cad_bom_part (零件明细) [1:N]
  │     └─→ aps_schedule_task (排程任务) [1:1]
  │           └─→ aps_merge_batch (生产批次) [1:N]
  │                 ├─→ aps_batch_detail (批次明细) [1:N]
  │                 │     └─→ cad_bom_part [N:1]
  │                 └─→ cam_cutting_pattern (排版图) [1:1]
  │                       └─→ mes_wip_tracking (工序追踪) [1:N]
  │                             └─→ cad_bom_part [N:1]
  └─→ mes_sorting_slot (齐套货位) [1:1]

sys_work_center (工作中心/产线)
  ├─→ aps_schedule_task (排程任务) [1:N]
  └─→ aps_merge_batch (生产批次) [1:N]
`
