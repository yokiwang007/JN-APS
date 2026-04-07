// 真实后端API服务
import axios from 'axios'
import { API_BASE_URL, API_ENDPOINTS, buildApiUrl } from './config'

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等认证信息
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// ==================== 订单API ====================

// 获取订单列表
export const getOrdersApi = async (params = {}) => {
  const response = await apiClient.get('/api/v2/erp-orders', { params })
  return response
}

// 获取订单详情
export const getOrderDetailApi = async (orderId) => {
  const response = await apiClient.get(`/api/v2/erp-orders/${orderId}`)
  return response
}

// 创建订单
export const createOrderApi = async (data) => {
  const response = await apiClient.post('/api/v2/erp-orders', data)
  return response
}

// 更新订单
export const updateOrderApi = async (orderId, data) => {
  const response = await apiClient.put(`/api/v2/erp-orders/${orderId}`, data)
  return response
}

// 删除订单
export const deleteOrderApi = async (orderId) => {
  const response = await apiClient.delete(`/api/v2/erp-orders/${orderId}`)
  return response
}

// ==================== 订单拆解API ====================

// 订单拆解
export const decomposeOrderApi = async (orderId, bomData) => {
  const url = buildApiUrl(API_ENDPOINTS.DECOMPOSE_ORDER, { orderId })
  const response = await apiClient.post(url, bomData)
  return response
}

// 查询生产子订单
export const getProductionOrdersApi = async (orderId, params = {}) => {
  const url = buildApiUrl(API_ENDPOINTS.GET_PRODUCTION_ORDERS, { orderId })
  const response = await apiClient.get(url, { params })
  return response
}

// 查询零件明细
export const getPartsApi = async (orderId, params = {}) => {
  const url = buildApiUrl(API_ENDPOINTS.GET_PARTS, { orderId })
  const response = await apiClient.get(url, { params })
  return response
}

// ==================== 粗排程API ====================

// 粗排程
export const coarseSchedulingApi = async (params) => {
  const response = await apiClient.post(API_ENDPOINTS.COARSE_SCHEDULING, params)
  return response
}

// 查询排程任务
export const getScheduleTasksApi = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.GET_SCHEDULE_TASKS, { params })
  return response
}

// 查询排程任务详情
export const getScheduleTaskDetailApi = async (taskId) => {
  const url = buildApiUrl(API_ENDPOINTS.GET_SCHEDULE_TASK_DETAIL, { taskId })
  const response = await apiClient.get(url)
  return response
}

// 更新排程任务
export const updateScheduleTaskApi = async (taskId, data) => {
  const url = buildApiUrl(API_ENDPOINTS.UPDATE_SCHEDULE_TASK, { taskId })
  const response = await apiClient.put(url, data)
  return response
}

// ==================== 揉单合并API ====================

// 揉单合并
export const mergeBatchesApi = async (params) => {
  const response = await apiClient.post(API_ENDPOINTS.MERGE_BATCHES, params)
  return response
}

// 查询生产批次
export const getMergeBatchesApi = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.GET_MERGE_BATCHES, { params })
  return response
}

// 查询批次详情
export const getMergeBatchDetailApi = async (batchId) => {
  const url = buildApiUrl(API_ENDPOINTS.GET_MERGE_BATCH_DETAIL, { batchId })
  const response = await apiClient.get(url)
  return response
}

// ==================== 细排程API ====================

// 细排程
export const fineSchedulingApi = async (params) => {
  const response = await apiClient.post(API_ENDPOINTS.FINE_SCHEDULING, params)
  return response
}

// 查询排版图
export const getCuttingPatternApi = async (batchId) => {
  const url = buildApiUrl(API_ENDPOINTS.GET_CUTTING_PATTERN, { batchId })
  const response = await apiClient.get(url)
  return response
}

// 查询排版图列表
export const getCuttingPatternsApi = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.GET_CUTTING_PATTERNS, { params })
  return response
}

// 更新排版图
export const updateCuttingPatternApi = async (patternId, data) => {
  const url = buildApiUrl(API_ENDPOINTS.UPDATE_CUTTING_PATTERN, { patternId })
  const response = await apiClient.put(url, data)
  return response
}

// 查询开料统计数据
export const getCuttingStatisticsApi = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.GET_CUTTING_STATISTICS, { params })
  return response
}

// ==================== 生产执行API ====================

// 下发生产指令
export const issueProductionApi = async (params) => {
  const response = await apiClient.post(API_ENDPOINTS.ISSUE_PRODUCTION, params)
  return response
}

// 更新工序状态
export const updateProcessStatusApi = async (trackingId, data) => {
  const url = buildApiUrl(API_ENDPOINTS.UPDATE_PROCESS_STATUS, { trackingId })
  const response = await apiClient.put(url, data)
  return response
}

// 查询工序追踪
export const getWipTrackingApi = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.GET_WIP_TRACKING, { params })
  return response
}

// 查询批次生产进度
export const getBatchProgressApi = async (batchId) => {
  const url = buildApiUrl(API_ENDPOINTS.GET_BATCH_PROGRESS, { batchId })
  const response = await apiClient.get(url)
  return response
}

// 查询生产统计数据
export const getProductionStatisticsApi = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.GET_PRODUCTION_STATISTICS, { params })
  return response
}

// ==================== 齐套管理API ====================

// 初始化齐套货位
export const initSortingSlotApi = async (params) => {
  const response = await apiClient.post(API_ENDPOINTS.INIT_SORTING_SLOT, params)
  return response
}

// 更新齐套进度
export const updateFulfillmentProgressApi = async (orderId) => {
  const url = buildApiUrl(API_ENDPOINTS.UPDATE_FULFILLMENT_PROGRESS, { orderId })
  const response = await apiClient.put(url)
  return response
}

// 查询齐套货位
export const getSortingSlotsApi = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.GET_SORTING_SLOTS, { params })
  return response
}

// 查询齐套货位详情
export const getSortingSlotDetailApi = async (slotId) => {
  const url = buildApiUrl(API_ENDPOINTS.GET_SORTING_SLOT_DETAIL, { slotId })
  const response = await apiClient.get(url)
  return response
}

// 生成发货单
export const generateShipmentApi = async (slotId) => {
  const response = await apiClient.post(API_ENDPOINTS.GENERATE_SHIPMENT, { slotId })
  return response
}

// 查询齐套统计数据
export const getFulfillmentStatisticsApi = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.GET_FULFILLMENT_STATISTICS, { params })
  return response
}

// ==================== 产线管理API ====================

// 查询产线列表
export const getProductionLinesApi = async (params = {}) => {
  const response = await apiClient.get('/api/v2/production-lines', { params })
  return response
}

// 创建产线
export const createProductionLineApi = async (data) => {
  const response = await apiClient.post('/api/v2/production-lines', data)
  return response
}

// 查询产线详情
export const getProductionLineDetailApi = async (lineId) => {
  const response = await apiClient.get(`/api/v2/production-lines/${lineId}`)
  return response
}

// 更新产线信息
export const updateProductionLineApi = async (lineId, data) => {
  const response = await apiClient.put(`/api/v2/production-lines/${lineId}`, data)
  return response
}

// 删除产线
export const deleteProductionLineApi = async (lineId) => {
  const response = await apiClient.delete(`/api/v2/production-lines/${lineId}`)
  return response
}

// 健康检查
export const healthCheckApi = async () => {
  const response = await apiClient.get('/health')
  return response
}
