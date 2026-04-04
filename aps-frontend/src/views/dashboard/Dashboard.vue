<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 产能负荷概览 -->
      <el-col :span="8">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>产能负荷概览</span>
              <el-icon class="header-icon"><TrendCharts /></el-icon>
            </div>
          </template>
          <div class="capacity-list">
            <div v-for="line in capacityData" :key="line.line_id" class="capacity-item">
              <div class="capacity-info">
                <span class="line-name">{{ line.line_name }}</span>
                
              </div>
              <el-progress
                :percentage="line.load_rate"
                :color="getProgressColor(line.load_rate)"
                :stroke-width="12"
              />
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 订单状态统计 -->
      <el-col :span="8">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>订单状态统计</span>
              <el-icon class="header-icon"><PieChart /></el-icon>
            </div>
          </template>
          <div ref="orderChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 关键指标 -->
      <el-col :span="8">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>关键指标</span>
              <el-icon class="header-icon"><DataAnalysis /></el-icon>
            </div>
          </template>
          <div class="metrics-grid">
            <div v-for="metric in keyMetrics" :key="metric.label" class="metric-item">
              <div class="metric-value" :class="metric.valueClass">{{ metric.value }}</div>
              <div class="metric-label">{{ metric.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 产能负荷趋势图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>产能负荷趋势</span>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="small"
                @change="handleDateRangeChange"
              />
            </div>
          </template>
          <div ref="capacityTrendChartRef" class="chart-container-large"></div>
        </el-card>
      </el-col>

      <!-- 板材利用率趋势图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>板材利用率趋势</span>
              <el-icon class="header-icon"><TrendCharts /></el-icon>
            </div>
          </template>
          <div ref="utilizationTrendChartRef" class="chart-container-large"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 交期预警列表 -->
      <el-col :span="12">
        <el-card class="list-card">
          <template #header>
            <div class="card-header">
              <span>交期预警</span>
              <el-badge :value="dueWarningCount" class="item" type="danger">
                <el-icon class="header-icon"><Warning /></el-icon>
              </el-badge>
            </div>
          </template>
          <el-table :data="dueWarningList" style="width: 100%" size="small" max-height="300">
            <el-table-column prop="order_id" label="订单号" width="130" />
            <el-table-column prop="customer_name" label="客户" width="100" />
            <el-table-column prop="due_date" label="交期" width="100" />
            <el-table-column prop="estimated_completion" label="预计齐套" width="100" />
            <el-table-column prop="delay_days" label="延期天数" width="80">
              <template #default="scope">
                <el-tag :type="getDelayType(scope.row.delay_days)" size="small">
                  {{ scope.row.delay_days }}天
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="scope">
                <el-tag type="danger" size="small">预警</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 齐套等待列表 -->
      <el-col :span="12">
        <el-card class="list-card">
          <template #header>
            <div class="card-header">
              <span>齐套等待</span>
              <el-badge :value="waitingCount" class="item" type="warning">
                <el-icon class="header-icon"><Clock /></el-icon>
              </el-badge>
            </div>
          </template>
          <el-table :data="waitingList" style="width: 100%" size="small" max-height="300">
            <el-table-column prop="order_id" label="订单号" width="130" />
            <el-table-column prop="customer_name" label="客户" width="100" />
            <el-table-column prop="completion_progress" label="齐套进度" width="100" />
            <el-table-column prop="waiting_days" label="等待天数" width="80">
              <template #default="scope">
                <el-tag :type="getWaitingType(scope.row.waiting_days)" size="small">
                  {{ scope.row.waiting_days }}天
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort_status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getSortStatusType(scope.row.sort_status)" size="small">
                  {{ scope.row.sort_status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import * as echarts from 'echarts'
import { TrendCharts, PieChart, DataAnalysis, Warning, Clock } from '@element-plus/icons-vue'
import { initializeExtendedData } from '@/utils/mock-extended.js'

// 响应式数据
const capacityData = ref([])
const keyMetrics = ref([])
const dueWarningList = ref([])
const waitingList = ref([])
const dateRange = ref([new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()])

// 图表引用
const orderChartRef = ref(null)
const capacityTrendChartRef = ref(null)
const utilizationTrendChartRef = ref(null)

// 图表实例
let orderChart = null
let capacityTrendChart = null
let utilizationTrendChart = null

// 计算属性
const dueWarningCount = computed(() => dueWarningList.value.length)
const waitingCount = computed(() => waitingList.value.filter(item => item.waiting_days > 0).length)

/** YYYY-MM-DD 按本地日历解析，避免 new Date('2026-04-01') 按 UTC 解析导致差一天、筛选结果为空 */
const parseDateOnly = (s) => {
  if (!s || typeof s !== 'string') return new Date(NaN)
  const part = s.split('T')[0]
  const nums = part.split('-').map(Number)
  if (nums.length < 3 || nums.some(Number.isNaN)) return new Date(NaN)
  return new Date(nums[0], nums[1] - 1, nums[2])
}

const startOfLocalDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

// 初始化数据
const initializeData = () => {
  const data = initializeExtendedData()

  // 产能负荷数据
  capacityData.value = [
    {
      line_id: 'LINE001',
      line_name: '柜体A线',
      load_rate: 85,
      daily_capacity: 500,
      scheduled: 425,
      remaining: 75
    },
    {
      line_id: 'LINE002',
      line_name: '柜体B线',
      load_rate: 72,
      daily_capacity: 400,
      scheduled: 288,
      remaining: 112
    },
    {
      line_id: 'LINE003',
      line_name: '门板线',
      load_rate: 68,
      daily_capacity: 200,
      scheduled: 136,
      remaining: 64
    },
    {
      line_id: 'LINE004',
      line_name: '吸塑线',
      load_rate: 55,
      daily_capacity: 150,
      scheduled: 82,
      remaining: 68
    }
  ]

  // 交期预警列表（筛选过严或时区导致为空时，用前几条订单做演示占位）
  const today0 = startOfLocalDay(new Date())
  const isDueWarning = (order) => {
    const dueDate = startOfLocalDay(parseDateOnly(order.due_date))
    if (Number.isNaN(dueDate.getTime())) return false
    const daysDiff = Math.round((dueDate - today0) / (1000 * 60 * 60 * 24))
    return daysDiff < 0 || (daysDiff >= 0 && daysDiff <= 3 && order.status !== '已完成')
  }
  let warnSource = data.erp_sales_orders.filter(isDueWarning)
  if (warnSource.length === 0) {
    warnSource = data.erp_sales_orders.slice(0, 5)
  }
  dueWarningList.value = warnSource.slice(0, 5).map((order) => {
    const dueDate = startOfLocalDay(parseDateOnly(order.due_date))
    const daysDiff = Number.isNaN(dueDate.getTime())
      ? 0
      : Math.round((dueDate - today0) / (1000 * 60 * 60 * 24))
    return {
      order_id: order.order_id,
      customer_name: order.customer_name,
      due_date: order.due_date,
      estimated_completion: order.due_date,
      delay_days: daysDiff < 0 ? Math.abs(daysDiff) : Math.max(0, daysDiff),
      status: '预警'
    }
  })

  // 关键指标（交期预警数与上表一致）
  keyMetrics.value = [
    { label: '待排程', value: 25, valueClass: 'metric-blue' },
    { label: '待揉单', value: 18, valueClass: 'metric-orange' },
    { label: '待齐套', value: 8, valueClass: 'metric-purple' },
    { label: '交期预警', value: dueWarningList.value.length, valueClass: 'metric-red' }
  ]

  // 齐套等待列表（无「部分齐套+等待」时退化为任意部分齐套演示）
  let slotSource = data.mes_sorting_slots.filter(
    (slot) => slot.sort_status === '部分齐套' && slot.waiting_days > 0
  )
  if (slotSource.length === 0) {
    slotSource = data.mes_sorting_slots.filter((slot) => slot.sort_status === '部分齐套')
  }
  if (slotSource.length === 0) {
    slotSource = data.mes_sorting_slots.slice(0, 5)
  }
  waitingList.value = slotSource.slice(0, 5).map((slot) => {
    const order = data.erp_sales_orders.find((o) => o.order_id === slot.order_id)
    return {
      order_id: slot.order_id,
      customer_name: order?.customer_name || '-',
      completion_progress: slot.completion_progress,
      waiting_days: slot.waiting_days || 1,
      sort_status: slot.sort_status
    }
  })
}

// 初始化订单状态饼图
const initOrderChart = () => {
  if (!orderChartRef.value) return

  orderChart = echarts.init(orderChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['待拆解', '已拆解', '已排程', '生产中', '已完成']
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 12, name: '待拆解', itemStyle: { color: '#909399' } },
          { value: 25, name: '已拆解', itemStyle: { color: '#409EFF' } },
          { value: 45, name: '已排程', itemStyle: { color: '#67C23A' } },
          { value: 38, name: '生产中', itemStyle: { color: '#E6A23C' } },
          { value: 10, name: '已完成', itemStyle: { color: '#F56C6C' } }
        ]
      }
    ]
  }
  orderChart.setOption(option)
}

// 初始化产能负荷趋势图
const initCapacityTrendChart = () => {
  if (!capacityTrendChartRef.value) return

  capacityTrendChart = echarts.init(capacityTrendChartRef.value)
  const dates = ['4/1', '4/2', '4/3', '4/4', '4/5', '4/6', '4/7']
  const option = {
    tooltip: {
      trigger: 'axis',
      confine: true
    },
    legend: {
      data: ['柜体A线', '柜体B线', '门板线', '吸塑线'],
      top: 0,          // 图例贴紧图表顶部
      left: 'center'   // 水平居中（可选，默认左对齐）
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '柜体A线',
        type: 'line',
        data: [82, 85, 88, 85, 90, 87, 85],
        smooth: true
      },
      {
        name: '柜体B线',
        type: 'line',
        data: [70, 72, 75, 72, 78, 74, 72],
        smooth: true
      },
      {
        name: '门板线',
        type: 'line',
        data: [65, 68, 70, 68, 72, 69, 68],
        smooth: true
      },
      {
        name: '吸塑线',
        type: 'line',
        data: [50, 55, 60, 55, 62, 58, 55],
        smooth: true
      }
    ]
  }
  capacityTrendChart.setOption(option)
}

// 初始化板材利用率趋势图
const initUtilizationTrendChart = () => {
  if (!utilizationTrendChartRef.value) return

  utilizationTrendChart = echarts.init(utilizationTrendChartRef.value)
  const dates = ['4/1', '4/2', '4/3', '4/4', '4/5', '4/6', '4/7']
  const option = {
    tooltip: {
      trigger: 'axis',
      confine: true
    },
    legend: {
      data: ['板材利用率'],
      top: 10,          // 距离图表顶部 10px，避免贴太近
      left: 'center'   // 水平居中
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value',
      min: 80,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '板材利用率',
        type: 'line',
        data: [88.5, 90.2, 89.8, 91.5, 90.8, 92.3, 91.0],
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' },
            { yAxis: 90, name: '目标值' }
          ]
        }
      }
    ]
  }
  utilizationTrendChart.setOption(option)
}

// 工具函数
const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#F56C6C'
  if (percentage >= 80) return '#E6A23C'
  if (percentage >= 70) return '#409EFF'
  return '#67C23A'
}

const getDelayType = (days) => {
  if (days === 0) return ''
  if (days <= 3) return 'warning'
  return 'danger'
}

const getWaitingType = (days) => {
  if (days <= 2) return 'success'
  if (days <= 4) return 'warning'
  return 'danger'
}

const getSortStatusType = (status) => {
  const map = {
    '待齐套': 'info',
    '部分齐套': 'warning',
    '已齐套': 'success',
    '已发货': ''
  }
  return map[status] || 'info'
}

const handleDateRangeChange = () => {
  // 重新加载数据
  console.log('日期范围变更:', dateRange.value)
  // TODO: 调用API重新获取数据
}

// 窗口大小改变时重绘图表
const handleResize = () => {
  orderChart?.resize()
  capacityTrendChart?.resize()
  utilizationTrendChart?.resize()
}

// 生命周期
onMounted(() => {
  initializeData()
  initOrderChart()
  initCapacityTrendChart()
  initUtilizationTrendChart()

  window.addEventListener('resize', handleResize)
})

// 清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  orderChart?.dispose()
  capacityTrendChart?.dispose()
  utilizationTrendChart?.dispose()
})
</script>

<style scoped>
.dashboard {
  position: relative;
  z-index: 0;
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-icon {
  font-size: 18px;
  color: #909399;
}

.stat-card {
  margin-bottom: 20px;
  height: 340px; /* 固定高度,使三个卡片一致 */
  display: flex;
  flex-direction: column;
}

.stat-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.capacity-list {
  padding: 10px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.capacity-item {
  margin-bottom: 20px;
}

.capacity-item:last-child {
  margin-bottom: 0;
}

.capacity-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.line-name {
  font-weight: 500;
  color: #303133;
}

.capacity-text {
  font-weight: 600;
  color: #409EFF;
}

.chart-container {
  height: 250px;
}

.chart-container-large {
  height: 300px;
}

.chart-card {
  margin-bottom: 20px;
}

.list-card {
  margin-bottom: 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 10px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.metric-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.metric-value {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.metric-blue {
  color: #409EFF;
}

.metric-orange {
  color: #E6A23C;
}

.metric-purple {
  color: #9C27B0;
}

.metric-red {
  color: #F56C6C;
}

.metric-label {
  font-size: 14px;
  color: #606266;
}

.item {
  margin-top: 0;
}
</style>
