<template>
  <div class="batch-plan-optimized">
    <el-card class="toolbar-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-button type="primary" :icon="MagicStick" @click="handleAutoPlan">
            自动揉单
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="DocumentCopy" @click="handleManualPlan">
            手工揉单
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="warning" :icon="Clock" @click="handleShowDeadline">
            交期红线
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="Refresh" @click="loadData">
            刷新
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 左右布局 -->
    <el-row :gutter="20">
      <!-- 左侧: 待揉单任务 -->
      <el-col :span="10">
        <el-card class="task-card">
          <template #header>
            <div class="card-header">
              <span>待揉单任务</span>
              <el-tag type="info">{{ pendingTasks.length }} 个任务</el-tag>
            </div>
          </template>

          <!-- 筛选 -->
          <el-form :model="filterForm" label-width="80px" size="small">
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item label="产线">
                  <el-select v-model="filterForm.line_id" placeholder="全部" clearable style="width: 100%">
                    <el-option label="全部产线" value="" />
                    <el-option
                      v-for="line in productionLines"
                      :key="line.line_id"
                      :label="line.line_name"
                      :value="line.line_id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="交期范围">
                  <el-date-picker
                    v-model="filterForm.date_range"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始"
                    end-placeholder="结束"
                    style="width: 100%"
                    size="small"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <!-- 任务列表 -->
          <el-table
            :data="filteredTasks"
            @selection-change="handleTaskSelection"
            max-height="500"
            stripe
            size="small"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column prop="task_id" label="任务号" width="120" show-overflow-tooltip />
            <el-table-column prop="production_order_id" label="子订单" width="120" show-overflow-tooltip />
            <el-table-column prop="planned_start_date" label="计划日期" width="100">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ row.planned_start_date }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="due_date" label="交期" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="getDueDateType(row.due_date, row.planned_start_date)">
                  {{ row.due_date }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="line_id" label="产线" width="80">
              <template #default="{ row }">
                <el-tag size="small">{{ getLineName(row.line_id) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧: 揉单结果 -->
      <el-col :span="14">
        <el-card class="result-card">
          <template #header>
            <div class="card-header">
              <span>揉单结果</span>
              <div>
                <el-tag type="info">{{ mergedBatches.length }} 个批次</el-tag>
                <el-tag type="success" style="margin-left: 10px;">利用率: {{ avgUtilization }}%</el-tag>
              </div>
            </div>
          </template>

          <!-- 批次列表 -->
          <el-table :data="mergedBatches" stripe size="small">
            <el-table-column prop="batch_id" label="批次号" width="120" />
            <el-table-column prop="line_id" label="产线" width="80">
              <template #default="{ row }">
                <el-tag size="small">{{ getLineName(row.line_id) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="planned_date" label="计划日期" width="100">
              <template #default="{ row }">
                <el-tag size="small" type="info">{{ row.planned_date }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="order_count" label="订单数" width="70" align="center" />
            <el-table-column prop="part_count" label="部件数" width="70" align="center" />
            <el-table-column prop="utilization" label="利用率" width="80" align="center">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.utilization"
                  :color="getUtilizationColor(row.utilization)"
                  :stroke-width="12"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button type="primary" size="small" link @click="handleViewBatch(row)">
                  详情
                </el-button>
                <el-button type="warning" size="small" link @click="handleAdjustBatch(row)">
                  调整
                </el-button>
                <el-button type="danger" size="small" link @click="handleDeleteBatch(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 交期红线对话框 -->
    <el-dialog v-model="deadlineVisible" title="交期红线任务" width="800px">
      <el-alert
        title="以下任务已达到最迟开工日,需要立即下发生产"
        type="warning"
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-table :data="deadlineTasks" stripe>
        <el-table-column prop="task_id" label="任务号" width="120" />
        <el-table-column prop="production_order_id" label="子订单" width="120" />
        <el-table-column prop="due_date" label="交期" width="100">
          <template #default="{ row }">
            <el-tag type="danger">{{ row.due_date }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="latest_start_date" label="最迟开工日" width="120">
          <template #default="{ row }">
            <el-tag type="danger">{{ row.latest_start_date }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleForceIssue(row)">
              强制下发
            </el-button>
            <el-button type="success" size="small" @click="handleBatchIssue(row)">
              揉单下发
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="deadlineVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MagicStick, DocumentCopy, Clock, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { initializeExtendedData } from '@/utils/mock-extended.js'

// 响应式数据
const pendingTasks = ref([])
const productionLines = ref([])
const selectedTasks = ref([])
const mergedBatches = ref([])
const deadlineTasks = ref([])
const deadlineVisible = ref(false)

// 筛选表单
const filterForm = ref({
  line_id: '',
  date_range: []
})

// 初始化数据
const loadData = () => {
  const data = initializeExtendedData()

  // 产线数据
  productionLines.value = data.sys_workCenters

  // 待揉单任务(与排程任务关联)
  pendingTasks.value = data.aps_schedule_tasks
    .filter(task => task.schedule_status === '已排定')
    .map(task => {
      const productionOrder = data.aps_production_orders.find(po => po.production_order_id === task.production_order_id)
      const order = data.erp_sales_orders.find(o => o.order_id === productionOrder?.order_id)
      
      // 计算最迟开工日
      const dueDate = order ? new Date(order.due_date) : null
      const plannedStart = new Date(task.planned_start_date)
      const latestStart = dueDate ? new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000) : null // 假设生产周期3天
      
      return {
        ...task,
        due_date: order?.due_date || '',
        latest_start_date: latestStart?.toISOString().split('T')[0] || '',
        is_deadline: latestStart && plannedStart >= latestStart
      }
    })

  // 交期红线任务
  deadlineTasks.value = pendingTasks.value.filter(task => task.is_deadline)

  // 揉单批次(与上游数据关联)
  mergedBatches.value = data.aps_merge_batches.map(batch => {
    const details = data.aps_batch_details.filter(d => d.batch_id === batch.batch_id)
    const tasks = details.map(d => data.aps_schedule_tasks.find(t => t.task_id === d.task_id)).filter(Boolean)
    
    return {
      ...batch,
      order_count: details.length,
      part_count: tasks.reduce((sum, t) => sum + (t?.part_count || 0), 0),
      utilization: Math.floor(Math.random() * 20) + 80 // 80-99%利用率
    }
  })

  console.log('✓ 加载待揉单任务:', pendingTasks.value.length, '个')
  console.log('✓ 加载揉单批次:', mergedBatches.value.length, '个')
}

// 计算属性
const filteredTasks = computed(() => {
  let result = pendingTasks.value

  // 按产线筛选
  if (filterForm.value.line_id) {
    result = result.filter(task => task.line_id === filterForm.value.line_id)
  }

  // 按日期范围筛选
  if (filterForm.value.date_range && filterForm.value.date_range.length === 2) {
    const [start, end] = filterForm.value.date_range
    result = result.filter(task => {
      const taskDate = new Date(task.planned_start_date)
      return taskDate >= start && taskDate <= end
    })
  }

  return result
})

const avgUtilization = computed(() => {
  if (mergedBatches.value.length === 0) return 0
  const sum = mergedBatches.value.reduce((acc, batch) => acc + batch.utilization, 0)
  return Math.round(sum / mergedBatches.value.length)
})

// 事件处理
const handleTaskSelection = (selection) => {
  selectedTasks.value = selection
}

const handleAutoPlan = () => {
  if (selectedTasks.value.length === 0) {
    ElMessage.warning('请先选择要揉单的任务')
    return
  }

  // 模拟自动揉单
  const newBatch = {
    batch_id: `BATCH${Date.now()}`,
    line_id: selectedTasks.value[0].line_id,
    planned_date: selectedTasks.value[0].planned_start_date,
    order_count: selectedTasks.value.length,
    part_count: selectedTasks.value.reduce((sum, t) => sum + (t.part_count || 1), 0),
    utilization: Math.floor(Math.random() * 15) + 85, // 85-99%
    status: '待下发'
  }

  mergedBatches.value.unshift(newBatch)
  ElMessage.success(`成功揉单 ${selectedTasks.value.length} 个任务`)
}

const handleManualPlan = () => {
  ElMessage.info('手工揉单功能开发中...')
}

const handleShowDeadline = () => {
  if (deadlineTasks.value.length === 0) {
    ElMessage.info('暂无交期红线任务')
    return
  }
  deadlineVisible.value = true
}

const handleForceIssue = (task) => {
  ElMessage.success(`任务 ${task.task_id} 已强制下发`)
}

const handleBatchIssue = (task) => {
  ElMessage.success(`任务 ${task.task_id} 已加入揉单`)
}

const handleViewBatch = (batch) => {
  ElMessage.info(`查看批次 ${batch.batch_id} 详情`)
}

const handleAdjustBatch = (batch) => {
  ElMessage.info(`调整批次 ${batch.batch_id}`)
}

const handleDeleteBatch = async (batch) => {
  try {
    await ElMessageBox.confirm(`确定要删除批次 ${batch.batch_id} 吗?`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const index = mergedBatches.value.findIndex(b => b.batch_id === batch.batch_id)
    if (index !== -1) {
      mergedBatches.value.splice(index, 1)
    }

    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消
  }
}

// 工具函数
const getLineName = (lineId) => {
  if (!productionLines.value || !Array.isArray(productionLines.value)) {
    return lineId || '未知产线'
  }
  const line = productionLines.value.find(l => l.line_id === lineId)
  return line ? line.line_name : lineId
}

const getDueDateType = (dueDate, plannedDate) => {
  const due = new Date(dueDate)
  const planned = new Date(plannedDate)
  const diff = Math.ceil((due - planned) / (1000 * 60 * 60 * 24))
  
  if (diff <= 0) return 'danger'
  if (diff <= 2) return 'warning'
  return 'success'
}

const getUtilizationColor = (utilization) => {
  if (utilization >= 90) return '#67C23A'
  if (utilization >= 80) return '#409EFF'
  return '#E6A23C'
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.batch-plan-optimized {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.toolbar-card {
  margin-bottom: 20px;
}

.task-card,
.result-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
