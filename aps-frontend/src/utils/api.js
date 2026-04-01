// 模拟API
import { initMockData } from './mock'

// 本地存储键名
const STORAGE_KEY = 'aps_mock_data'

// 获取或初始化数据
const getData = () => {
  let data = localStorage.getItem(STORAGE_KEY)
  if (!data) {
    data = initMockData()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } else {
    data = JSON.parse(data)
  }
  return data
}

// 保存数据
const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// 模拟延迟
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 统一响应格式
const response = (code, message, data = null) => ({
  code,
  message,
  data,
  timestamp: new Date().toISOString()
})

const success = (data, message = '操作成功') => response('SUCCESS', message, data)
const error = (message, code = 'ERROR') => response(code, message)

// ==================== 订单API ====================

// 获取订单列表
export const getOrders = async (params = {}) => {
  await delay()
  const data = getData()
  let orders = [...data.orders]

  // 筛选
  if (params.status) {
    orders = orders.filter(o => o.status === params.status)
  }
  if (params.orderType) {
    orders = orders.filter(o => o.orderType === params.orderType)
  }
  if (params.priority) {
    orders = orders.filter(o => o.priority === params.priority)
  }
  if (params.customerName) {
    orders = orders.filter(o => o.customerName.includes(params.customerName))
  }

  // 排序 - 默认按承诺交期从小到大排序
  orders.sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate))

  // 分页
  const page = params.page || 1
  const pageSize = params.pageSize || 20
  const total = orders.length
  const start = (page - 1) * pageSize
  const list = orders.slice(start, start + pageSize)

  return success({ total, list, page, pageSize })
}

// 获取订单详情
export const getOrderDetail = async (orderNo) => {
  await delay()
  const data = getData()
  const order = data.orders.find(o => o.orderNo === orderNo)
  if (!order) {
    return error('订单不存在')
  }

  // 获取订单的板件
  const panels = data.panels.filter(p => p.orderNo === orderNo)

  return success({ ...order, panels })
}

// 订单预处理
// 获取预处理规则
export const getPreprocessRules = () => {
  const defaultRules = {
    materialCheck: {
      level: 'KEY',
      keyMaterials: ['板材', '封边带']
    },
    infoCheck: {
      checkBOM: true,
      checkCustomer: true,
      checkAddress: false
    },
    techCheck: {
      checkSplit: true,
      checkDrawing: false,
      checkProcessRoute: true,
      checkSize: true,
      minLength: 100,
      maxLength: 2800,
      minWidth: 100,
      maxWidth: 1200,
      minThickness: 5,
      maxThickness: 25
    },
    deliveryCheck: {
      checkFeasibility: true,
      minLeadTime: 3,
      allowDelay: 2,
      autoPriority: true
    },
    other: {
      skipAudited: true,
      detailedLog: false
    }
  }
  
  const savedRules = localStorage.getItem('preprocess_rules')
  if (savedRules) {
    return JSON.parse(savedRules)
  }
  return defaultRules
}

export const preprocessOrders = async (params) => {
  await delay(1000) // 模拟较长时间处理
  const data = getData()
  
  // 获取预处理规则
  const rules = getPreprocessRules()

  let orders = data.orders.filter(o => o.status === '待审核')
  if (params.orderPoolScope === 'CUSTOM' && params.customOrderIds) {
    orders = orders.filter(o => params.customOrderIds.includes(o.orderNo))
  }

  const qualifiedOrders = []
  const unqualifiedOrders = []

  // 定义详细的失败原因和详情
  const failureReasons = [
    {
      reason: '物料缺料',
      details: '18mm子午灰颗粒板库存不足，缺料15张',
      suggestion: '联系采购部门补货或调整生产计划'
    },
    {
      reason: '物料缺料',
      details: '1mm子午灰ABS封边带库存不足，缺料200米',
      suggestion: '检查辅料仓库存，及时补货'
    },
    {
      reason: '物料缺料',
      details: '三合一连接件库存不足，缺料500件',
      suggestion: '联系五金供应商紧急发货'
    },
    {
      reason: '拆单数据缺失',
      details: '订单ORD20260325001缺少背板尺寸数据',
      suggestion: '联系设计部门补充拆单数据'
    },
    {
      reason: '拆单数据缺失',
      details: '部分板件缺少封边工艺要求信息',
      suggestion: '完善拆单数据的工艺参数'
    },
    {
      reason: '拆单数据缺失',
      details: '门板缺少开孔位置和尺寸信息',
      suggestion: '补充门板的开孔图纸'
    },
    {
      reason: '信息不完整',
      details: '客户安装地址信息缺失，无法安排配送',
      suggestion: '联系销售人员补全客户信息'
    },
    {
      reason: '信息不完整',
      details: '订单备注中特殊工艺要求不明确',
      suggestion: '与客户确认具体工艺要求'
    },
    {
      reason: '信息不完整',
      details: '交货期与生产产能冲突，无法按时交付',
      suggestion: '与客户协商调整交货期'
    },
    {
      reason: '尺寸超出加工范围',
      details: '板件尺寸1250×800mm超出电子锯加工范围(最大1220mm)',
      suggestion: '调整板件尺寸或使用其他加工方式'
    },
    {
      reason: '尺寸超出加工范围',
      details: '抽屉面板厚度25mm，超出封边机加工能力',
      suggestion: '更换合适的封边设备'
    },
    {
      reason: '工艺路线缺失',
      details: '异形板件未配置对应的镂铣工艺路线',
      suggestion: '在工艺路线管理中添加镂铣工序'
    },
    {
      reason: '工艺路线缺失',
      details: '拉米诺连接件未配置对应的钻孔工艺参数',
      suggestion: '完善拉米诺连接的钻孔工艺'
    },
    {
      reason: '交期异常',
      details: '订单交货期仅剩3天，生产周期不足',
      suggestion: '标记为紧急订单，优先安排生产'
    },
    {
      reason: '交期异常',
      details: '订单交货期早于当前日期，已过期',
      suggestion: '联系客户重新确认交货期'
    }
  ]

  orders.forEach((order, index) => {
    // 模拟预处理逻辑 - 让部分订单不合格以展示效果
    // 对于批量操作，确保至少有20-30%的不合格订单
    let isQualified
    if (index === 0 && params.customOrderIds?.length > 1) {
      // 批量操作时，第一个订单强制为不合格（物料缺料）
      isQualified = false
    } else {
      isQualified = params.customOrderIds?.length > 1
        ? Math.random() > 0.25  // 批量时75%合格率
        : Math.random() > 0.1   // 单个时90%合格率
    }

    if (isQualified) {
      order.status = '待排产'
      qualifiedOrders.push({
        orderNo: order.orderNo,
        customerName: order.customerName,
        productType: order.productType,
        deliveryDate: order.deliveryDate,
        priority: order.priority,
        panelCount: order.panelCount,
        preprocessTime: new Date().toISOString(),
        executor: '张三'
      })
    } else {
      order.status = '审核失败'
      // 选择失败原因（第一个订单强制选择物料缺料）
      let failureIndex
      if (index === 0 && params.customOrderIds?.length > 1) {
        failureIndex = 0 // 物料缺料
      } else {
        failureIndex = Math.floor(Math.random() * failureReasons.length)
      }
      
      const failureInfo = failureReasons[failureIndex]
      unqualifiedOrders.push({
        orderNo: order.orderNo,
        customerName: order.customerName,
        productType: order.productType,
        orderType: order.orderType,
        reason: failureInfo.reason,
        details: failureInfo.details,
        suggestion: failureInfo.suggestion,
        checkTime: new Date().toISOString(),
        executor: '李四',
        materialShortage: failureInfo.reason === '物料缺料' ? {
          materialNo: 'MAT001',
          materialName: '18mm子午灰颗粒板',
          required: 45,
          available: 30,
          shortage: 15,
          unit: '张',
          warehouse: '原料仓',
          supplier: '板材供应商A',
          leadTime: 3,
          estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        } : null
      })
    }
  })

  saveData(data)

  return success({
    total: orders.length,
    qualifiedOrderCount: qualifiedOrders.length,
    unqualifiedOrderCount: unqualifiedOrders.length,
    qualifiedOrders,
    unqualifiedOrders
  })
}

// 获取预处理结果
export const getPreprocessResult = async (orderNo) => {
  await delay()
  const data = getData()
  const order = data.orders.find(o => o.orderNo === orderNo)
  if (!order) {
    return error('订单不存在')
  }

  // 模拟预处理历史记录（实际应该从后端获取）
  const preprocessHistory = [
    {
      executor: '张三',
      executeTime: '2026-03-25 14:30:00',
      status: order.status === '待排产' ? 'QUALIFIED' : 'UNQUALIFIED',
      infoValidation: 'PASSED',
      splitAudit: 'PASSED',
      materialCheck: {
        status: order.status === '待排产' ? 'PASSED' : 'FAILED',
        details: order.status === '待排产' ? [] : [{ material: '18mm子午灰颗粒板', shortage: 5 }]
      },
      priority: order.priority
    }
  ]

  // 如果订单状态不是待审核，添加更多历史记录
  if (order.status !== '待审核') {
    preprocessHistory.push({
      executor: '李四',
      executeTime: '2026-03-24 10:15:00',
      status: 'UNQUALIFIED',
      infoValidation: 'FAILED',
      splitAudit: 'PASSED',
      materialCheck: {
        status: 'FAILED',
        details: [{ material: '18mm子午灰颗粒板', shortage: 8 }]
      },
      priority: '紧急'
    })
  }

  const result = {
    orderId: orderNo,
    status: order.status === '待排产' ? 'QUALIFIED' : 'UNQUALIFIED',
    infoValidation: 'PASSED',
    splitAudit: 'PASSED',
    materialCheck: {
      status: order.status === '待排产' ? 'PASSED' : 'FAILED',
      details: order.status === '待排产' ? [] : [{ material: '18mm子午灰颗粒板', shortage: 5 }]
    },
    priority: order.priority,
    // 最近一次预处理信息
    latestPreprocess: preprocessHistory[0],
    // 预处理历史记录
    preprocessHistory: preprocessHistory
  }

  return success(result)
}

// ==================== 批次API ====================

// 获取批次列表
export const getBatches = async (params = {}) => {
  await delay()
  const data = getData()
  let batches = [...data.batches]

  // 筛选
  if (params.status) {
    batches = batches.filter(b => b.status === params.status)
  }
  if (params.productionLine) {
    batches = batches.filter(b => b.productionLine === params.productionLine)
  }
  if (params.color) {
    batches = batches.filter(b => b.color === params.color)
  }

  // 排序
  batches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  // 分页
  const page = params.page || 1
  const pageSize = params.pageSize || 20
  const total = batches.length
  const start = (page - 1) * pageSize
  const list = batches.slice(start, start + pageSize)

  return success({ total, list, page, pageSize })
}

// 获取批次详情
export const getBatchDetail = async (batchNo) => {
  await delay()
  const data = getData()
  const batch = data.batches.find(b => b.batchNo === batchNo)
  if (!batch) {
    return error('批次不存在')
  }

  // 获取批次的板件
  const panels = data.panels.filter(p => p.batchNo === batchNo)

  // 获取批次包含的订单
  const orders = data.orders.filter(o => batch.orderIds.includes(o.orderNo))

  return success({ ...batch, panels, orders })
}

// 批次规划
export const planBatches = async (params) => {
  await delay(2000) // 模拟较长时间处理
  const data = getData()

  // 获取待排产订单
  let orders = data.orders.filter(o => o.status === '待排产')
  if (params.orderIds) {
    orders = orders.filter(o => params.orderIds.includes(o.orderNo))
  }

  // 按花色、厚度、材质分组
  const groups = {}
  orders.forEach(order => {
    const orderPanels = data.panels.filter(p => p.orderNo === order.orderNo)
    orderPanels.forEach(panel => {
      const key = `${panel.color}_${panel.thickness}_${panel.material}`
      if (!groups[key]) {
        groups[key] = { orders: [], panels: [], color: panel.color, thickness: panel.thickness, material: panel.material }
      }
      if (!groups[key].orders.includes(order)) {
        groups[key].orders.push(order)
      }
      groups[key].panels.push(panel)
    })
  })

  // 生成批次
  const batches = []
  const groupKeys = Object.keys(groups)
  for (let i = 0; i < groupKeys.length; i++) {
    const group = groups[groupKeys[i]]
    const batchNo = `PC${Date.now()}${String(i + 1).padStart(3, '0')}`

    const batch = {
      batchNo,
      orderIds: group.orders.map(o => o.orderNo),
      color: group.color,
      thickness: group.thickness,
      material: group.material,
      planStartDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      planEndDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      productionLine: '电子锯线1',
      utilizationRate: (Math.random() * 10 + 85).toFixed(1),
      status: '待下发',
      panelCount: group.panels.length,
      optimizeImagePath: `/images/optimize/${batchNo}.png`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 更新板件的批次号
    group.panels.forEach(panel => {
      panel.batchNo = batchNo
    })

    // 更新订单状态
    group.orders.forEach(order => {
      order.status = '已排产'
    })

    batches.push(batch)
    data.batches.push(batch)
  }

  saveData(data)

  const avgUtilization = batches.reduce((sum, b) => sum + parseFloat(b.utilizationRate), 0) / batches.length

  return success({
    batchCount: batches.length,
    batches,
    averageUtilizationRate: avgUtilization.toFixed(1)
  })
}

// ==================== 排程API ====================

// 排程优化
export const optimizeSchedules = async (params) => {
  await delay(1500)
  const data = getData()

  let batches = data.batches.filter(b => b.status === '待下发')
  if (params.batchNos) {
    batches = batches.filter(b => params.batchNos.includes(b.batchNo))
  }

  const schedules = batches.map(batch => ({
    batchNo: batch.batchNo,
    planStartDate: batch.planStartDate,
    planEndDate: batch.planEndDate,
    processes: [
      { processName: '开料', startTime: `${batch.planStartDate}T08:00:00`, endTime: `${batch.planStartDate}T17:00:00`, equipment: '电子锯1' },
      { processName: '封边', startTime: `${batch.planStartDate}T18:00:00`, endTime: `${batch.planEndDate}T12:00:00`, equipment: '封边机1' },
      { processName: '钻孔', startTime: `${batch.planEndDate}T13:00:00`, endTime: `${batch.planEndDate}T17:00:00`, equipment: '六面钻1' }
    ]
  }))

  return success({
    scheduleCount: schedules.length,
    schedules
  })
}

// 下发指令
export const issueInstructions = async (params) => {
  await delay(1000)
  const data = getData()

  const results = params.batchNos.map(batchNo => {
    const batch = data.batches.find(b => b.batchNo === batchNo)
    if (!batch) {
      return { batchNo, status: 'FAILED', error: '批次不存在' }
    }

    batch.status = '已下发'
    return {
      batchNo,
      status: 'SUCCESS',
      mesInstructionId: `MES${Date.now()}`,
      deliveryOrderId: `DL${Date.now()}`
    }
  })

  saveData(data)

  const successCount = results.filter(r => r.status === 'SUCCESS').length
  const failedCount = results.filter(r => r.status === 'FAILED').length

  return success({
    successCount,
    failedCount,
    results
  })
}

// ==================== 监控API ====================

// 获取生产进度
export const getProgress = async (params = {}) => {
  await delay()
  const data = getData()

  let batches = data.batches.filter(b => b.status === '生产中' || b.status === '已下发')
  if (params.batchNo) {
    batches = batches.filter(b => b.batchNo === params.batchNo)
  }

  const progressData = batches.map(batch => {
    const plannedProgress = 60 + Math.random() * 20
    const actualProgress = plannedProgress - Math.random() * 15
    const deviationRate = ((actualProgress - plannedProgress) / plannedProgress * 100).toFixed(1)

    return {
      batchNo: batch.batchNo,
      plannedProgress: plannedProgress.toFixed(1),
      actualProgress: actualProgress.toFixed(1),
      deviationRate: parseFloat(deviationRate),
      status: deviationRate < -10 ? 'DELAYED' : 'NORMAL',
      estimatedCompletionTime: `${batch.planEndDate}T${14 + Math.floor(Math.random() * 4)}:00:00`
    }
  })

  return success({ batches: progressData })
}

// 排程调整
export const adjustSchedule = async (params) => {
  await delay(800)
  const data = getData()

  const batch = data.batches.find(b => b.batchNo === params.batchNo)
  if (!batch) {
    return error('批次不存在')
  }

  // 模拟调整影响
  const affectedOrders = batch.orderIds.slice(0, 2)
  const newDeliveryDates = {}
  affectedOrders.forEach(orderId => {
    const order = data.orders.find(o => o.orderNo === orderId)
    if (order) {
      const newDate = new Date(order.deliveryDate)
      newDate.setDate(newDate.getDate() + (params.params.delayDays || 1))
      newDeliveryDates[orderId] = newDate.toISOString().split('T')[0]
    }
  })

  return success({
    adjustResult: 'SUCCESS',
    impactAnalysis: {
      affectedOrders,
      newDeliveryDates
    }
  })
}

// ==================== 策略API ====================

// 获取策略列表
export const getStrategies = async () => {
  await delay()
  const data = getData()
  return success(data.strategies)
}

// 创建策略
export const createStrategy = async (params) => {
  await delay()
  const data = getData()

  const strategy = {
    strategyId: `STR${Date.now()}`,
    ...params,
    enabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  data.strategies.push(strategy)
  saveData(data)

  return success(strategy)
}

// 更新策略
export const updateStrategy = async (strategyId, params) => {
  await delay()
  const data = getData()

  const index = data.strategies.findIndex(s => s.strategyId === strategyId)
  if (index === -1) {
    return error('策略不存在')
  }

  data.strategies[index] = {
    ...data.strategies[index],
    ...params,
    updatedAt: new Date().toISOString()
  }

  saveData(data)

  return success(data.strategies[index])
}

// 激活策略
export const activateStrategy = async (strategyId) => {
  await delay()
  const data = getData()

  // 先停用所有策略
  data.strategies.forEach(s => s.enabled = false)

  // 激活指定策略
  const strategy = data.strategies.find(s => s.strategyId === strategyId)
  if (!strategy) {
    return error('策略不存在')
  }

  strategy.enabled = true
  strategy.updatedAt = new Date().toISOString()

  saveData(data)

  return success(strategy)
}

// 删除策略
export const deleteStrategy = async (strategyId) => {
  await delay()
  const data = getData()

  const index = data.strategies.findIndex(s => s.strategyId === strategyId)
  if (index === -1) {
    return error('策略不存在')
  }

  if (data.strategies[index].enabled) {
    return error('不能删除已启用的策略')
  }

  data.strategies.splice(index, 1)
  saveData(data)

  return success(null, '删除成功')
}

// ==================== 产能API ====================

// 获取产线列表
export const getProductionLines = async () => {
  await delay()
  const data = getData()
  return success(data.productionLines)
}

// 更新产线
export const updateProductionLine = async (lineId, params) => {
  await delay()
  const data = getData()

  const index = data.productionLines.findIndex(l => l.lineId === lineId)
  if (index === -1) {
    return error('产线不存在')
  }

  data.productionLines[index] = {
    ...data.productionLines[index],
    ...params
  }

  saveData(data)

  return success(data.productionLines[index])
}

// 获取工艺路线列表
export const getProcessRoutes = async () => {
  await delay()
  const data = getData()
  return success(data.processRoutes)
}

// 更新工艺路线
export const updateProcessRoute = async (routeId, params) => {
  await delay()
  const data = getData()

  const index = data.processRoutes.findIndex(r => r.routeId === routeId)
  if (index === -1) {
    return error('工艺路线不存在')
  }

  data.processRoutes[index] = {
    ...data.processRoutes[index],
    ...params
  }

  saveData(data)

  return success(data.processRoutes[index])
}

// ==================== 工具函数 ====================

// 重置数据
export const resetData = () => {
  const data = initMockData()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return success(null, '数据已重置')
}
