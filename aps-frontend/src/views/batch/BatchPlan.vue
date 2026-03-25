<template>
  <div class="batch-plan">
    <el-row :gutter="20">
      <!-- 左侧：订单选择 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>选择订单</span>
              <el-tag type="info">已选 {{ selectedOrders.length }} 个</el-tag>
            </div>
          </template>
          
          <!-- 搜索 -->
          <el-input
            v-model="searchKeyword"
            placeholder="搜索订单号或客户名称"
            clearable
            style="margin-bottom: 16px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <!-- 订单列表 -->
          <el-table
            :data="filteredOrders"
            @selection-change="handleSelectionChange"
            max-height="400"
            stripe
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="orderNo" label="订单号" width="160" />
            <el-table-column prop="customerName" label="客户" width="100" />
            <el-table-column prop="productType" label="产品" width="80" />
            <el-table-column prop="deliveryDate" label="交期" width="100" />
            <el-table-column prop="panelCount" label="板件数" width="80" />
          </el-table>
          
          <!-- 板件统计 -->
          <div v-if="selectedOrders.length > 0" style="margin-top: 16px">
            <el-divider>板件统计</el-divider>
            <el-tag
              v-for="(count, key) in panelStats"
              :key="key"
              style="margin: 4px"
            >
              {{ key }}: {{ count }} 件
            </el-tag>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧：策略选择和规划结果 -->
      <el-col :span="12">
        <!-- 策略选择 -->
        <el-card shadow="never" style="margin-bottom: 20px">
          <template #header>
            <span>选择策略</span>
          </template>
          
          <el-radio-group v-model="selectedStrategy" style="width: 100%">
            <el-radio
              v-for="strategy in strategies"
              :key="strategy.strategyId"
              :label="strategy.strategyId"
              style="display: block; margin-bottom: 16px; width: 100%"
            >
              <div style="display: flex; flex-direction: column">
                <div style="font-weight: 500; margin-bottom: 4px">{{ strategy.strategyName }}</div>
                <div style="font-size: 12px; color: #909399; line-height: 1.4">{{ strategy.description }}</div>
              </div>
            </el-radio>
          </el-radio-group>
          
          <el-alert
            v-if="activeStrategy"
            :title="`当前启用: ${activeStrategy.strategyName}`"
            type="success"
            :closable="false"
            style="margin-top: 16px"
          />
        </el-card>
        
        <!-- 规划操作 -->
        <el-card shadow="never" style="margin-bottom: 20px">
          <el-button
            type="primary"
            size="large"
            :disabled="selectedOrders.length === 0"
            :loading="planning"
            @click="handlePlan"
            style="width: 100%"
          >
            <el-icon><VideoPlay /></el-icon>
            开始规划
          </el-button>
        </el-card>
        
        <!-- 规划结果 -->
        <el-card shadow="never" v-if="planResult">
          <template #header>
            <div class="card-header">
              <span>规划结果</span>
              <el-button type="primary" size="small" @click="exportResult">
                导出报告
              </el-button>
            </div>
          </template>
          
          <el-descriptions :column="2" border style="margin-bottom: 16px">
            <el-descriptions-item label="批次数量">{{ planResult.batchCount }}</el-descriptions-item>
            <el-descriptions-item label="平均利用率">{{ planResult.averageUtilizationRate }}%</el-descriptions-item>
          </el-descriptions>
          
          <el-table :data="planResult.batches" stripe max-height="300">
            <el-table-column prop="batchNo" label="批次号" width="160" />
            <el-table-column prop="color" label="花色" width="100" />
            <el-table-column prop="thickness" label="厚度" width="80" />
            <el-table-column prop="orderIds" label="订单数" width="80">
              <template #default="{ row }">
                {{ row.orderIds.length }}
              </template>
            </el-table-column>
            <el-table-column prop="panelCount" label="板件数" width="80" />
            <el-table-column prop="utilizationRate" label="利用率" width="100">
              <template #default="{ row }">
                <el-tag :type="getUtilizationType(row.utilizationRate)">
                  {{ row.utilizationRate }}%
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewBatch(row.batchNo)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, VideoPlay } from '@element-plus/icons-vue'
import { useOrderStore } from '../../stores/order'
import { useBatchStore } from '../../stores/batch'
import { useStrategyStore } from '../../stores/strategy'
import { getOrders } from '../../utils/api'

const router = useRouter()
const orderStore = useOrderStore()
const batchStore = useBatchStore()
const strategyStore = useStrategyStore()

const searchKeyword = ref('')
const selectedOrders = ref([])
const selectedStrategy = ref('')
const planning = ref(false)
const planResult = ref(null)
const orders = ref([])
const strategies = ref([])
const activeStrategy = ref(null)

// 筛选后的订单
const filteredOrders = computed(() => {
  if (!searchKeyword.value) {
    return orders.value.filter(o => o.status === '待排产')
  }
  const keyword = searchKeyword.value.toLowerCase()
  return orders.value.filter(o =>
    o.status === '待排产' &&
    (o.orderNo.toLowerCase().includes(keyword) ||
     o.customerName.toLowerCase().includes(keyword))
  )
})

// 板件统计
const panelStats = computed(() => {
  const stats = {}
  selectedOrders.value.forEach(order => {
    const key = `${order.productType}`
    stats[key] = (stats[key] || 0) + order.panelCount
  })
  return stats
})

// 获取利用率类型
const getUtilizationType = (rate) => {
  if (rate >= 90) return 'success'
  if (rate >= 85) return 'warning'
  return 'danger'
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedOrders.value = selection
}

// 执行规划
const handlePlan = async () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请选择订单')
    return
  }
  
  planning.value = true
  try {
    const orderIds = selectedOrders.value.map(o => o.orderNo)
    const result = await batchStore.executePlan({
      orderIds,
      strategyId: selectedStrategy.value
    })
    
    if (result) {
      planResult.value = result
      ElMessage.success('批次规划完成')
    }
  } catch (error) {
    ElMessage.error('规划失败')
  } finally {
    planning.value = false
  }
}

// 导出结果
const exportResult = () => {
  ElMessage.success('导出功能开发中')
}

// 查看批次
const viewBatch = (batchNo) => {
  router.push(`/batch/detail/${batchNo}`)
}

// 加载数据
const loadData = async () => {
  // 加载待排产订单
  const result = await getOrders({ status: '待排产', pageSize: 100 })
  if (result.code === 'SUCCESS') {
    orders.value = result.data.list
  }
  
  // 加载策略
  await strategyStore.fetchStrategies()
  strategies.value = strategyStore.strategies
  activeStrategy.value = strategyStore.activeStrategy
  
  if (activeStrategy.value) {
    selectedStrategy.value = activeStrategy.value.strategyId
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.batch-plan {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
