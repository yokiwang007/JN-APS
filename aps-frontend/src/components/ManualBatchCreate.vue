<template>
  <div class="manual-batch-create">
    <!-- 步骤指示器 -->
    <el-steps :active="currentStep" finish-status="success" style="margin-bottom: 20px">
      <el-step title="设置批次信息" />
      <el-step title="选择订单" />
      <el-step title="确认创建" />
    </el-steps>
    
    <!-- 步骤1：设置批次基本信息 -->
    <div v-show="currentStep === 0">
      <el-card shadow="never">
        <el-form :model="batchForm" label-width="120px">
          <el-form-item label="批次名称" required>
            <el-input v-model="batchForm.name" placeholder="输入批次名称" />
          </el-form-item>
          
          <el-form-item label="计划时间" required>
            <el-date-picker
              v-model="batchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
            
            <!-- 时间和产能分析 -->
            <div v-if="batchForm.dateRange && batchForm.dateRange.length === 2" style="margin-top: 12px">
              <el-tag type="info">计划时长: {{ plannedDays }} 天</el-tag>
            </div>
          </el-form-item>
          
          <!-- 系统产能概览 -->
          <el-form-item label="系统产能">
            <div style="padding: 12px; background: #f5f7fa; border-radius: 4px; width: 100%">
              <el-descriptions :column="2" size="small">
                <el-descriptions-item label="开料总产能">
                  {{ totalCapacityByProcess.开料 || 0 }} 件/天
                </el-descriptions-item>
                <el-descriptions-item label="封边总产能">
                  {{ totalCapacityByProcess.封边 || 0 }} 件/天
                </el-descriptions-item>
                <el-descriptions-item label="钻孔总产能">
                  {{ totalCapacityByProcess.钻孔 || 0 }} 件/天
                </el-descriptions-item>
                <el-descriptions-item label="瓶颈工序">
                  <el-tag type="warning" size="small">
                    {{ bottleneckProcess }} ({{ bottleneckCapacity }} 件/天)
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="nextStep" :disabled="!canNextStep1">
              下一步
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    
    <!-- 步骤2：选择订单 -->
    <div v-show="currentStep === 1">
      <el-row :gutter="20">
        <!-- 左侧：可选订单 -->
        <el-col :span="14">
          <el-card shadow="never">
            <template #header>
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>可选订单 ({{ availableOrders.length }} 个)</span>
                <el-input
                  v-model="orderSearch"
                  placeholder="搜索订单"
                  clearable
                  style="width: 200px"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
            </template>
            
            <el-table
              :data="filteredAvailableOrders"
              @selection-change="handleOrderSelect"
              max-height="400"
              stripe
            >
              <el-table-column type="selection" width="40" />
              <el-table-column prop="orderNo" label="订单号" width="150" />
              <el-table-column prop="customerName" label="客户" width="80" />
              <el-table-column label="花色" width="80">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.mainColor || '混合' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="厚度" width="80">
                <template #default="{ row }">
                  {{ row.mainThickness || '混合' }}mm
                </template>
              </el-table-column>
              <el-table-column prop="panelCount" label="板件" width="60" />
              <el-table-column label="周期" width="60">
                <template #default="{ row }">
                  {{ calculateOrderCycle(row) }}天
                </template>
              </el-table-column>
              <el-table-column label="交期" width="120">
                <template #default="{ row }">
                  <div :class="{'text-danger': isUrgent(row.deliveryDate)}">
                    {{ row.deliveryDate }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="匹配度" width="80">
                <template #default="{ row }">
                  <el-rate
                    :model-value="calculateMatchScore(row)"
                    disabled
                    :max="5"
                    style="height: 20px"
                  />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <!-- 右侧：决策数据 -->
        <el-col :span="10">
          <!-- 已选订单统计 -->
          <el-card shadow="never" style="margin-bottom: 20px">
            <template #header>
              <span>已选订单统计</span>
            </template>
            
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item label="订单数">
                {{ selectedOrders.length }} 个
              </el-descriptions-item>
              <el-descriptions-item label="总板件">
                {{ totalPanels }} 件
              </el-descriptions-item>
              <el-descriptions-item label="预估时长">
                {{ estimatedDuration }} 天
              </el-descriptions-item>
              <el-descriptions-item label="时间余量">
                <el-tag :type="timeBufferType">
                  {{ timeBuffer }} 天
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
          
          <!-- 花色分布 -->
          <el-card shadow="never" style="margin-bottom: 20px" v-if="colorDistribution.length > 0">
            <template #header>
              <span>花色分布</span>
            </template>
            
            <div v-for="(item, index) in colorDistribution" :key="index" style="margin-bottom: 8px">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px">
                <span>{{ item.color }}</span>
                <span>{{ item.count }} 件 ({{ item.percentage }}%)</span>
              </div>
              <el-progress :percentage="item.percentage" :stroke-width="8" />
            </div>
            
            <el-alert
              v-if="colorDistribution.length > 2"
              type="warning"
              :closable="false"
              style="margin-top: 12px"
            >
              花色较杂，预计需要{{ colorDistribution.length }}次换模
            </el-alert>
          </el-card>
          
          <!-- 交期分析 -->
          <el-card shadow="never" style="margin-bottom: 20px" v-if="selectedOrders.length > 0">
            <template #header>
              <span>交期分析</span>
            </template>
            
            <div v-for="order in selectedOrders" :key="order.orderNo" style="margin-bottom: 8px">
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>{{ order.orderNo }}</span>
                <div>
                  <span style="margin-right: 8px; font-size: 12px">{{ order.deliveryDate }}</span>
                  <el-tag :type="getDeliveryRiskType(order)" size="small">
                    {{ getDeliveryRisk(order) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
          
          <!-- 风险提示 -->
          <el-card shadow="never" v-if="riskAnalysis.length > 0">
            <template #header>
              <span>风险分析</span>
            </template>
            
            <div v-for="(risk, index) in riskAnalysis" :key="index" style="margin-bottom: 8px">
              <el-alert :type="risk.type" :closable="false" size="small">
                {{ risk.message }}
              </el-alert>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <div style="margin-top: 20px; text-align: center">
        <el-button @click="prevStep">上一步</el-button>
        <el-button type="primary" @click="nextStep" :disabled="selectedOrders.length === 0">
          下一步
        </el-button>
      </div>
    </div>
    
    <!-- 步骤3：确认创建 -->
    <div v-show="currentStep === 2">
      <el-card shadow="never">
        <template #header>
          <span>确认批次信息</span>
        </template>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="批次名称">{{ batchForm.name }}</el-descriptions-item>
          <el-descriptions-item label="分配产线">{{ selectedLine?.lineName }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ batchForm.dateRange[0] }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ batchForm.dateRange[1] }}</el-descriptions-item>
          <el-descriptions-item label="订单数量">{{ selectedOrders.length }} 个</el-descriptions-item>
          <el-descriptions-item label="板件数量">{{ totalPanels }} 件</el-descriptions-item>
          <el-descriptions-item label="预估时长">{{ estimatedDuration }} 天</el-descriptions-item>
          <el-descriptions-item label="产能利用率">
            <el-tag :type="utilizationType">
              {{ utilizationRate }}%
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <div style="margin-top: 20px; text-align: center">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="createBatch" :loading="creating">
            确认创建
          </el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getOrders, getProductionLines } from '../utils/api-unified'

const emit = defineEmits(['success', 'cancel'])

const currentStep = ref(0)
const creating = ref(false)
const orderSearch = ref('')
const selectedOrders = ref([])
const availableOrders = ref([])
const productionLines = ref([])

const batchForm = ref({
  name: '',
  productionLine: '',
  dateRange: []
})

// 按工序统计总产能
const totalCapacityByProcess = computed(() => {
  const capacity = {}
  productionLines.value.forEach(line => {
    // 根据产线类型判断工序
    let process = ''
    if (line.lineType.includes('开料')) process = '开料'
    else if (line.lineType.includes('封边')) process = '封边'
    else if (line.lineType.includes('钻孔')) process = '钻孔'
    
    if (process) {
      capacity[process] = (capacity[process] || 0) + line.standardCapacity
    }
  })
  return capacity
})

// 瓶颈工序
const bottleneckProcess = computed(() => {
  const capacity = totalCapacityByProcess.value
  let minCapacity = Infinity
  let bottleneck = ''
  
  Object.entries(capacity).forEach(([process, cap]) => {
    if (cap < minCapacity) {
      minCapacity = cap
      bottleneck = process
    }
  })
  
  return bottleneck || '未知'
})

// 瓶颈工序产能
const bottleneckCapacity = computed(() => {
  return totalCapacityByProcess.value[bottleneckProcess.value] || 0
})

// 计划天数
const plannedDays = computed(() => {
  if (!batchForm.value.dateRange || batchForm.value.dateRange.length !== 2) return 0
  const start = new Date(batchForm.value.dateRange[0])
  const end = new Date(batchForm.value.dateRange[1])
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
})

// 是否可以进入下一步（步骤1）
const canNextStep1 = computed(() => {
  return batchForm.value.name && 
         batchForm.value.dateRange && 
         batchForm.value.dateRange.length === 2
})

// 筛选后的可选订单
const filteredAvailableOrders = computed(() => {
  if (!orderSearch.value) return availableOrders.value
  const keyword = orderSearch.value.toLowerCase()
  return availableOrders.value.filter(o => 
    o.orderNo.toLowerCase().includes(keyword) ||
    o.customerName.toLowerCase().includes(keyword)
  )
})

// 总板件数
const totalPanels = computed(() => {
  return selectedOrders.value.reduce((sum, o) => sum + o.panelCount, 0)
})

// 预估时长（基于瓶颈工序）
const estimatedDuration = computed(() => {
  if (!bottleneckCapacity.value || totalPanels.value === 0) return 0
  return Math.ceil(totalPanels.value / bottleneckCapacity.value)
})

// 时间余量
const timeBuffer = computed(() => {
  return (plannedDays.value - estimatedDuration.value).toFixed(1)
})

// 时间余量类型
const timeBufferType = computed(() => {
  const buffer = parseFloat(timeBuffer.value)
  if (buffer >= 1) return 'success'
  if (buffer >= 0) return 'warning'
  return 'danger'
})

// 花色分布
const colorDistribution = computed(() => {
  const colors = {}
  selectedOrders.value.forEach(order => {
    const color = order.mainColor || '混合'
    colors[color] = (colors[color] || 0) + order.panelCount
  })
  
  return Object.entries(colors).map(([color, count]) => ({
    color,
    count,
    percentage: Math.round((count / totalPanels.value) * 100)
  }))
})

// 产能利用率（基于瓶颈工序）
const utilizationRate = computed(() => {
  if (!bottleneckCapacity.value || plannedDays.value === 0) return 0
  const dailyRequired = totalPanels.value / plannedDays.value
  return ((dailyRequired / bottleneckCapacity.value) * 100).toFixed(1)
})

// 利用率类型
const utilizationType = computed(() => {
  const rate = parseFloat(utilizationRate.value)
  if (rate >= 80) return 'success'
  if (rate >= 60) return 'warning'
  return 'info'
})

// 风险分析
const riskAnalysis = computed(() => {
  const risks = []
  
  // 花色混杂风险
  if (colorDistribution.value.length > 2) {
    risks.push({
      type: 'warning',
      message: `花色较杂（${colorDistribution.value.length}种），预计需要${colorDistribution.value.length}次换模`
    })
  }
  
  // 时间紧张风险
  if (parseFloat(timeBuffer.value) < 0.5) {
    risks.push({
      type: 'warning',
      message: '时间余量不足，建议延长工期或减少订单'
    })
  }
  
  // 产能利用率低
  if (parseFloat(utilizationRate.value) < 50) {
    risks.push({
      type: 'info',
      message: '产能利用率较低，可以考虑增加更多订单'
    })
  }
  
  // 交期风险
  const urgentOrders = selectedOrders.value.filter(o => isUrgent(o.deliveryDate))
  if (urgentOrders.length > 0) {
    risks.push({
      type: 'warning',
      message: `有${urgentOrders.length}个订单交期紧急，建议优先安排`
    })
  }
  
  return risks
})

// 计算订单周期
const calculateOrderCycle = (order) => {
  return Math.ceil(order.panelCount / 200)
}

// 判断是否紧急
const isUrgent = (deliveryDate) => {
  const delivery = new Date(deliveryDate)
  const today = new Date()
  const days = Math.ceil((delivery - today) / (1000 * 60 * 60 * 24))
  return days <= 3
}

// 计算匹配度评分
const calculateMatchScore = (order) => {
  let score = 5
  
  // 交期检查
  if (isUrgent(order.deliveryDate)) {
    score -= 1
  }
  
  // 时间匹配
  if (batchForm.value.dateRange && batchForm.value.dateRange.length === 2) {
    const delivery = new Date(order.deliveryDate)
    const end = new Date(batchForm.value.dateRange[1])
    if (delivery < end) {
      score -= 1
    }
  }
  
  return Math.max(1, score)
}

// 获取交期风险
const getDeliveryRisk = (order) => {
  const delivery = new Date(order.deliveryDate)
  const start = new Date(batchForm.value.dateRange[0])
  const end = new Date(batchForm.value.dateRange[1])
  
  if (delivery < start) {
    return '已逾期'
  }
  
  const days = Math.ceil((delivery - start) / (1000 * 60 * 60 * 24))
  
  if (days <= 3) {
    return '紧急'
  } else if (days <= 7) {
    return '紧张'
  }
  
  return '正常'
}

// 获取交期风险类型
const getDeliveryRiskType = (order) => {
  const risk = getDeliveryRisk(order)
  const types = {
    '已逾期': 'danger',
    '紧急': 'danger',
    '紧张': 'warning',
    '正常': 'success'
  }
  return types[risk] || 'info'
}

// 产线变化
const handleLineChange = () => {
  // 可以在这里添加逻辑
}

// 订单选择
const handleOrderSelect = (selection) => {
  selectedOrders.value = selection
}

// 下一步
const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++
  }
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 创建批次
const createBatch = async () => {
  creating.value = true
  
  try {
    const batchNo = `PC${Date.now()}`
    const orderIds = selectedOrders.value.map(o => o.orderNo)
    
    const batch = {
      batchNo,
      orderIds,
      color: '混合',
      thickness: '混合',
      material: '混合',
      planStartDate: batchForm.value.dateRange[0],
      planEndDate: batchForm.value.dateRange[1],
      productionLine: '待排程', // 批次规划阶段不分配产线
      utilizationRate: utilizationRate.value,
      status: '待排程', // 状态改为待排程
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
    
    ElMessage.success('批次创建成功')
    emit('success', batch)
  } catch (error) {
    ElMessage.error('创建失败')
    console.error(error)
  } finally {
    creating.value = false
  }
}

// 取消
const cancel = () => {
  emit('cancel')
}

// 加载数据
const loadData = async () => {
  // 加载待排产订单
  const result = await getOrders({ status: '待排产', pageSize: 100 })
  if (result.code === 'SUCCESS') {
    availableOrders.value = result.data.list.map(order => ({
      ...order,
      mainColor: '子午灰', // 模拟数据
      mainThickness: 18 // 模拟数据
    }))
  }
  
  // 加载产线数据
  const linesResult = await getProductionLines()
  if (linesResult.code === 'SUCCESS') {
    productionLines.value = linesResult.data.map(line => ({
      ...line,
      loadRate: Math.floor(Math.random() * 100)
    }))
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.manual-batch-create {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.text-danger {
  color: #f56c6c;
  font-weight: 500;
}
</style>
