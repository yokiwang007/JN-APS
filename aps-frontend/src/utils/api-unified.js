// 统一API服务 - 根据模式自动选择模拟数据或真实API
import * as mockApi from './api'
import * as realApi from './api-client'
import { isMockMode } from './config'

// ==================== 订单API ====================

export const getOrders = isMockMode() ? mockApi.getOrders : realApi.getOrdersApi
export const getOrderDetail = isMockMode() ? mockApi.getOrderDetail : realApi.getOrderDetailApi
export const createOrder = isMockMode() ? mockApi.createOrder : realApi.createOrderApi
export const updateOrder = isMockMode() ? mockApi.updateOrder : realApi.updateOrderApi
export const deleteOrder = isMockMode() ? mockApi.deleteOrder : realApi.deleteOrderApi

// ==================== 订单拆解API ====================

export const decomposeOrder = isMockMode() ? mockApi.decomposeOrder : realApi.decomposeOrderApi
export const getProductionOrders = isMockMode() ? mockApi.getProductionOrders : realApi.getProductionOrdersApi
export const getParts = isMockMode() ? mockApi.getParts : realApi.getPartsApi

// ==================== 粗排程API ====================

export const coarseScheduling = isMockMode() ? mockApi.coarseScheduling : realApi.coarseSchedulingApi
export const getScheduleTasks = isMockMode() ? mockApi.getScheduleTasks : realApi.getScheduleTasksApi
export const getScheduleTaskDetail = isMockMode() ? mockApi.getScheduleTaskDetail : realApi.getScheduleTaskDetailApi
export const updateScheduleTask = isMockMode() ? mockApi.updateScheduleTask : realApi.updateScheduleTaskApi

// ==================== 揉单合并API ====================

export const mergeBatches = isMockMode() ? mockApi.mergeBatches : realApi.mergeBatchesApi
export const getMergeBatches = isMockMode() ? mockApi.getMergeBatches : realApi.getMergeBatchesApi
export const getMergeBatchDetail = isMockMode() ? mockApi.getMergeBatchDetail : realApi.getMergeBatchDetailApi

// ==================== 细排程API ====================

export const fineScheduling = isMockMode() ? mockApi.fineScheduling : realApi.fineSchedulingApi
export const getCuttingPattern = isMockMode() ? mockApi.getCuttingPattern : realApi.getCuttingPatternApi
export const getCuttingPatterns = isMockMode() ? mockApi.getCuttingPatterns : realApi.getCuttingPatternsApi
export const updateCuttingPattern = isMockMode() ? mockApi.updateCuttingPattern : realApi.updateCuttingPatternApi
export const getCuttingStatistics = isMockMode() ? mockApi.getCuttingStatistics : realApi.getCuttingStatisticsApi

// ==================== 生产执行API ====================

export const issueProduction = isMockMode() ? mockApi.issueProduction : realApi.issueProductionApi
export const updateProcessStatus = isMockMode() ? mockApi.updateProcessStatus : realApi.updateProcessStatusApi
export const getWipTracking = isMockMode() ? mockApi.getWipTracking : realApi.getWipTrackingApi
export const getBatchProgress = isMockMode() ? mockApi.getBatchProgress : realApi.getBatchProgressApi
export const getProductionStatistics = isMockMode() ? mockApi.getProductionStatistics : realApi.getProductionStatisticsApi

// ==================== 齐套管理API ====================

export const initSortingSlot = isMockMode() ? mockApi.initSortingSlot : realApi.initSortingSlotApi
export const updateFulfillmentProgress = isMockMode() ? mockApi.updateFulfillmentProgress : realApi.updateFulfillmentProgressApi
export const getSortingSlots = isMockMode() ? mockApi.getSortingSlots : realApi.getSortingSlotsApi
export const getSortingSlotDetail = isMockMode() ? mockApi.getSortingSlotDetail : realApi.getSortingSlotDetailApi
export const generateShipment = isMockMode() ? mockApi.generateShipment : realApi.generateShipmentApi
export const getFulfillmentStatistics = isMockMode() ? mockApi.getFulfillmentStatistics : realApi.getFulfillmentStatisticsApi

// ==================== 其他API ====================

export const getPreprocessRules = mockApi.getPreprocessRules
export const preprocessOrders = mockApi.preprocessOrders
export const getPreprocessResult = mockApi.getPreprocessResult
export const getBatches = mockApi.getBatches
export const getBatchDetail = mockApi.getBatchDetail
export const planBatches = mockApi.planBatches
export const optimizeSchedules = mockApi.optimizeSchedules
export const issueInstructions = mockApi.issueInstructions
export const getProgress = mockApi.getProgress
export const adjustSchedule = mockApi.adjustSchedule
export const getStrategies = mockApi.getStrategies
export const createStrategy = mockApi.createStrategy
export const updateStrategy = mockApi.updateStrategy
export const activateStrategy = mockApi.activateStrategy
export const deleteStrategy = mockApi.deleteStrategy
export const getProductionLines = isMockMode() ? mockApi.getProductionLines : realApi.getProductionLinesApi
export const createProductionLine = isMockMode() ? mockApi.createProductionLine : realApi.createProductionLineApi
export const updateProductionLine = isMockMode() ? mockApi.updateProductionLine : realApi.updateProductionLineApi
export const deleteProductionLine = isMockMode() ? mockApi.deleteProductionLine : realApi.deleteProductionLineApi
export const getProcessRoutes = isMockMode() ? mockApi.getProcessRoutes : realApi.getProcessRoutesApi
export const createProcessRoute = isMockMode() ? mockApi.createProcessRoute : realApi.createProcessRouteApi
export const updateProcessRoute = isMockMode() ? mockApi.updateProcessRoute : realApi.updateProcessRouteApi
export const deleteProcessRoute = isMockMode() ? mockApi.deleteProcessRoute : realApi.deleteProcessRouteApi

// ==================== 设备列表API ====================
export const getEquipments = isMockMode() ? mockApi.getEquipments : realApi.getEquipmentsApi
export const createEquipment = isMockMode() ? mockApi.createEquipment : realApi.createEquipmentApi
export const updateEquipment = isMockMode() ? mockApi.updateEquipment : realApi.updateEquipmentApi
export const deleteEquipment = isMockMode() ? mockApi.deleteEquipment : realApi.deleteEquipmentApi
export const resetData = mockApi.resetData
export const ensureDemoDataInitialized = mockApi.ensureDemoDataInitialized
export const readMockStore = mockApi.readMockStore
export const writeMockStore = mockApi.writeMockStore

// 健康检查
export const healthCheck = realApi.healthCheckApi
