<template>
  <div class="batch-plan">
    <!-- 模式选择 -->
    <el-card shadow="never" style="margin-bottom: 20px">
      <el-radio-group v-model="planMode" size="large">
        <el-radio-button value="auto">自动规划</el-radio-button>
        <el-radio-button value="manual">手工规划</el-radio-button>
      </el-radio-group>
    </el-card>
    
    <!-- 自动规划模式 -->
    <template v-if="planMode === 'auto'">
      <el-row :gutter="20">
        <!-- 左侧：订单选择 -->
        <el-col :span="8">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span>待排产订单</span>
                <el-tag type="info">{{ filteredOrders.length }} 个</el-tag>
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
              @current-change="handleCurrentChange"
              highlight-current-row
              max-height="400"
              stripe
              size="small"
            >
              <el-table-column type="selection" width="40" />
              <el-table-column prop="orderNo" label="订单号" width="120" />
              <el-table-column prop="customerName" label="客户" width="80" />
              <el-table-column prop="deliveryDate" label="交期" width="90">
                <template #default="{ row }">
                  <div :class="{'text-danger': isUrgent(row.deliveryDate)}">
                    {{ row.deliveryDate }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="panelCount" label="板件" width="60" />
              <el-table-column label="周期" width="60">
                <template #default="{ row }">
                  {{ calculateOrderCycle(row) }}天
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 统计信息 -->
            <div v-if="selectedOrders.length > 0" style="margin-top: 16px">
              <el-divider>已选订单统计</el-divider>
              <el-descriptions :column="1" size="small">
                <el-descriptions-item label="订单数">{{ selectedOrders.length }} 个</el-descriptions-item>
                <el-descriptions-item label="总板件">{{ totalPanels }} 件</el-descriptions-item>
                <el-descriptions-item label="预估周期">{{ estimatedDays }} 天</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-card>
        </el-col>
        
        <!-- 中间：订单详情 -->
        <el-col :span="8">
          <el-card shadow="never">
            <template #header>
              <span>订单详情</span>
            </template>
            
            <div v-if="currentOrder" style="margin-bottom: 20px">
              <!-- 基本信息 -->
              <el-descriptions :column="2" size="small" border>
                <el-descriptions-item label="订单号">{{ currentOrder.orderNo }}</el-descriptions-item>
                <el-descriptions-item label="客户">{{ currentOrder.customerName }}</el-descriptions-item>
                <el-descriptions-item label="产品">{{ currentOrder.productType }}</el-descriptions-item>
                <el-descriptions-item label="交期">{{ currentOrder.deliveryDate }}</el-descriptions-item>
                <el-descriptions-item label="板件数">{{ currentOrder.panelCount }} 件</el-descriptions-item>
                <el-descriptions-item label="优先级">
                  <el-tag :type="getPriorityType(currentOrder.priority)" size="small">
                    {{ currentOrder.priority }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
              
              <!-- 部件类型统计 -->
              <el-divider>部件类型统计</el-divider>
              <el-table :data="orderPanelTypes" size="small" stripe max-height="200">
                <el-table-column prop="panelType" label="部件类型" width="100" />
                <el-table-column prop="count" label="数量" width="60" />
                <el-table-column prop="workTime" label="工时(分)" width="80" />
                <el-table-column prop="process" label="工艺路线" />
              </el-table>
              
              <!-- 生产周期估算 -->
              <el-divider>生产周期估算</el-divider>
              <el-descriptions :column="1" size="small">
                <el-descriptions-item label="简单估算">{{ orderCycle.simple }} 天</el-descriptions-item>
                <el-descriptions-item label="考虑并行">{{ orderCycle.parallel }} 天</el-descriptions-item>
                <el-descriptions-item label="建议时长">
                  <el-tag type="success">{{ orderCycle.suggested }} 天</el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>
            
            <el-empty v-else description="请选择订单查看详情" />
          </el-card>
        </el-col>
        
        <!-- 右侧：产线产能 -->
        <el-col :span="8">
          <el-card shadow="never">
            <template #header>
              <span>产线产能</span>
            </template>
            
            <div
              v-for="line in productionLines"
              :key="line.lineId"
              style="margin-bottom: 16px; padding: 12px; border: 1px solid #ebeef5; border-radius: 4px"
            >
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
                <span style="font-weight: 500">{{ line.lineName }}</span>
                <el-tag :type="line.status === '正常' ? 'success' : 'danger'" size="small">
                  {{ line.status }}
                </el-tag>
              </div>
              
              <el-descriptions :column="1" size="small">
                <el-descriptions-item label="日产能">{{ line.standardCapacity }} 件</el-descriptions-item>
                <el-descriptions-item label="当前负荷">
                  <el-progress
                    :percentage="line.loadRate"
                    :color="getLoadColor(line.loadRate)"
                    :stroke-width="10"
                  />
                </el-descriptions-item>
                <el-descriptions-item label="可用时间">{{ line.availableTime }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 规划操作 -->
      <el-card shadow="never" style="margin-top: 20px">
        <el-row :gutter="20">
          <el-col :span="16">
            <!-- 策略选择 -->
            <div style="margin-bottom: 16px">
              <span style="font-weight: 500; margin-right: 12px">优化策略：</span>
              <el-radio-group v-model="selectedStrategy">
                <el-radio
                  v-for="strategy in strategies"
                  :key="strategy.strategyId"
                  :label="strategy.strategyId"
                >
                  {{ strategy.strategyName }}
                </el-radio>
              </el-radio-group>
            </div>
          </el-col>
          
          <el-col :span="8" style="text-align: right">
            <el-button
              type="primary"
              size="large"
              :disabled="selectedOrders.length === 0"
              :loading="planning"
              @click="handlePlan"
            >
              <el-icon><VideoPlay /></el-icon>
              开始规划
            </el-button>
          </el-col>
        </el-row>
      </el-card>
      
      <!-- 规划结果 -->
      <el-card shadow="never" style="margin-top: 20px" v-if="planResult">
        <template #header>
          <div class="card-header">
            <span>规划结果</span>
            <el-button type="primary" size="small" @click="exportResult">
              导出报告
            </el-button>
          </div>
        </template>
        
        <el-descriptions :column="3" border style="margin-bottom: 16px">
          <el-descriptions-item label="批次数量">{{ planResult.batchCount }}</el-descriptions-item>
          <el-descriptions-item label="总板件数">{{ planResult.totalPanels }}</el-descriptions-item>
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
          <el-table-column prop="productionLine" label="产线" width="120" />
          <el-table-column prop="planStartDate" label="开始日期" width="120" />
          <el-table-column prop="planEndDate" label="结束日期" width="120" />
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
    </template>
    
    <!-- 手工规划模式 -->
    <template v-else>
      <ManualBatchCreate 
        @success="handleManualSuccess"
        @cancel="handleManualCancel"
      />
    </template>
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
import { getOrders, getProductionLines, getProcessRoutes } from '../../utils/api-unified'
import ManualBatchCreate from '../../components/ManualBatchCreate.vue'

const router = useRouter()
const orderStore = useOrderStore()
const batchStore = useBatchStore()
const strategyStore = useStrategyStore()

const planMode = ref('auto') // auto | manual
const searchKeyword = ref('')
const selectedOrders = ref([])
const selectedStrategy = ref('')
const planning = ref(false)
const planResult = ref(null)
const orders = ref([])
const strategies = ref([])
const productionLines = ref([])
const processRoutes = ref([])
const currentOrder = ref(null)

// 手工规划相关
const manualAssign = ref({
  sawLine: '',
  edgeLine: '',
  drillLine: ''
})

const manualBatch = ref({
  name: '',
  productionLine: '',
  startDate: '',
  endDate: ''
})

// 产能检查结果
const capacityCheck = computed(() => {
  if (!manualBatch.value.productionLine || selectedOrders.value.length === 0) {
    return null
  }
  
  const line = productionLines.value.find(l => l.lineId === manualBatch.value.productionLine)
  if (!line) return null
  
  const required = totalPanels.value
  const daily = line.standardCapacity
  const days = Math.ceil(required / daily)
  
  // 检查时间是否足够
  let timeEnough = true
  if (manualBatch.value.startDate && manualBatch.value.endDate) {
    const start = new Date(manualBatch.value.startDate)
    const end = new Date(manualBatch.value.endDate)
    const plannedDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    timeEnough = plannedDays >= days
  }
  
  return {
    required,
    daily,
    days,
    timeEnough,
    type: timeEnough ? 'success' : 'warning',
    message: timeEnough ? '✓ 产能充足，可以按时完成' : '⚠ 时间紧张，建议延长工期'
  }
})

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

// 总板件数
const totalPanels = computed(() => {
  return selectedOrders.value.reduce((sum, o) => sum + o.panelCount, 0)
})

// 预估周期
const estimatedDays = computed(() => {
  return Math.ceil(totalPanels.value / 500) // 假设日产能500件
})

// 产线分类
const sawLines = computed(() => productionLines.value.filter(l => l.lineType === '开料线'))
const edgeLines = computed(() => productionLines.value.filter(l => l.lineType === '封边线'))
const drillLines = computed(() => productionLines.value.filter(l => l.lineType === '钻孔线'))

// 订单部件类型统计
const orderPanelTypes = computed(() => {
  if (!currentOrder.value) return []
  
  // 模拟数据
  return [
    { panelType: '柜体板', count: 20, workTime: 300, process: '开料→封边→钻孔' },
    { panelType: '门板', count: 10, workTime: 200, process: '开料→铣型→封边' },
    { panelType: '背板', count: 5, workTime: 50, process: '开料→封边' },
    { panelType: '装饰条', count: 3, workTime: 75, process: '开料→镂铣' }
  ]
})

// 订单生产周期
const orderCycle = computed(() => {
  if (!currentOrder.value) return { simple: 0, parallel: 0, suggested: 0 }
  
  const totalMinutes = orderPanelTypes.value.reduce((sum, p) => sum + p.workTime, 0)
  const simple = Math.ceil(totalMinutes / 60 / 8)
  const parallel = Math.ceil(simple * 0.8)
  const suggested = Math.ceil(parallel * 1.2)
  
  return { simple, parallel, suggested }
})

// 判断是否紧急
const isUrgent = (deliveryDate) => {
  const delivery = new Date(deliveryDate)
  const today = new Date()
  const days = Math.ceil((delivery - today) / (1000 * 60 * 60 * 24))
  return days <= 3
}

// 获取优先级类型
const getPriorityType = (priority) => {
  if (priority === '紧急') return 'danger'
  if (priority === '高') return 'warning'
  return 'info'
}

// 获取利用率类型
const getUtilizationType = (rate) => {
  if (rate >= 90) return 'success'
  if (rate >= 85) return 'warning'
  return 'danger'
}

// 获取负荷颜色
const getLoadColor = (rate) => {
  if (rate >= 80) return '#f56c6c'
  if (rate >= 60) return '#e6a23c'
  return '#67c23a'
}

// 计算订单周期
const calculateOrderCycle = (order) => {
  return Math.ceil(order.panelCount / 200) // 简化计算
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedOrders.value = selection
}

// 当前行变化（高亮行）
const handleCurrentChange = (row) => {
  currentOrder.value = row
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
    
    if (planMode.value === 'auto') {
      // 自动规划
      const result = await batchStore.executePlan({
        orderIds,
        strategyId: selectedStrategy.value
      })
      
      if (result) {
        planResult.value = {
          ...result,
          totalPanels: totalPanels.value
        }
        ElMessage.success('批次规划完成')
      }
    } else {
      // 手工规划
      // 验证必填项
      if (!manualBatch.value.name) {
        ElMessage.warning('请输入批次名称')
        planning.value = false
        return
      }
      if (!manualBatch.value.productionLine) {
        ElMessage.warning('请选择产线')
        planning.value = false
        return
      }
      if (!manualBatch.value.startDate || !manualBatch.value.endDate) {
        ElMessage.warning('请选择开始和结束时间')
        planning.value = false
        return
      }
      
      // 检查时间顺序
      const start = new Date(manualBatch.value.startDate)
      const end = new Date(manualBatch.value.endDate)
      if (end < start) {
        ElMessage.warning('结束时间不能早于开始时间')
        planning.value = false
        return
      }
      
      // 创建批次
      const batchNo = `PC${Date.now()}`
      const line = productionLines.value.find(l => l.lineId === manualBatch.value.productionLine)
      
      const batch = {
        batchNo,
        orderIds,
        color: '混合',
        thickness: '混合',
        material: '混合',
        planStartDate: manualBatch.value.startDate,
        planEndDate: manualBatch.value.endDate,
        productionLine: line ? line.lineName : manualBatch.value.productionLine,
        utilizationRate: capacityCheck.value 
          ? (capacityCheck.value.days / Math.ceil((end - start) / (1000 * 60 * 60 * 24)) * 100).toFixed(1)
          : '85.0',
        status: '待下发',
        panelCount: totalPanels.value,
        optimizeImagePath: `/images/optimize/${batchNo}.png`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // 保存批次
      const data = JSON.parse(localStorage.getItem('aps_mock_data') || '{}')
      if (!data.batches) data.batches = []
      data.batches.push(batch)
      
      // 更新订单状态
      if (data.orders) {
        orderIds.forEach(orderId => {
          const order = data.orders.find(o => o.orderNo === orderId)
          if (order) {
            order.status = '已排产'
            order.updatedAt = new Date().toISOString()
          }
        })
      }
      
      // 更新工件的批次号
      if (data.panels) {
        orderIds.forEach(orderId => {
          data.panels.forEach(panel => {
            if (panel.orderNo === orderId) {
              panel.batchNo = batchNo
            }
          })
        })
      }
      
      localStorage.setItem('aps_mock_data', JSON.stringify(data))
      
      // 显示结果
      planResult.value = {
        batchCount: 1,
        totalPanels: totalPanels.value,
        averageUtilizationRate: batch.utilizationRate,
        batches: [batch]
      }
      
      ElMessage.success('批次创建成功')
      
      // 清空表单
      manualBatch.value = {
        name: '',
        productionLine: '',
        startDate: '',
        endDate: ''
      }
      
      // 重新加载订单
      await loadData()
    }
  } catch (error) {
    ElMessage.error('规划失败')
    console.error(error)
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
  const activeStrategy = strategyStore.activeStrategy
  
  if (activeStrategy) {
    selectedStrategy.value = activeStrategy.strategyId
  }
  
  // 加载产线数据
  const linesResult = await getProductionLines()
  if (linesResult.code === 'SUCCESS') {
    productionLines.value = linesResult.data.map(line => ({
      ...line,
      loadRate: Math.floor(Math.random() * 100),
      availableTime: '2026-03-27 ~ 2026-03-30'
    }))
  }
  
  // 加载工艺路线
  const routesResult = await getProcessRoutes()
  if (routesResult.code === 'SUCCESS') {
    processRoutes.value = routesResult.data
  }
}

// 手工模式成功
const handleManualSuccess = (batch) => {
  ElMessage.success('批次创建成功')
  // 重新加载订单
  loadData()
}

// 手工模式取消
const handleManualCancel = () => {
  planMode.value = 'auto'
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

.text-danger {
  color: #f56c6c;
  font-weight: 500;
}
</style>
