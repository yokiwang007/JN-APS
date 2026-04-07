// API配置和模式切换

// 当前模式: 'mock' (模拟数据) | 'api' (真实后端API)
export const API_MODE = localStorage.getItem('api_mode') || 'mock'

// API基础URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002'

// 设置API模式
export const setApiMode = (mode) => {
  if (mode === 'mock' || mode === 'api') {
    localStorage.setItem('api_mode', mode)
    // 重新加载页面以应用新模式
    window.location.reload()
  }
}

// 获取当前模式
export const getApiMode = () => API_MODE

// 检查是否使用模拟数据
export const isMockMode = () => API_MODE === 'mock'

// 检查是否使用真实API
export const isApiMode = () => API_MODE === 'api'

// API端点配置
export const API_ENDPOINTS = {
  // 订单管理
  GET_ORDERS: '/api/v2/erp-orders',
  GET_ORDER_DETAIL: '/api/v2/erp-orders/:orderId',
  CREATE_ORDER: '/api/v2/erp-orders',
  UPDATE_ORDER: '/api/v2/erp-orders/:orderId',
  DELETE_ORDER: '/api/v2/erp-orders/:orderId',

  // 订单拆解
  DECOMPOSE_ORDER: '/api/v2/orders/:orderId/decompose',
  GET_PRODUCTION_ORDERS: '/api/v2/orders/:orderId/production-orders',
  GET_PARTS: '/api/v2/orders/:orderId/parts',

  // 粗排程
  COARSE_SCHEDULING: '/api/v2/scheduling/coarse',
  GET_SCHEDULE_TASKS: '/api/v2/schedule-tasks',
  GET_SCHEDULE_TASK_DETAIL: '/api/v2/schedule-tasks/:taskId',
  UPDATE_SCHEDULE_TASK: '/api/v2/schedule-tasks/:taskId',

  // 揉单合并
  MERGE_BATCHES: '/api/v2/merging/merge',
  GET_MERGE_BATCHES: '/api/v2/merge-batches',
  GET_MERGE_BATCH_DETAIL: '/api/v2/merge-batches/:batchId',

  // 细排程
  FINE_SCHEDULING: '/api/v2/scheduling/fine',
  GET_CUTTING_PATTERN: '/api/v2/cutting-patterns/:batchId',
  GET_CUTTING_PATTERNS: '/api/v2/cutting-patterns',
  UPDATE_CUTTING_PATTERN: '/api/v2/cutting-patterns/:patternId',
  GET_CUTTING_STATISTICS: '/api/v2/cutting-statistics',

  // 生产执行
  ISSUE_PRODUCTION: '/api/v2/production/issue',
  UPDATE_PROCESS_STATUS: '/api/v2/production/wip-tracking/:trackingId',
  GET_WIP_TRACKING: '/api/v2/production/wip-tracking',
  GET_BATCH_PROGRESS: '/api/v2/production/batch/:batchId/progress',
  GET_PRODUCTION_STATISTICS: '/api/v2/production/statistics',

  // 齐套管理
  INIT_SORTING_SLOT: '/api/v2/fulfillment/slots',
  UPDATE_FULFILLMENT_PROGRESS: '/api/v2/fulfillment/slots/:orderId/progress',
  GET_SORTING_SLOTS: '/api/v2/fulfillment/slots',
  GET_SORTING_SLOT_DETAIL: '/api/v2/fulfillment/slots/:slotId',
  GENERATE_SHIPMENT: '/api/v2/fulfillment/shipments',
  GET_FULFILLMENT_STATISTICS: '/api/v2/fulfillment/statistics'
}

// 替换URL中的参数
export const buildApiUrl = (endpoint, params = {}) => {
  let url = endpoint
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key])
  })
  return url
}
