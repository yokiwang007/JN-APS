<template>
  <div class="coarse-gantt">
    <el-card class="toolbar-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
            @change="handleDateRangeChange"
          />
        </el-col>
        <el-col :span="4">
          <el-select v-model="selectedLine" placeholder="选择产线" clearable style="width: 100%">
            <el-option label="全部产线" value="" />
            <el-option
              v-for="line in productionLines"
              :key="line.line_id"
              :label="line.line_name"
              :value="line.line_id"
            />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </el-col>
        <el-col :span="4">
          <el-button type="success" @click="handleSave">
            <el-icon><Check /></el-icon>
            保存排程
          </el-button>
        </el-col>
        <el-col :span="6">
          <div class="legend">
            <span class="legend-item">
              <span class="legend-color" style="background: #409EFF;"></span>
              柜体
            </span>
            <span class="legend-item">
              <span class="legend-color" style="background: #67C23A;"></span>
              门板
            </span>
            <span class="legend-item">
              <span class="legend-color" style="background: #E6A23C;"></span>
              吸塑
            </span>
            <span class="legend-item">
              <span class="legend-color" style="background: #F56C6C;"></span>
              交期预警
            </span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="gantt-card">
      <div ref="ganttChartRef" class="gantt-container"></div>
    </el-card>

    <!-- 任务详情对话框 -->
    <el-dialog v-model="taskDetailVisible" title="任务详情" width="600px">
      <el-descriptions v-if="selectedGanttTask" :column="2" border>
        <el-descriptions-item label="任务号">
          {{ selectedGanttTask.task_id }}
        </el-descriptions-item>
        <el-descriptions-item label="生产子订单">
          {{ selectedGanttTask.production_order_id }}
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ selectedGanttTask.start }}
        </el-descriptions-item>
        <el-descriptions-item label="结束时间">
          {{ selectedGanttTask.end }}
        </el-descriptions-item>
        <el-descriptions-item label="产线">
          {{ getLineName(selectedGanttTask.line_id) }}
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          {{ selectedGanttTask.priority }}
        </el-descriptions-item>
        <el-descriptions-item label="状态" :span="2">
          <el-tag :type="selectedGanttTask.is_warning ? 'danger' : 'success'">
            {{ selectedGanttTask.is_warning ? '交期预警' : '正常' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="taskDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { initializeExtendedData } from '@/utils/mock-extended.js'

// 响应式数据
const productionLines = ref([])
const ganttTasks = ref([])
const selectedLine = ref('')
const dateRange = ref([new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)])
const taskDetailVisible = ref(false)
const selectedGanttTask = ref(null)
const ganttChartRef = ref(null)

let ganttChart = null

// 初始化数据
const initializeData = () => {
  console.log('🔄 开始初始化甘特图数据...')

  const data = initializeExtendedData()
  console.log('📦 initializeExtendedData 返回的数据:', Object.keys(data))
  console.log('  - sys_work_centers:', data.sys_work_centers?.length || 0, '条')
  console.log('  - aps_schedule_tasks:', data.aps_schedule_tasks?.length || 0, '条')
  console.log('  - aps_production_orders:', data.aps_production_orders?.length || 0, '条')
  console.log('  - erp_sales_orders:', data.erp_sales_orders?.length || 0, '条')

  // 产线数据
  productionLines.value = data.sys_work_centers || []
  console.log('✅ 产线数据已加载:', productionLines.value.length, '条')

  // 甘特图任务数据(与排程任务数据关联)
  ganttTasks.value = (data.aps_schedule_tasks || []).map(task => {
    const productionOrder = data.aps_production_orders?.find(po => po.production_order_id === task.production_order_id)
    const order = data.erp_sales_orders?.find(o => o.order_id === productionOrder?.order_id)

    // 检查是否交期预警
    const dueDate = order ? new Date(order.due_date) : null
    const endDate = new Date(task.planned_end_date)
    const is_warning = dueDate && endDate > dueDate

    return {
      task_id: task.task_id,
      production_order_id: task.production_order_id,
      line_id: task.line_id,
      start: task.planned_start_date,
      end: task.planned_end_date,
      priority: productionOrder?.priority || 3,
      is_warning: is_warning,
      process_route: productionOrder?.process_route || '标准柜体线'
    }
  })

  console.log('✓ 加载甘特图数据:', ganttTasks.value.length, '条')
}

// 初始化甘特图
const initGanttChart = () => {
  if (!ganttChartRef.value) return

  ganttChart = echarts.init(ganttChartRef.value)
  updateGanttChart()

  window.addEventListener('resize', () => {
    ganttChart?.resize()
  })
}

// 更新甘特图
const updateGanttChart = () => {
  if (!ganttChart) return

  console.log('📊 更新甘特图')
  console.log('  - 产线数据:', productionLines.value?.length || 0, '条')
  console.log('  - 任务数据:', ganttTasks.value?.length || 0, '条')
  console.log('  - 选中的产线:', selectedLine.value)

  // 获取日期范围
  const startDate = dateRange.value[0]
  const endDate = dateRange.value[1]

  // 生成日期数组
  const dates = []
  const current = new Date(startDate)
  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }

  // 筛选任务
  let filteredTasks = ganttTasks.value || []
  if (selectedLine.value) {
    filteredTasks = filteredTasks.filter(task => task.line_id === selectedLine.value)
  }

  // 按产线分组
  const lines = selectedLine.value
    ? productionLines.value.filter(l => l.line_id === selectedLine.value)
    : productionLines.value

  // 安全检查:如果产线数据为空,不渲染图表
  if (!lines || lines.length === 0) {
    console.warn('⚠️ 产线数据为空,无法渲染甘特图')
    return
  }

  const series = lines.map(line => {
    const lineTasks = filteredTasks.filter(task => task.line_id === line.line_id)

    return {
      name: line.line_name,
      type: 'scatter',
      coordinateSystem: 'calendar',
      data: lineTasks.map(task => ({
        name: task.production_order_id,
        value: [task.end, task.task_id],
        itemStyle: {
          color: task.is_warning ? '#F56C6C' : getProcessRouteColor(task.process_route)
        }
      }))
    }
  })

  const option = {
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `
          <strong>${params.data.name}</strong><br/>
          开始: ${params.data.value[0]}<br/>
          任务: ${params.data.value[1]}
        `
      }
    },
    calendar: {
      top: 60,
      left: 30,
      right: 30,
      cellSize: ['auto', 50],
      range: dates,
      itemStyle: {
        borderWidth: 1,
        borderColor: '#fff'
      },
      yearLabel: { show: false },
      monthLabel: { name: 'cn', fontSize: 12 },
      dayLabel: { name: 'cn', fontSize: 12 }
    },
    series: series
  }

  ganttChart.setOption(option)
}

// 刷新
const handleRefresh = () => {
  initializeData()
  updateGanttChart()
  ElMessage.success('刷新成功')
}

// 保存排程
const handleSave = () => {
  ElMessage.success('排程保存成功')
}

// 日期范围变更
const handleDateRangeChange = () => {
  updateGanttChart()
}

// 点击事件
ganttChart?.on('click', function (params) {
  if (params.componentType === 'series') {
    const task = ganttTasks.value.find(t => t.task_id === params.data.value[1])
    if (task) {
      selectedGanttTask.value = task
      taskDetailVisible.value = true
    }
  }
})

// 工具函数
const getLineName = (lineId) => {
  if (!productionLines.value || !Array.isArray(productionLines.value)) {
    return lineId || '未知产线'
  }
  const line = productionLines.value.find(l => l.line_id === lineId)
  return line ? line.line_name : lineId
}

const getProcessRouteColor = (route) => {
  const map = {
    '标准柜体线': '#409EFF',
    '吸塑门板线': '#67C23A',
    '背板线': '#E6A23C',
    '外协采购': '#909399'
  }
  return map[route] || '#409EFF'
}

// 生命周期
onMounted(() => {
  initializeData()
  initGanttChart()
})
</script>

<style scoped>
.coarse-gantt {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.toolbar-card {
  margin-bottom: 20px;
}

.gantt-card {
  margin-bottom: 20px;
}

.gantt-container {
  height: 600px;
}

.legend {
  display: flex;
  align-items: center;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #606266;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}
</style>
