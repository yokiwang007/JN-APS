import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getOrders, getOrderDetail, preprocessOrders, getPreprocessResult } from '../utils/api-unified'

export const useOrderStore = defineStore('order', () => {
  // 状态
  const orders = ref([])
  const currentOrder = ref(null)
  const preprocessResult = ref(null)
  const loading = ref(false)
  const filters = ref({
    status: '',
    orderType: '',
    priority: '',
    customerName: '',
    deliveryDateRange: []
  })
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0
  })

  // 获取订单列表
  const fetchOrders = async () => {
    loading.value = true
    try {
      const result = await getOrders({
        ...filters.value,
        ...pagination.value
      })
      // 兼容V1和V2响应格式
      if (result.code === 'SUCCESS' || result.success === true) {
        orders.value = result.data.list || result.data
        pagination.value.total = result.data.total || (Array.isArray(result.data) ? result.data.length : 0)
      }
    } finally {
      loading.value = false
    }
  }

  // 获取订单详情
  const fetchOrderDetail = async (orderNo) => {
    loading.value = true
    try {
      const result = await getOrderDetail(orderNo)
      // 兼容V1和V2响应格式
      if (result.code === 'SUCCESS' || result.success === true) {
        currentOrder.value = result.data
      }
    } finally {
      loading.value = false
    }
  }

  // 执行订单预处理
  const executePreprocess = async (params) => {
    loading.value = true
    try {
      const result = await preprocessOrders(params)
      if (result.code === 'SUCCESS') {
        preprocessResult.value = result.data
        return result.data
      }
    } finally {
      loading.value = false
    }
  }

  // 获取预处理结果
  const fetchPreprocessResult = async (orderNo) => {
    loading.value = true
    try {
      const result = await getPreprocessResult(orderNo)
      if (result.code === 'SUCCESS') {
        return result.data
      }
    } finally {
      loading.value = false
    }
  }

  // 更新筛选条件
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1
  }

  // 更新分页
  const updatePagination = (newPagination) => {
    pagination.value = { ...pagination.value, ...newPagination }
  }

  return {
    orders,
    currentOrder,
    preprocessResult,
    loading,
    filters,
    pagination,
    fetchOrders,
    fetchOrderDetail,
    executePreprocess,
    fetchPreprocessResult,
    updateFilters,
    updatePagination
  }
})
