/**
 * 扩展的Mock数据生成器
 * 包含新增数据表的模拟数据生成
 */

import { generateOrders, generatePanels, generateBatches, generateProductionLines } from './mock.js'
import { readMockStore } from './api.js'

// ============================================
// 辅助函数
// ============================================

// 生成随机ID
const generateId = (prefix = 'ID') => {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`
}

// 生成随机日期时间
const generateRandomDateTime = (startDays, endDays) => {
  const now = new Date()
  const days = Math.floor(Math.random() * (endDays - startDays)) + startDays
  const date = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  const hours = Math.floor(Math.random() * 24)
  const minutes = Math.floor(Math.random() * 60)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

// 加权随机选择
const weightedRandom = (weights) => {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let random = Math.random() * totalWeight
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return i
    }
  }
  return weights.length - 1
}

// 相对「今天」的随机日期 YYYY-MM-DD（startDays/endDays 可为负表示过去）
const generateRandomDate = (startDays, endDays) => {
  const now = new Date()
  const span = endDays - startDays
  const days = startDays + Math.floor(Math.random() * (span <= 0 ? 1 : span))
  const date = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return date.toISOString().split('T')[0]
}

// ============================================
// 阶段1: 订单接收 - erp_sales_order
// ============================================

/**
 * 生成销售订单数据(基于现有订单数据扩展)
 */
export const generateErpSalesOrders = (count = 100) => {
  const baseOrders = generateOrders(count)
  const fulfillmentRules = ['full', 'partial']
  const fulfillmentWeights = [0.8, 0.2]

  return baseOrders.map((order, index) => {
    const fulfillmentRule = fulfillmentRules[weightedRandom(fulfillmentWeights)]
    const statusMap = {
      '待审核': '待拆解',
      '技术审核中': '已拆解',
      '齐套检查中': '已拆解',
      '待排产': '已拆解',
      '已排产': '已排程',
      '生产中': '生产中',
      '已完成': '已完成',
      '已取消': '已完成'
    }

    // 前 15 单固定从「待审核」映射为待拆解，订单拆解页稳定有足够列表
    const sourceStatus = index < 15 ? '待审核' : order.status
    // 部分交期落在近端或已逾期，综合看板「交期预警」才有演示行（原数据多在 7～30 天后，筛选结果常为空）
    const useNearDue = index < 10 || index % 9 === 0
    const due_date = useNearDue ? generateRandomDate(-5, 3) : order.deliveryDate

    return {
      order_id: order.orderNo,
      customer_name: order.customerName,
      due_date,
      total_amount: Math.floor(order.panelCount * 150 + Math.random() * 5000), // 估算金额
      priority: order.priority === '普通' ? 3 : order.priority === '紧急' ? 4 : 5,
      fulfillment_rule: fulfillmentRule,
      status: statusMap[sourceStatus] || '待拆解',
      created_at: order.createdAt,
      updated_at: order.updatedAt
    }
  })
}

// ============================================
// 阶段2: 订单拆解 - cad_bom_part 和 aps_production_order
// ============================================

/** 主数据订单状态 → 订单拆解页 ERP 展示状态（与 generateErpSalesOrders 一致） */
const MAIN_STATUS_TO_ERP_STATUS = {
  待审核: '待拆解',
  技术审核中: '已拆解',
  齐套检查中: '已拆解',
  待排产: '已拆解',
  已排产: '已排程',
  生产中: '生产中',
  已完成: '已完成',
  已取消: '已完成'
}

const hashOrderNo = (orderNo) =>
  String(orderNo || '')
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

/**
 * 主数据订单 → 订单拆解页销售订单行（与订单列表同源）
 */
export const mainOrderToErpSalesOrder = (order) => {
  const h = hashOrderNo(order.orderNo)
  return {
    order_id: order.orderNo,
    customer_name: order.customerName,
    due_date: order.deliveryDate,
    total_amount: Math.floor((order.panelCount || 0) * 150 + (h % 5000)),
    priority: order.priority === '普通' ? 3 : order.priority === '紧急' ? 4 : 5,
    priority_label: order.priority,
    fulfillment_rule: h % 2 === 0 ? 'full' : 'partial',
    status: MAIN_STATUS_TO_ERP_STATUS[order.status] || '待拆解',
    created_at: order.createdAt,
    updated_at: order.updatedAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    product_type: order.productType
  }
}

/**
 * 主数据板件/五金 → CAD BOM 零件（与订单详情板件列表同源，part_id 稳定）
 */
export const panelsToCadBomParts = (panels) => {
  const processRoutes = {
    柜体板: '标准柜体线',
    门板: '吸塑门板线',
    背板: '背板线',
    装饰条: '标准柜体线',
    抽面: '标准柜体线'
  }

  return (panels || []).map((panel) => {
    const partId = `PART-${panel.panelNo}`
    if (panel.itemType === '五金件') {
      return {
        part_id: partId,
        order_id: panel.orderNo,
        part_type: panel.panelType,
        length: null,
        width: null,
        thickness: null,
        material: panel.material,
        color: null,
        edge_banding: null,
        barcode: `BC${panel.panelNo}`,
        area: '',
        process_route: '外协采购'
      }
    }
    return {
      part_id: partId,
      order_id: panel.orderNo,
      part_type: panel.panelType,
      length: panel.length,
      width: panel.width,
      thickness: panel.thickness,
      material: panel.material,
      color: panel.color,
      edge_banding: panel.edgeRequirement,
      barcode: `BC${panel.panelNo}`,
      area: panel.area || '',
      process_route: processRoutes[panel.panelType] || '标准柜体线'
    }
  })
}

/**
 * 订单拆解页：从本地主数据构建与上游一致的订单 + BOM（不另起随机订单）
 */
export const buildOrderSplitContext = () => {
  const data = readMockStore()
  const orders = data.orders || []
  const panels = data.panels || []
  return {
    erpSalesOrders: orders.map(mainOrderToErpSalesOrder),
    cadBomParts: panelsToCadBomParts(panels)
  }
}

/**
 * 生成BOM零件明细数据(基于现有工件数据扩展)
 */
export const generateCadBomParts = (orders) => {
  const basePanels = generatePanels(orders)
  const processRoutes = {
    '柜体板': '标准柜体线',
    '门板': '吸塑门板线',
    '背板': '背板线',
    '装饰条': '标准柜体线',
    '抽面': '标准柜体线'
  }

  return basePanels.map(panel => {
    if (panel.itemType === '五金件') {
      return {
        part_id: generateId('PART'),
        order_id: panel.orderNo,
        part_type: panel.panelType,
        length: null,
        width: null,
        thickness: null,
        material: panel.material,
        color: null,
        edge_banding: null,
        barcode: `BC${panel.panelNo}`,
        area: '',
        process_route: '外协采购'
      }
    } else {
      return {
        part_id: generateId('PART'),
        order_id: panel.orderNo,
        part_type: panel.panelType,
        length: panel.length,
        width: panel.width,
        thickness: panel.thickness,
        material: panel.material,
        color: panel.color,
        edge_banding: panel.edgeRequirement,
        barcode: `BC${panel.panelNo}`,
        area: panel.area,
        process_route: processRoutes[panel.panelType] || '标准柜体线'
      }
    }
  })
}

/**
 * 生成生产子订单数据
 */
export const generateApsProductionOrders = (orders, bomParts) => {
  const productionOrders = []
  const processRoutes = ['标准柜体线', '吸塑门板线', '背板线', '外协采购']
  const materials = ['颗粒板', '多层板', '密度板']
  const colors = ['子午灰', '黑胡桃', '羊绒灰', '白橡木', '胡桃木', '深空灰']
  const thicknesses = [18, 9, 25]
  const statuses = ['待排程', '已排程', '已合并', '生产中', '已完成']

  orders.forEach(order => {
    const orderParts = bomParts.filter((p) => p.order_id === order.order_id)

    // 按工艺路线分组
    const groupedParts = {}
    orderParts.forEach(part => {
      if (!groupedParts[part.process_route]) {
        groupedParts[part.process_route] = []
      }
      groupedParts[part.process_route].push(part)
    })

    Object.keys(groupedParts).forEach((route, index) => {
      const parts = groupedParts[route]
      const firstPart = parts[0]
      const production_order_id = generateId('PO')

      // 随机分配状态,模拟不同阶段的订单
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      productionOrders.push({
        production_order_id,
        order_id: order.order_id,
        process_route: route,
        total_part_count: parts.length,
        material: firstPart.material,
        thickness: firstPart.thickness,
        color: firstPart.color,
        edge_banding: firstPart.edge_banding,
        planned_date: null,
        line_id: null,
        status: status,
        created_at: order.created_at || order.createdAt,
        updated_at: order.updated_at || order.updatedAt
      })
    })
  })

  return productionOrders
}

// ============================================
// 阶段3: 粗排程 - sys_work_center 和 aps_schedule_task
// ============================================

/**
 * 生成工作中心数据(基于现有产线数据扩展)
 */
export const generateSysWorkCenters = () => {
  const baseLines = generateProductionLines()
  const workCenterIds = {
    '柜体线1': ['WC001', 'WC002', 'WC003'],
    '柜体线2': ['WC004', 'WC005'],
    '门板线': ['WC006', 'WC007'],
    '吸塑线': ['WC008', 'WC009', 'WC010']
  }

  return baseLines.map(line => ({
    line_id: `LINE${line.lineId.slice(-3)}`,
    line_name: line.lineName,
    line_type: line.lineType,
    daily_capacity: line.standardCapacity,
    daily_capacity_area: line.standardCapacityArea,
    work_center_ids: workCenterIds[line.lineName]?.join(',') || '',
    status: '正常'
  }))
}

/**
 * 生成排程任务数据
 */
export const generateApsScheduleTasks = (productionOrders, workCenters) => {
  const scheduleTasks = []
  const statuses = ['已排定', '已揉单']
  const statusWeights = [0.3, 0.7]

  productionOrders.forEach(po => {
    // 只为已排程的生产子订单生成排程任务
    if (po.status === '已排程') {
      // 根据倒排计划计算计划日期
      const dueDate = new Date()
      const workCenter = workCenters.find(wc => wc.line_type.includes(po.process_route))
      const leadTime = po.process_route === '吸塑门板线' ? 5 : 2 // 吸塑线周期长

      const plannedEndDate = new Date(dueDate.getTime() - 2 * 24 * 60 * 60 * 1000) // 齐套缓冲2天
      const plannedStartDate = new Date(plannedEndDate.getTime() - leadTime * 24 * 60 * 60 * 1000)

      const schedule_status = statuses[weightedRandom(statusWeights)]

      scheduleTasks.push({
        task_id: generateId('TASK'),
        production_order_id: po.production_order_id,
        planned_start_date: plannedStartDate.toISOString().split('T')[0],
        planned_end_date: plannedEndDate.toISOString().split('T')[0],
        line_id: workCenter?.line_id || 'LINE001',
        priority: 3,
        schedule_status,
        created_at: po.created_at,
        updated_at: po.updated_at
      })

      // 更新生产子订单状态
      po.status = schedule_status === '已揉单' ? '已合并' : '已排程'
      po.planned_date = plannedStartDate.toISOString().split('T')[0]
      po.line_id = workCenter?.line_id || 'LINE001'
    }
  })

  return scheduleTasks
}

// ============================================
// 阶段4: 揉单合并 - aps_merge_batch 和 aps_batch_detail
// ============================================

/**
 * 生成生产批次数据(基于现有批次数据扩展)
 */
export const generateApsMergeBatches = (batches, scheduleTasks) => {
  const mergeBatches = []
  const statuses = ['待排程', '已排程', '生产中', '已完成']
  const statusWeights = [0.2, 0.3, 0.3, 0.2]

  batches.forEach((batch, index) => {
    const status = statuses[weightedRandom(statusWeights)]

    mergeBatches.push({
      batch_id: batch.batchNo,
      line_id: `LINE${batch.productionLine.slice(-3)}`,
      production_date: batch.planStartDate,
      material: batch.color || '颗粒板',
      thickness: 18,
      color: batch.color || '子午灰',
      total_part_count: batch.panelCount,
      merge_rule: '板材利用率优先',
      utilization_rate: status === '已排程' || status === '生产中' || status === '已完成' ? (85 + Math.random() * 10).toFixed(1) : null,
      optimize_status: status === '已排程' || status === '生产中' || status === '已完成' ? '已优化' : '待优化',
      status: status === '待下发' ? '待排程' : status,
      time_window_forward: Math.floor(Math.random() * 2),
      time_window_backward: Math.floor(Math.random() * 2),
      is_force_merge: Math.random() > 0.9,
      created_at: batch.createdAt,
      updated_at: batch.updatedAt
    })
  })

  return mergeBatches
}

/**
 * 生成批次明细数据
 */
export const generateApsBatchDetails = (mergeBatches, productionOrders, bomParts, scheduleTasks) => {
  const batchDetails = []

  mergeBatches.forEach(batch => {
    // 为每个批次随机分配2-5个生产子订单
    const eligibleOrders = productionOrders.filter(po =>
      po.line_id === batch.line_id &&
      po.planned_date === batch.production_date &&
      po.material === batch.material &&
      po.color === batch.color
    )

    const selectedOrders = eligibleOrders
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(Math.floor(Math.random() * 4) + 2, eligibleOrders.length))

    selectedOrders.forEach(po => {
      // 获取该生产子订单对应的排程任务
      const task = scheduleTasks.find(st => st.production_order_id === po.production_order_id)
      
      // 获取该生产子订单的所有零件
      const orderParts = bomParts.filter(p => p.order_id === po.order_id && p.process_route === po.process_route)

      orderParts.forEach(part => {
        batchDetails.push({
          id: batchDetails.length + 1,
          batch_id: batch.batch_id,
          production_order_id: po.production_order_id,
          task_id: task?.task_id || null,  // 新增task_id字段
          part_id: part.part_id
        })
      })
    })
  })

  return batchDetails
}

// ============================================
// 阶段5: 细排程 - cam_cutting_pattern
// ============================================

/**
 * 生成排版图数据
 */
export const generateCamCuttingPatterns = (mergeBatches) => {
  const cuttingPatterns = []

  mergeBatches.forEach(batch => {
    if (batch.optimize_status === '已优化' && batch.utilization_rate) {
      cuttingPatterns.push({
        pattern_id: generateId('PATTERN'),
        batch_id: batch.batch_id,
        required_board_count: Math.ceil(batch.total_part_count / 6), // 假设每张大板可切6件
        board_specification: `1220x2440mm ${batch.thickness}mm`,
        utilization_rate: parseFloat(batch.utilization_rate),
        waste_rate: (100 - parseFloat(batch.utilization_rate)).toFixed(1),
        image_path: `/patterns/${batch.batch_id}.png`,
        start_time: generateRandomDateTime(0, 1),
        end_time: generateRandomDateTime(1, 2),
        duration_minutes: 480, // 8小时
        equipment_id: generateId('EQ'),
        created_at: batch.updated_at
      })
    }
  })

  return cuttingPatterns
}

// ============================================
// 阶段6: 生产执行 - mes_production_order 和 mes_wip_tracking
// ============================================

/**
 * 生成生产工单数据(基于批次数据)
 */
export const generateMesProductionOrders = (mergeBatches, batchDetails, productionOrders) => {
  const productionWorkOrders = []
  const statuses = ['待下发', '生产中', '已完成']
  const statusWeights = [0.2, 0.5, 0.3]

  mergeBatches.forEach(batch => {
    // 只为已排程、生产中或已完成的批次生成工单
    if (batch.status === '已排程' || batch.status === '生产中' || batch.status === '已完成') {
      const status = statuses[weightedRandom(statusWeights)]
      
      // 获取该批次包含的生产子订单
      const batchPOIds = batchDetails
        .filter(bd => bd.batch_id === batch.batch_id)
        .map(bd => bd.production_order_id)
      
      // 获取第一个生产子订单的订单ID
      const firstPO = productionOrders.find(po => po.production_order_id === batchPOIds[0])
      const order_id = firstPO?.order_id || ''

      // 计算进度
      const progress = status === '已完成' ? 100 : 
                       status === '生产中' ? Math.floor(Math.random() * 80) + 10 : 0

      productionWorkOrders.push({
        work_order_id: generateId('WO'),
        batch_id: batch.batch_id,
        order_id: order_id,
        line_id: batch.line_id,
        planned_start_date: batch.production_date,
        planned_end_date: generateRandomDate(1, 4),
        actual_start_date: status === '生产中' || status === '已完成' ? batch.production_date : null,
        actual_end_date: status === '已完成' ? generateRandomDate(0, 2) : null,
        status: status,
        progress: progress,
        part_count: batch.total_part_count,
        created_at: batch.created_at,
        updated_at: batch.updated_at
      })
    }
  })

  return productionWorkOrders
}

/**
 * 生成在制品追踪数据
 */
export const generateMesWipTracking = (bomParts, mergeBatches, batchDetails, productionWorkOrders) => {
  const wipTracking = []
  const processes = ['开料', '封边', '钻孔', '包装']
  const statuses = ['待开始', '进行中', '已完成']
  const statusWeights = [0.3, 0.2, 0.5]

  // 只为生产中的工单生成追踪数据
  const activeWorkOrders = productionWorkOrders.filter(wo => wo.status === '生产中' || wo.status === '已完成')
  
  activeWorkOrders.forEach(wo => {
    // 获取该工单对应的批次
    const batch = mergeBatches.find(b => b.batch_id === wo.batch_id)
    if (!batch) return

    // 获取该批次的所有零件
    const batchPartIds = batchDetails
      .filter(bd => bd.batch_id === batch.batch_id)
      .map(bd => bd.part_id)

    // 为每个零件生成工序追踪记录
    batchPartIds.forEach(partId => {
      processes.forEach((process, index) => {
        const status = statuses[weightedRandom(statusWeights)]
        const plannedStartTime = new Date(wo.planned_start_date)
        plannedStartTime.setHours(8 + index * 2, 0, 0, 0) // 每个工序2小时
        
        const plannedEndTime = new Date(plannedStartTime.getTime() + 2 * 60 * 60 * 1000)
        
        let actualStartTime = null
        let actualEndTime = null
        
        if (status === '进行中' || status === '已完成') {
          actualStartTime = new Date(plannedStartTime.getTime() + Math.random() * 30 * 60 * 1000)
          actualStartTime = actualStartTime.toISOString()
        }
        
        if (status === '已完成') {
          actualEndTime = new Date(plannedEndTime.getTime() - Math.random() * 30 * 60 * 1000)
          actualEndTime = actualEndTime.toISOString()
        }

        wipTracking.push({
          tracking_id: generateId('TRACK'),
          work_order_id: wo.work_order_id,
          part_id: partId,
          batch_id: batch.batch_id,
          process_name: process,
          process_sequence: index + 1,
          equipment_id: `EQ00${(index % 5) + 1}`,
          planned_start_time: plannedStartTime.toISOString(),
          planned_end_time: plannedEndTime.toISOString(),
          actual_start_time: actualStartTime,
          actual_end_time: actualEndTime,
          status: status,
          operator: ['张三', '李四', '王五', '赵六', '钱七'][Math.floor(Math.random() * 5)],
          created_at: wo.created_at,
          updated_at: wo.updated_at
        })
      })
    })
  })

  return wipTracking
}

// ============================================
// 阶段7: 成品齐套 - mes_sorting_slot 和 mes_fulfillment_detail
// ============================================

/**
 * 生成齐套货位数据
 */
export const generateMesSortingSlots = (orders, productionWorkOrders) => {
  const sortingSlots = []
  const sortStatuses = ['待齐套', '部分齐套', '已齐套', '已发货']
  const statusWeights = [0.3, 0.4, 0.2, 0.1]
  const areas = ['A', 'B', 'C', 'D']
  const shelves = ['S1', 'S2', 'S3', 'S4']
  const positions = ['上', '中', '下']

  orders.forEach((order, index) => {
    // 只为已拆解的订单创建齐套货位
    if (order.status === '已拆解' || order.status === '已排程' || order.status === '生产中') {
      const sort_status = sortStatuses[weightedRandom(statusWeights)]
      
      // 查找该订单的生产工单
      const workOrder = productionWorkOrders.find(wo => wo.order_id === order.order_id)
      
      const totalParts = Math.floor(Math.random() * 50) + 30
      const completion_rate = sort_status === '待齐套' ? Math.floor(Math.random() * 30) :
                              sort_status === '部分齐套' ? Math.floor(Math.random() * 30) + 50 :
                              sort_status === '已齐套' ? 100 : 100
      const completed_parts = Math.floor(totalParts * completion_rate / 100)
      
      // 计算等待天数
      const today = new Date()
      const allocationDate = new Date(order.created_at || order.createdAt)
      const waiting_days = Math.max(0, Math.floor((today - allocationDate) / (1000 * 60 * 60 * 24)))

      sortingSlots.push({
        slot_id: generateId('SLOT'),
        order_id: order.order_id,
        work_order_id: workOrder?.work_order_id || null,
        area: areas[index % areas.length],
        shelf_id: shelves[Math.floor(index / 10) % shelves.length],
        position: positions[index % positions.length],
        total_parts: totalParts,
        completed_parts: completed_parts,
        completion_progress: `${completed_parts}/${totalParts}`,
        completion_rate: completion_rate,
        estimated_completion_date: generateRandomDate(0, 7),
        due_date: order.due_date,
        waiting_days: waiting_days,
        sort_status: sort_status,
        allocation_date: allocationDate.toISOString().split('T')[0],
        created_at: order.created_at,
        updated_at: order.updated_at
      })
    }
  })

  return sortingSlots
}

/**
 * 生成齐套明细数据
 */
export const generateMesFulfillmentDetails = (sortingSlots, bomParts) => {
  const fulfillmentDetails = []

  sortingSlots.forEach(slot => {
    if (slot.sort_status === '部分齐套' || slot.sort_status === '已齐套') {
      // 获取该订单的所有零件
      const orderParts = bomParts.filter(p => p.order_id === slot.order_id)
      
      // 随机选择部分零件作为已齐套的零件
      const completedCount = Math.floor(orderParts.length * slot.completion_rate / 100)
      const selectedParts = orderParts
        .sort(() => Math.random() - 0.5)
        .slice(0, completedCount)

      selectedParts.forEach(part => {
        fulfillmentDetails.push({
          fulfillment_detail_id: generateId('FD'),
          slot_id: slot.slot_id,
          order_id: slot.order_id,
          part_id: part.part_id,
          quantity: 1,
          completed_quantity: 1,
          status: '已齐套',
          completion_date: generateRandomDate(0, 1),
          created_at: slot.created_at,
          updated_at: slot.updated_at
        })
      })
    }
  })

  return fulfillmentDetails
}

// ============================================
// 统一的数据初始化函数
// ============================================

/**
 * 初始化所有扩展数据
 */
export const initializeExtendedData = () => {
  // 1. 生成销售订单
  const erpSalesOrders = generateErpSalesOrders(100)
  console.log('✓ 生成销售订单数据:', erpSalesOrders.length, '条')

  // 2. 生成BOM零件明细
  const cadBomParts = generateCadBomParts(erpSalesOrders.map(o => ({
    orderNo: o.order_id,
    customerName: o.customer_name,
    deliveryDate: o.due_date,
    panelCount: Math.floor(Math.random() * 36) + 15,
    productType: '衣柜',
    createdAt: o.created_at,
    updatedAt: o.updated_at
  })))
  console.log('✓ 生成BOM零件明细数据:', cadBomParts.length, '条')

  // 3. 生成生产子订单
  const apsProductionOrders = generateApsProductionOrders(erpSalesOrders, cadBomParts)
  console.log('✓ 生成生产子订单数据:', apsProductionOrders.length, '条')

  // 4. 生成工作中心
  const sysWorkCenters = generateSysWorkCenters()
  console.log('✓ 生成工作中心数据:', sysWorkCenters.length, '条')

  // 5. 生成排程任务
  const apsScheduleTasks = generateApsScheduleTasks(apsProductionOrders, sysWorkCenters)
  console.log('✓ 生成排程任务数据:', apsScheduleTasks.length, '条')

  // 6. 生成现有批次数据(用于生成合并批次)
  // 使用旧格式的数据生成批次,因为generateBatches函数期望旧格式
  const oldOrders = generateOrders(100)
  const oldPanels = generatePanels(oldOrders)
  const baseBatches = generateBatches(oldOrders, oldPanels, 50)
  console.log('✓ 生成基础批次数据:', baseBatches.length, '条')

  // 7. 生成生产批次
  const apsMergeBatches = generateApsMergeBatches(baseBatches, apsScheduleTasks)
  console.log('✓ 生成生产批次数据:', apsMergeBatches.length, '条')

  // 8. 生成批次明细(包含task_id关联)
  const apsBatchDetails = generateApsBatchDetails(apsMergeBatches, apsProductionOrders, cadBomParts, apsScheduleTasks)
  console.log('✓ 生成批次明细数据:', apsBatchDetails.length, '条')

  // 9. 生成排版图
  const camCuttingPatterns = generateCamCuttingPatterns(apsMergeBatches)
  console.log('✓ 生成排版图数据:', camCuttingPatterns.length, '条')

  // 10. 生成生产工单(新增)
  const mesProductionOrders = generateMesProductionOrders(apsMergeBatches, apsBatchDetails, apsProductionOrders)
  console.log('✓ 生成生产工单数据:', mesProductionOrders.length, '条')

  // 11. 生成在制品追踪(关联生产工单)
  const mesWipTracking = generateMesWipTracking(cadBomParts, apsMergeBatches, apsBatchDetails, mesProductionOrders)
  console.log('✓ 生成在制品追踪数据:', mesWipTracking.length, '条')

  // 12. 生成齐套货位(关联生产工单)
  const mesSortingSlots = generateMesSortingSlots(erpSalesOrders, mesProductionOrders)
  console.log('✓ 生成齐套货位数据:', mesSortingSlots.length, '条')

  // 13. 生成齐套明细(新增)
  const mesFulfillmentDetails = generateMesFulfillmentDetails(mesSortingSlots, cadBomParts)
  console.log('✓ 生成齐套明细数据:', mesFulfillmentDetails.length, '条')

  // 返回所有数据
  return {
    erp_sales_orders: erpSalesOrders,
    cad_bom_parts: cadBomParts,
    aps_production_orders: apsProductionOrders,
    sys_work_centers: sysWorkCenters,
    aps_schedule_tasks: apsScheduleTasks,
    aps_merge_batches: apsMergeBatches,
    aps_batch_details: apsBatchDetails,
    cam_cutting_patterns: camCuttingPatterns,
    mes_production_orders: mesProductionOrders,  // 新增
    mes_wip_tracking: mesWipTracking,
    mes_sorting_slots: mesSortingSlots,
    mes_fulfillment_details: mesFulfillmentDetails  // 新增
  }
}
