import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getBatches, getBatchDetail, planBatches } from '../utils/api-unified'

export const useBatchStore = defineStore('batch', () => {
  // 状态
  const batches = ref([])
  const currentBatch = ref(null)
  const planResult = ref(null)
  const loading = ref(false)
  const filters = ref({
    status: '',
    productionLine: '',
    color: ''
  })
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0
  })

  // 获取批次列表
  const fetchBatches = async () => {
    loading.value = true
    try {
      const result = await getBatches({
        ...filters.value,
        ...pagination.value
      })
      if (result.code === 'SUCCESS') {
        batches.value = result.data.list
        pagination.value.total = result.data.total
      }
    } finally {
      loading.value = false
    }
  }

  // 获取批次详情
  const fetchBatchDetail = async (batchNo) => {
    loading.value = true
    try {
      const result = await getBatchDetail(batchNo)
      if (result.code === 'SUCCESS') {
        currentBatch.value = result.data
      }
    } finally {
      loading.value = false
    }
  }

  // 执行批次规划
  const executePlan = async (params) => {
    loading.value = true
    try {
      const result = await planBatches(params)
      if (result.code === 'SUCCESS') {
        planResult.value = result.data
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
    batches,
    currentBatch,
    planResult,
    loading,
    filters,
    pagination,
    fetchBatches,
    fetchBatchDetail,
    executePlan,
    updateFilters,
    updatePagination
  }
})
