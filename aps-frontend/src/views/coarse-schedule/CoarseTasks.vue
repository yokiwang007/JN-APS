<template>
  <div class="coarse-tasks">
    <el-card class="operation-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-button type="primary" :icon="MagicStick" @click="handleAutoSchedule">
            自动排程建议
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-select v-model="selectedRule" placeholder="选择排程规则" style="width: 100%">
            <el-option label="默认规则" value="default" />
            <el-option label="交期优先" value="delivery" />
            <el-option label="产能均衡" value="capacity" />
            <el-option label="齐套优先" value="fulfillment" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="success" :icon="Check" @click="handleSaveSchedule" :disabled="!hasSelectedTasks">
            保存排程
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="View" @click="goToGantt">
            排程甘特图
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 左侧: 待排程子订单列表 -->
      <el-col :span="10">
        <el-card class="list-card">
          <template #header>
            <div class="card-header">
              <span>待排程子订单列表</span>
              <el-checkbox v-model="selectAll" @change="handleSelectAll">
                全选
              </el-checkbox>
            </div>
          </template>
          <el-table
            ref="taskTableRef"
            :data="pendingTasks"
            style="width: 100%"
            size="small"
            max-height="600"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="production_order_id" label="子订单号" width="130" />
            <el-table-column prop="order_id" label="订单号" width="100" />
            <el-table-column prop="customer_name" label="客户名称" width="100" />
            <el-table-column prop="due_date" label="交期" width="100" />
            <el-table-column prop="process_route" label="工艺路线" width="120">
              <template #default="scope">
                <el-tag size="small" :type="getProcessRouteType(scope.row.process_route)">
                  {{ scope.row.process_route }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="total_part_count" label="件数" width="70" />
            <el-table-column prop="material" label="材质" width="80" />
            <el-table-column prop="color" label="花色" width="80" />
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button type="primary" size="small" link @click="handleViewDetail(scope.row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧: 产能看板 -->
      <el-col :span="14">
        <el-card class="capacity-card">
          <template #header>
            <div class="card-header">
              <span>产线负荷看板</span>
              <el-tag type="info">今日产能</el-tag>
            </div>
          </template>
          <div class="capacity-grid">
            <div v-for="line in capacityData" :key="line.line_id" class="capacity-item">
              <div class="capacity-header">
                <span class="line-name">{{ line.line_name }}</span>
                <span class="load-rate">{{ line.load_rate }}%</span>
              </div>
              <el-progress
                :percentage="line.load_rate"
                :color="getProgressColor(line.load_rate)"
                :stroke-width="14"
              />
              <div class="capacity-details">
                <span>日产能: {{ line.daily_capacity }}件</span>
                <span>已排程: {{ line.scheduled }}件</span>
                <span>剩余: {{ line.remaining }}件</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 排程设置区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card class="setting-card">
          <template #header>
            <div class="card-header">
              <span>排程设置</span>
              <el-tag type="warning" v-if="hasSelectedTasks">
                已选择 {{ selectedTasks.length }} 个任务
              </el-tag>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="目标产线">
                <el-select v-model="scheduleForm.line_id" placeholder="请选择产线" style="width: 100%">
                  <el-option
                    v-for="line in capacityData"
                    :key="line.line_id"
                    :label="line.line_name"
                    :value="line.line_id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="计划日期">
                <el-date-picker
                  v-model="scheduleForm.planned_date"
                  type="date"
                  placeholder="选择日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="排程模式">
                <el-select v-model="scheduleForm.schedule_mode" placeholder="请选择模式" style="width: 100%">
                  <el-option label="倒排计划" value="backward" />
                  <el-option label="正排计划" value="forward" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="齐套缓冲期">
                <el-input-number
                  v-model="scheduleForm.buffer_days"
                  :min="0"
                  :max="10"
                  controls-position="right"
                  style="width: 100%"
                />
                <span style="margin-left: 10px;">天</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 子订单详情对话框 -->
    <el-dialog v-model="detailVisible" title="子订单详情" width="700px">
      <el-descriptions v-if="selectedTask" :column="2" border>
        <el-descriptions-item label="子订单号">
          {{ selectedTask.production_order_id }}
        </el-descriptions-item>
        <el-descriptions-item label="订单号">
          {{ selectedTask.order_id }}
        </el-descriptions-item>
        <el-descriptions-item label="工艺路线" :span="2">
          <el-tag :type="getProcessRouteType(selectedTask.process_route)">
            {{ selectedTask.process_route }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="部件数量">
          {{ selectedTask.total_part_count }}件
        </el-descriptions-item>
        <el-descriptions-item label="材质">
          {{ selectedTask.material }}
        </el-descriptions-item>
        <el-descriptions-item label="厚度">
          {{ selectedTask.thickness }}mm
        </el-descriptions-item>
        <el-descriptions-item label="花色">
          {{ selectedTask.color }}
        </el-descriptions-item>
        <el-descriptions-item label="封边模式" :span="2">
          {{ selectedTask.edge_banding }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(selectedTask.status)">
            {{ selectedTask.status }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MagicStick, Check, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { initializeExtendedData } from '@/utils/mock-extended.js'

const router = useRouter()

// 响应式数据
const pendingTasks = ref([])
const capacityData = ref([])
const selectedTasks = ref([])
const selectedTask = ref(null)
const selectedRule = ref('default')
const selectAll = ref(false)
const detailVisible = ref(false)
const taskTableRef = ref(null)

// 排程表单
const scheduleForm = ref({
  line_id: '',
  planned_date: null,
  schedule_mode: 'backward',
  buffer_days: 2
})

// 计算属性
const hasSelectedTasks = computed(() => selectedTasks.value.length > 0)

// 初始化数据
const initializeData = () => {
  const data = initializeExtendedData()

  // 待排程子订单(与上游订单和BOM关联)
  pendingTasks.value = data.aps_production_orders
    .filter(po => po.status === '待排程')
    .map(po => {
      // 获取关联的销售订单信息
      const order = data.erp_sales_orders.find(o => o.order_id === po.order_id)
      
      // 获取关联的BOM零件数量
      const parts = data.cad_bom_parts.filter(p => p.order_id === po.order_id)
      
      return {
        ...po,
        customer_name: order?.customer_name || '',
        due_date: order?.due_date || '',
        total_part_count: parts.length,
        part_count: parts.length
      }
    })
    .slice(0, 15)

  // 产能数据(与工作中心关联)
  capacityData.value = data.sys_work_centers.map(line => {
    // 获取该产线已排程的任务数量
    const scheduledTasks = data.aps_schedule_tasks.filter(t => t.line_id === line.line_id)
    const scheduledCount = scheduledTasks.length * 10 // 假设每个任务10件
    const remaining = line.daily_capacity - scheduledCount
    const loadRate = Math.min(100, Math.round((scheduledCount / line.daily_capacity) * 100))

    return {
      line_id: line.line_id,
      line_name: line.line_name,
      line_type: line.line_type,
      daily_capacity: line.daily_capacity,
      scheduled: scheduledCount,
      remaining: Math.max(0, remaining),
      load_rate: loadRate
    }
  })

  console.log('✓ 加载待排程任务:', pendingTasks.value.length, '条')
  console.log('✓ 加载产能数据:', capacityData.value.length, '条')
}

// 自动排程建议
const handleAutoSchedule = async () => {
  if (pendingTasks.value.length === 0) {
    ElMessage.warning('没有待排程的任务')
    return
  }

  try {
    await ElMessageBox.confirm('确定要根据产能和交期生成自动排程建议吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })

    ElMessage.info('正在计算排程建议...')

    // 模拟排程计算
    setTimeout(() => {
      // 为每个任务分配计划日期和产线
      pendingTasks.value.forEach(task => {
        const line = capacityData.value[Math.floor(Math.random() * capacityData.value.length)]
        task.planned_date = generateRandomDate(1, 7)
        task.line_id = line.line_id
        task.status = '已排程'
      })

      ElMessage.success('排程建议生成完成,共排程 ' + pendingTasks.value.length + ' 个任务')
    }, 1500)
  } catch (error) {
    // 用户取消
  }
}

// 保存排程
const handleSaveSchedule = async () => {
  if (selectedTasks.value.length === 0) {
    ElMessage.warning('请先选择要排程的任务')
    return
  }

  if (!scheduleForm.value.line_id || !scheduleForm.value.planned_date) {
    ElMessage.warning('请设置目标产线和计划日期')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要对选中的 ${selectedTasks.value.length} 个任务进行排程吗?`,
      '确认排程',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 更新任务状态
    selectedTasks.value.forEach(task => {
      task.planned_date = scheduleForm.value.planned_date
      task.line_id = scheduleForm.value.line_id
      task.status = '已排程'
    })

    // 更新产能数据
    const line = capacityData.value.find(l => l.line_id === scheduleForm.value.line_id)
    if (line) {
      line.scheduled += selectedTasks.value.reduce((sum, task) => sum + task.total_part_count, 0)
      line.remaining = line.daily_capacity - line.scheduled
      line.load_rate = Math.round((line.scheduled / line.daily_capacity) * 100)
    }

    ElMessage.success('排程保存成功')
  } catch (error) {
    // 用户取消
  }
}

// 全选
const handleSelectAll = (val) => {
  if (val) {
    taskTableRef.value?.toggleAllSelection()
  } else {
    taskTableRef.value?.clearSelection()
  }
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedTasks.value = selection
}

// 查看详情
const handleViewDetail = (row) => {
  selectedTask.value = row
  detailVisible.value = true
}

// 跳转到甘特图
const goToGantt = () => {
  router.push('/coarse-schedule/gantt')
}

// 工具函数
const getProcessRouteType = (route) => {
  const map = {
    '标准柜体线': 'primary',
    '吸塑门板线': 'success',
    '背板线': 'warning',
    '外协采购': 'info'
  }
  return map[route] || 'info'
}

const getStatusType = (status) => {
  const map = {
    '待排程': 'info',
    '已排程': 'success',
    '已合并': 'warning',
    '生产中': 'primary',
    '已完成': ''
  }
  return map[status] || 'info'
}

const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#F56C6C'
  if (percentage >= 80) return '#E6A23C'
  if (percentage >= 70) return '#409EFF'
  return '#67C23A'
}

const generateRandomDate = (startDays, endDays) => {
  const now = new Date()
  const days = Math.floor(Math.random() * (endDays - startDays)) + startDays
  const date = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return date.toISOString().split('T')[0]
}

// 生命周期
onMounted(() => {
  initializeData()
})
</script>

<style scoped>
.coarse-tasks {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.operation-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-card {
  margin-bottom: 20px;
}

.capacity-card {
  margin-bottom: 20px;
}

.capacity-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.capacity-item {
  padding: 15px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.capacity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.line-name {
  font-weight: 600;
  color: #303133;
}

.load-rate {
  font-weight: 600;
  color: #409EFF;
}

.capacity-details {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 12px;
  color: #606266;
}

.setting-card {
  margin-bottom: 20px;
}
</style>
