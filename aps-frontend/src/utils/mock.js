// 演示数据生成函数

// 生成随机中文姓名
const generateChineseName = () => {
  const surnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '罗', '高']
  const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '洋', '艳', '勇', '军', '杰', '娟', '涛', '明', '超', '秀英', '华', '平']
  return surnames[Math.floor(Math.random() * surnames.length)] + names[Math.floor(Math.random() * names.length)]
}

// 生成随机日期
const generateRandomDate = (startDays, endDays) => {
  const now = new Date()
  const days = Math.floor(Math.random() * (endDays - startDays)) + startDays
  const date = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return date.toISOString().split('T')[0]
}

// 生成订单号
export const generateOrderNo = (index) => {
  const date = new Date()
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  return `ORD${dateStr}${String(index).padStart(3, '0')}`
}

// 生成板件号
export const generatePanelNo = (orderNo, index) => {
  return `BJ${orderNo}${String(index).padStart(3, '0')}`
}

// 生成批次号
export const generateBatchNo = (index) => {
  const date = new Date()
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  return `PC${dateStr}${String(index).padStart(3, '0')}`
}

// 生成订单演示数据
export const generateOrders = (count = 200) => {
  const orders = []
  const productTypes = ['衣柜', '橱柜', '电视柜', '书柜', '鞋柜']
  const productWeights = [0.4, 0.3, 0.2, 0.05, 0.05]
  const statuses = ['待审核', '技术审核中', '齐套检查中', '待排产', '已排产', '生产中', '已完成', '已取消']
  const statusWeights = [0.2, 0.05, 0.05, 0.3, 0.2, 0.15, 0.04, 0.01]
  const priorities = ['普通', '紧急', '特急']
  const priorityWeights = [0.7, 0.25, 0.05]
  const orderTypes = ['标准订单', '加急订单', '补件订单']
  const orderTypeWeights = [0.7, 0.2, 0.1]

  for (let i = 1; i <= count; i++) {
    // 根据权重随机选择
    const productType = productTypes[weightedRandom(productWeights)]
    const status = statuses[weightedRandom(statusWeights)]
    const priority = priorities[weightedRandom(priorityWeights)]
    const orderType = orderTypes[weightedRandom(orderTypeWeights)]

    const order = {
      orderNo: generateOrderNo(i),
      customerName: generateChineseName(),
      productType,
      deliveryDate: generateRandomDate(7, 30),
      status,
      priority,
      orderType,
      panelCount: Math.floor(Math.random() * 36) + 15, // 15-50件
      specialProcess: Math.random() > 0.8 ? ['异形', '拉米诺连接'][Math.floor(Math.random() * 2)] : null,
      remark: Math.random() > 0.9 ? '客户要求加急处理' : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    orders.push(order)
  }

  return orders
}

// 生成工件演示数据(包含板件和五金件)
export const generatePanels = (orders) => {
  const panels = []
  const panelTypes = ['柜体板', '门板', '背板', '装饰条', '抽面']
  const panelWeights = [0.4, 0.35, 0.15, 0.05, 0.05]
  const thicknesses = ['18', '9', '25']
  const thicknessWeights = [0.6, 0.25, 0.15]
  const colors = ['子午灰', '黑胡桃', '羊绒灰', '白橡木', '胡桃木', '深空灰']
  const colorWeights = [0.3, 0.25, 0.2, 0.1, 0.1, 0.05]
  const materials = ['颗粒板', '多层板']
  const materialWeights = [0.7, 0.3]

  // 五金件类型
  const hardwareTypes = ['铰链', '滑轨', '拉手', '层板托', '衣通', '裤架', '阻尼器', '防撞粒']
  const hardwareWeights = [0.25, 0.2, 0.15, 0.1, 0.1, 0.08, 0.07, 0.05]

  orders.forEach(order => {
    // 生成板件数据(约80%的工件是板件)
    const panelCount = Math.floor(order.panelCount * 0.8)
    for (let i = 1; i <= panelCount; i++) {
      const panelType = panelTypes[weightedRandom(panelWeights)]
      const thickness = thicknesses[weightedRandom(thicknessWeights)]
      const color = colors[weightedRandom(colorWeights)]
      const material = materials[weightedRandom(materialWeights)]

      // 根据产品类型生成合理尺寸
      let length, width
      if (order.productType === '衣柜') {
        length = Math.floor(Math.random() * 800) + 400 // 400-1200mm
        width = Math.floor(Math.random() * 600) + 300 // 300-900mm
      } else if (order.productType === '橱柜') {
        length = Math.floor(Math.random() * 600) + 400 // 400-1000mm
        width = Math.floor(Math.random() * 500) + 300 // 300-800mm
      } else {
        length = Math.floor(Math.random() * 500) + 300 // 300-800mm
        width = Math.floor(Math.random() * 400) + 200 // 200-600mm
      }

      // 计算面积(平方米)
      const area = ((length * width) / 1000000).toFixed(4)

      const panel = {
        panelNo: generatePanelNo(order.orderNo, i),
        orderNo: order.orderNo,
        panelType,
        length,
        width,
        thickness: parseInt(thickness),
        color,
        material,
        edgeRequirement: ['四边封直边', '两边封直边', '四边封异形边'][Math.floor(Math.random() * 3)],
        processRoute: getProcessRoute(panelType),
        batchNo: null,
        area, // 新增面积字段
        itemType: '板件' // 新增工件类型字段
      }
      panels.push(panel)
    }

    // 生成五金件数据(约20%的工件是五金件)
    const hardwareCount = order.panelCount - panelCount
    for (let i = panelCount + 1; i <= order.panelCount; i++) {
      const hardwareType = hardwareTypes[weightedRandom(hardwareWeights)]
      
      // 根据五金类型生成规格
      let specification = ''
      let quantity = 1
      
      switch (hardwareType) {
        case '铰链':
          specification = ['全盖液压缓冲', '半盖液压缓冲', '直臂液压缓冲'][Math.floor(Math.random() * 3)]
          quantity = Math.floor(Math.random() * 8) + 4 // 4-12个
          break
        case '滑轨':
          specification = ['三节静音滑轨', '两节滑轨', '隐藏式滑轨'][Math.floor(Math.random() * 3)]
          quantity = Math.floor(Math.random() * 6) + 2 // 2-8副
          break
        case '拉手':
          specification = ['铝合金隐形拉手', '不锈钢拉手', '一字拉手'][Math.floor(Math.random() * 3)]
          quantity = Math.floor(Math.random() * 6) + 2 // 2-8个
          break
        case '层板托':
          specification = ['钢制层板托', '铝合金层板托'][Math.floor(Math.random() * 2)]
          quantity = Math.floor(Math.random() * 10) + 5 // 5-15个
          break
        case '衣通':
          specification = ['铝合金衣通杆', '不锈钢衣通杆'][Math.floor(Math.random() * 2)]
          quantity = Math.floor(Math.random() * 4) + 1 // 1-5根
          break
        case '裤架':
          specification = '不锈钢裤架'
          quantity = Math.floor(Math.random() * 3) + 1 // 1-3个
          break
        case '阻尼器':
          specification = '液压阻尼器'
          quantity = Math.floor(Math.random() * 10) + 5 // 5-15个
          break
        case '防撞粒':
          specification = '硅胶防撞粒'
          quantity = Math.floor(Math.random() * 20) + 10 // 10-30个
          break
      }

      const hardware = {
        panelNo: generatePanelNo(order.orderNo, i),
        orderNo: order.orderNo,
        panelType: hardwareType,
        length: null,
        width: null,
        thickness: null,
        color: null,
        material: specification,
        edgeRequirement: null,
        processRoute: ['质检'],
        batchNo: null,
        area: '', // 五金件没有面积
        itemType: '五金件', // 工件类型
        quantity: quantity, // 数量
        specification: specification // 规格型号
      }
      panels.push(hardware)
    }
  })

  return panels
}

// 获取工艺路径
const getProcessRoute = (panelType) => {
  const routes = {
    '柜体板': ['开料', '封边', '钻孔', '质检'],
    '门板': ['开料', '铣型', '封边', '质检'],
    '背板': ['开料', '封边', '质检'],
    '装饰条': ['开料', '镂铣', '质检'],
    '抽面': ['开料', '封边', '质检']
  }
  return routes[panelType] || ['开料', '封边', '质检']
}

// 生成批次演示数据
export const generateBatches = (orders, panels, count = 50) => {
  const batches = []
  const productionLines = ['电子锯线1', '电子锯线2', '封边线A', '封边线B', '钻孔线', '包装线']
  const statuses = ['待下发', '已下发', '生产中', '已完成']
  const statusWeights = [0.3, 0.3, 0.3, 0.1]

  // 按花色、厚度、材质分组
  const groups = {}
  panels.forEach(panel => {
    const key = `${panel.color}_${panel.thickness}_${panel.material}`
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(panel)
  })

  // 为每个分组创建批次
  const groupKeys = Object.keys(groups)
  const batchCount = Math.min(count, groupKeys.length)

  for (let i = 0; i < batchCount; i++) {
    const groupKey = groupKeys[i]
    const groupPanels = groups[groupKey]
    const [color, thickness, material] = groupKey.split('_')

    // 随机选择2-8个订单
    const orderCount = Math.floor(Math.random() * 7) + 2
    const selectedOrders = orders.slice(i * 2, i * 2 + orderCount)
    const orderIds = selectedOrders.map(o => o.orderNo)

    // 筛选属于这些订单的板件
    const batchPanels = groupPanels.filter(p => orderIds.includes(p.orderNo))

    const batch = {
      batchNo: generateBatchNo(i + 1),
      orderIds,
      color,
      thickness: parseInt(thickness),
      material,
      planStartDate: generateRandomDate(1, 5),
      planEndDate: generateRandomDate(6, 10),
      productionLine: productionLines[Math.floor(Math.random() * 2)], // 只选择开料线
      utilizationRate: (Math.random() * 10 + 85).toFixed(1), // 85-95%
      status: statuses[weightedRandom(statusWeights)],
      panelCount: batchPanels.length,
      optimizeImagePath: `/images/optimize/${generateBatchNo(i + 1)}.png`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 更新板件的批次号
    batchPanels.forEach(panel => {
      panel.batchNo = batch.batchNo
    })

    batches.push(batch)
  }

  return batches
}

// 生成产线演示数据
export const generateProductionLines = () => {
  return [
    {
      lineId: 'LINE001',
      lineName: '电子锯线1',
      lineType: '开料线',
      standardCapacity: 500,
      status: '正常',
      workshop: '车间A',
      mainEquipments: ['电子锯1', '电子锯2']
    },
    {
      lineId: 'LINE002',
      lineName: '电子锯线2',
      lineType: '开料线',
      standardCapacity: 450,
      status: '正常',
      workshop: '车间A',
      mainEquipments: ['电子锯3', '电子锯4']
    },
    {
      lineId: 'LINE003',
      lineName: '封边线A',
      lineType: '封边线',
      standardCapacity: 600,
      status: '正常',
      workshop: '车间A',
      mainEquipments: ['封边机1', '封边机2']
    },
    {
      lineId: 'LINE004',
      lineName: '封边线B',
      lineType: '封边线',
      standardCapacity: 550,
      status: '维护中',
      workshop: '车间B',
      mainEquipments: ['封边机3', '封边机4']
    },
    {
      lineId: 'LINE005',
      lineName: '钻孔线',
      lineType: '钻孔线',
      standardCapacity: 700,
      status: '正常',
      workshop: '车间A',
      mainEquipments: ['六面钻1', '六面钻2']
    },
    {
      lineId: 'LINE006',
      lineName: '包装线',
      lineType: '包装线',
      standardCapacity: 800,
      status: '正常',
      workshop: '车间B',
      mainEquipments: ['包装机1', '包装机2']
    }
  ]
}

// 生成工艺路线演示数据
export const generateProcessRoutes = () => {
  return [
    {
      routeId: 'ROUTE001',
      panelType: '柜体板',
      processSequence: ['开料', '封边', '钻孔', '质检'],
      standardWorkTime: 15,
      requiredEquipments: ['电子锯', '封边机', '六面钻'],
      processRequirement: null
    },
    {
      routeId: 'ROUTE002',
      panelType: '门板',
      processSequence: ['开料', '铣型', '封边', '质检'],
      standardWorkTime: 20,
      requiredEquipments: ['电子锯', '加工中心', '封边机'],
      processRequirement: '需要五轴加工中心'
    },
    {
      routeId: 'ROUTE003',
      panelType: '背板',
      processSequence: ['开料', '封边', '质检'],
      standardWorkTime: 10,
      requiredEquipments: ['电子锯', '封边机'],
      processRequirement: null
    },
    {
      routeId: 'ROUTE004',
      panelType: '装饰条',
      processSequence: ['开料', '镂铣', '质检'],
      standardWorkTime: 25,
      requiredEquipments: ['电子锯', '镂铣机'],
      processRequirement: '需要镂铣设备'
    }
  ]
}

// 生成策略演示数据
export const generateStrategies = () => {
  return [
    {
      strategyId: 'STR001',
      strategyName: '成本优先',
      description: '优先考虑板材利用率与换模成本,适合订单交期充裕的场景',
      priorityWeights: {
        utilizationRate: 0.5,
        deliverySatisfaction: 0.2,
        changeoverCost: 0.3,
        capacityBalance: 0
      },
      constraints: [
        {
          constraintName: '板材利用率下限',
          type: 'MIN',
          expression: 'utilizationRate',
          threshold: 85.0
        }
      ],
      // 不可分割需求配置
      indivisibleRequirements: {
        orderIndivisible: false,
        productIndivisible: false,
        batchIndivisible: false,
        reason: ''
      },
      // 优先级规则配置
      priorityRules: {
        enableOrderTypePriority: false,
        orderTypeWeights: {
          '补件订单': 1.5,
          '加急订单': 1.3,
          '标准订单': 1.0
        },
        enableInsertOrderPriority: false,
        insertOrderWeight: 1.4,
        enableCustomerGrouping: false,
        customerGroupingWeight: 0.8,
        enableDeliveryDateGrouping: false,
        deliveryDateGroupingDays: 3
      },
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      strategyId: 'STR002',
      strategyName: '交期优先',
      description: '优先保证订单交期,适合紧急订单较多的场景',
      priorityWeights: {
        utilizationRate: 0.3,
        deliverySatisfaction: 0.5,
        changeoverCost: 0.2,
        capacityBalance: 0
      },
      constraints: [
        {
          constraintName: '板材利用率下限',
          type: 'MIN',
          expression: 'utilizationRate',
          threshold: 80.0
        }
      ],
      // 不可分割需求配置
      indivisibleRequirements: {
        orderIndivisible: false,
        productIndivisible: false,
        batchIndivisible: false,
        reason: ''
      },
      // 优先级规则配置
      priorityRules: {
        enableOrderTypePriority: true,
        orderTypeWeights: {
          '补件订单': 2.0,
          '加急订单': 1.5,
          '标准订单': 1.0
        },
        enableInsertOrderPriority: true,
        insertOrderWeight: 1.8,
        enableCustomerGrouping: false,
        customerGroupingWeight: 0.8,
        enableDeliveryDateGrouping: true,
        deliveryDateGroupingDays: 5
      },
      enabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      strategyId: 'STR003',
      strategyName: '产能均衡',
      description: '优先平衡各产线负荷,避免产能浪费',
      priorityWeights: {
        utilizationRate: 0.3,
        deliverySatisfaction: 0.3,
        changeoverCost: 0.2,
        capacityBalance: 0.2
      },
      constraints: [
        {
          constraintName: '板材利用率下限',
          type: 'MIN',
          expression: 'utilizationRate',
          threshold: 82.0
        },
        {
          constraintName: '产能利用率上限',
          type: 'MAX',
          expression: 'capacityUtilization',
          threshold: 95.0
        }
      ],
      // 不可分割需求配置
      indivisibleRequirements: {
        orderIndivisible: true,
        productIndivisible: false,
        batchIndivisible: true,
        reason: '为保证客户订单完整性,同一订单不拆分到不同批次'
      },
      // 优先级规则配置
      priorityRules: {
        enableOrderTypePriority: true,
        orderTypeWeights: {
          '补件订单': 1.8,
          '加急订单': 1.4,
          '标准订单': 1.0
        },
        enableInsertOrderPriority: false,
        insertOrderWeight: 1.5,
        enableCustomerGrouping: true,
        customerGroupingWeight: 0.9,
        enableDeliveryDateGrouping: true,
        deliveryDateGroupingDays: 7
      },
      enabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
}

// 生成物料演示数据
export const generateMaterials = () => {
  return [
    { materialNo: 'MAT001', materialName: '18mm子午灰颗粒板', materialType: '板材', specification: '2440×1220×18mm', stockQuantity: 150, safetyStock: 50, warehouse: '原料仓' },
    { materialNo: 'MAT002', materialName: '18mm黑胡桃颗粒板', materialType: '板材', specification: '2440×1220×18mm', stockQuantity: 120, safetyStock: 50, warehouse: '原料仓' },
    { materialNo: 'MAT003', materialName: '18mm羊绒灰颗粒板', materialType: '板材', specification: '2440×1220×18mm', stockQuantity: 100, safetyStock: 50, warehouse: '原料仓' },
    { materialNo: 'MAT004', materialName: '18mm白橡木颗粒板', materialType: '板材', specification: '2440×1220×18mm', stockQuantity: 80, safetyStock: 40, warehouse: '原料仓' },
    { materialNo: 'MAT005', materialName: '9mm背板', materialType: '板材', specification: '2440×1220×9mm', stockQuantity: 200, safetyStock: 80, warehouse: '原料仓' },
    { materialNo: 'MAT006', materialName: '25mm台面支撑板', materialType: '板材', specification: '2440×1220×25mm', stockQuantity: 60, safetyStock: 30, warehouse: '原料仓' },
    { materialNo: 'MAT007', materialName: '1mm子午灰ABS封边带', materialType: '封边带', specification: '1×22mm', stockQuantity: 5000, safetyStock: 1000, warehouse: '辅料仓' },
    { materialNo: 'MAT008', materialName: '1mm黑胡桃ABS封边带', materialType: '封边带', specification: '1×22mm', stockQuantity: 4000, safetyStock: 1000, warehouse: '辅料仓' },
    { materialNo: 'MAT009', materialName: '1mm羊绒灰ABS封边带', materialType: '封边带', specification: '1×22mm', stockQuantity: 3500, safetyStock: 1000, warehouse: '辅料仓' },
    { materialNo: 'MAT010', materialName: '三合一连接件', materialType: '五金', specification: 'φ15×13mm', stockQuantity: 10000, safetyStock: 2000, warehouse: '五金仓' },
    { materialNo: 'MAT011', materialName: '铰链', materialType: '五金', specification: '全盖液压缓冲', stockQuantity: 8000, safetyStock: 1500, warehouse: '五金仓' },
    { materialNo: 'MAT012', materialName: '滑轨', materialType: '五金', specification: '三节静音滑轨', stockQuantity: 6000, safetyStock: 1000, warehouse: '五金仓' },
    { materialNo: 'MAT013', materialName: '拉手', materialType: '五金', specification: '铝合金隐形拉手', stockQuantity: 5000, safetyStock: 1000, warehouse: '五金仓' },
    { materialNo: 'MAT014', materialName: '层板托', materialType: '五金', specification: '钢制层板托', stockQuantity: 8000, safetyStock: 1500, warehouse: '五金仓' },
    { materialNo: 'MAT015', materialName: '衣通', materialType: '功能件', specification: '铝合金衣通杆', stockQuantity: 2000, safetyStock: 500, warehouse: '五金仓' },
    { materialNo: 'MAT016', materialName: '裤架', materialType: '功能件', specification: '不锈钢裤架', stockQuantity: 1500, safetyStock: 300, warehouse: '五金仓' },
    { materialNo: 'MAT017', materialName: '穿衣镜', materialType: '功能件', specification: '全身镜', stockQuantity: 800, safetyStock: 200, warehouse: '五金仓' },
    { materialNo: 'MAT018', materialName: '拉篮', materialType: '功能件', specification: '不锈钢拉篮', stockQuantity: 1200, safetyStock: 300, warehouse: '五金仓' },
    { materialNo: 'MAT019', materialName: '阻尼器', materialType: '五金', specification: '液压阻尼器', stockQuantity: 6000, safetyStock: 1000, warehouse: '五金仓' },
    { materialNo: 'MAT020', materialName: '防撞粒', materialType: '五金', specification: '硅胶防撞粒', stockQuantity: 10000, safetyStock: 2000, warehouse: '五金仓' }
  ]
}

// 加权随机选择
const weightedRandom = (weights) => {
  const total = weights.reduce((sum, w) => sum + w, 0)
  let random = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return i
    }
  }
  return weights.length - 1
}

// 初始化所有演示数据
export const initMockData = () => {
  const orders = generateOrders(200)
  const panels = generatePanels(orders)
  const batches = generateBatches(orders, panels, 50)
  const productionLines = generateProductionLines()
  const processRoutes = generateProcessRoutes()
  const strategies = generateStrategies()
  const materials = generateMaterials()

  return {
    orders,
    panels,
    batches,
    productionLines,
    processRoutes,
    strategies,
    materials
  }
}
