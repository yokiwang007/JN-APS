import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getStrategies, createStrategy, updateStrategy, deleteStrategy, activateStrategy } from '../utils/api-unified'

export const useStrategyStore = defineStore('strategy', () => {
  // 状态
  const strategies = ref([])
  const currentStrategy = ref(null)
  const activeStrategy = ref(null)
  const loading = ref(false)

  // 获取策略列表
  const fetchStrategies = async () => {
    loading.value = true
    try {
      const result = await getStrategies()
      if (result.code === 'SUCCESS') {
        strategies.value = result.data
        activeStrategy.value = result.data.find(s => s.enabled)
      }
    } finally {
      loading.value = false
    }
  }

  // 创建策略
  const create = async (params) => {
    loading.value = true
    try {
      const result = await createStrategy(params)
      if (result.code === 'SUCCESS') {
        await fetchStrategies()
        return result.data
      }
    } finally {
      loading.value = false
    }
  }

  // 更新策略
  const update = async (strategyId, params) => {
    loading.value = true
    try {
      const result = await updateStrategy(strategyId, params)
      if (result.code === 'SUCCESS') {
        await fetchStrategies()
        return result.data
      }
    } finally {
      loading.value = false
    }
  }

  // 删除策略
  const remove = async (strategyId) => {
    loading.value = true
    try {
      const result = await deleteStrategy(strategyId)
      if (result.code === 'SUCCESS') {
        await fetchStrategies()
      }
    } finally {
      loading.value = false
    }
  }

  // 激活策略
  const activate = async (strategyId) => {
    loading.value = true
    try {
      const result = await activateStrategy(strategyId)
      if (result.code === 'SUCCESS') {
        await fetchStrategies()
        return result.data
      }
    } finally {
      loading.value = false
    }
  }

  return {
    strategies,
    currentStrategy,
    activeStrategy,
    loading,
    fetchStrategies,
    create,
    update,
    remove,
    activate
  }
})
