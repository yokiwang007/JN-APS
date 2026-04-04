<template>
  <div class="coarse-list">
    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="filterForm.line_id" placeholder="产线" clearable style="width: 100%">
            <el-option label="全部产线" value="" />
            <el-option
              v-for="line in productionLines"
              :key="line.line_id"
              :label="line.line_name"
              :value="line.line_id"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker
            v-model="filterForm.date_range"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
          />
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterForm.status" placeholder="状态" clearable style="width: 100%">
            <el-option label="全部状态" value="" />
            <el-option label="已排定" value="已排定" />
            <el-option label="已揉单" value="已揉单" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>排程任务列表</span>
          <el-tag type="info">共 {{ scheduleTasks.length }} 条记录</el-tag>
        </div>
      </template>
      <el-table :data="scheduleTasks" style="width: 100%" size="default" stripe>
        <el-table-column prop="task_id" label="任务号" width="140" fixed />
        <el-table-column prop="production_order_id" label="生产子订单" width="140" />
        <el-table-column prop="planned_start_date" label="计划开工日期" width="120">
          <template #default="scope">
            <el-tag size="small" type="info">{{ scope.row.planned_start_date }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="planned_end_date" label="计划完工日期" width="120">
          <template #default="scope">
            <el-tag size="small" type="success">{{ scope.row.planned_end_date }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="line_id" label="产线" width="120">
          <template #default="scope">
            <el-tag size="small" :type="getLineType(scope.row.line_id)">
              {{ getLineName(scope.row.line_id) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100" sortable>
          <template #default="scope">
            <el-rate
              v-model="scope.row.priority"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
          </template>
        </el-table-column>
        <el-table-column prop="schedule_status" label="排产状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.schedule_status)">
              {{ scope.row.schedule_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="handleViewDetail(scope.row)">
              详情
            </el-button>
            <el-button type="warning" size="small" link @click="handleAdjust(scope.row)">
              调整
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end;"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 任务详情对话框 -->
    <el-dialog v-model="detailVisible" title="排程任务详情" width="700px">
      <el-descriptions v-if="selectedTask" :column="2" border>
        <el-descriptions-item label="任务号">
          {{ selectedTask.task_id }}
        </el-descriptions-item>
        <el-descriptions-item label="生产子订单">
          {{ selectedTask.production_order_id }}
        </el-descriptions-item>
        <el-descriptions-item label="计划开工日期">
          <el-tag type="info">{{ selectedTask.planned_start_date }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="计划完工日期">
          <el-tag type="success">{{ selectedTask.planned_end_date }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="分配产线">
          {{ getLineName(selectedTask.line_id) }}
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-rate
            :model-value="selectedTask.priority"
            disabled
            show-score
            text-color="#ff9900"
          />
        </el-descriptions-item>
        <el-descriptions-item label="排产状态" :span="2">
          <el-tag :type="getStatusType(selectedTask.schedule_status)">
            {{ selectedTask.schedule_status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ selectedTask.created_at }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 调整对话框 -->
    <el-dialog v-model="adjustVisible" title="调整排程" width="500px">
      <el-form :model="adjustForm" label-width="120px">
        <el-form-item label="任务号">
          <el-input v-model="adjustForm.task_id" disabled />
        </el-form-item>
        <el-form-item label="计划开工日期">
          <el-date-picker
            v-model="adjustForm.planned_start_date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="计划完工日期">
          <el-date-picker
            v-model="adjustForm.planned_end_date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="分配产线">
          <el-select v-model="adjustForm.line_id" placeholder="请选择产线" style="width: 100%">
            <el-option
              v-for="line in productionLines"
              :key="line.line_id"
              :label="line.line_name"
              :value="line.line_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-rate
            v-model="adjustForm.priority"
            show-score
            text-color="#ff9900"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAdjust">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { initializeExtendedData } from '@/utils/mock-extended.js'

// 响应式数据
const scheduleTasks = ref([])
const productionLines = ref([])
const selectedTask = ref(null)
const detailVisible = ref(false)
const adjustVisible = ref(false)
const adjustForm = ref({
  task_id: '',
  planned_start_date: '',
  planned_end_date: '',
  line_id: '',
  priority: 3
})

// 筛选表单
const filterForm = ref({
  line_id: '',
  date_range: [],
  status: ''
})

// 分页
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 初始化数据
const initializeData = () => {
  const data = initializeExtendedData()

  // 产线数据
  productionLines.value = data.sys_work_centers

  // 排程任务数据(与上游数据关联)
  scheduleTasks.value = data.aps_schedule_tasks.map(task => {
    // 关联生产子订单信息
    const productionOrder = data.aps_production_orders.find(po => po.production_order_id === task.production_order_id)
    
    // 关联销售订单信息
    const order = data.erp_sales_orders.find(o => o.order_id === productionOrder?.order_id)
    
    return {
      ...task,
      priority: productionOrder?.priority || 3,
      customer_name: order?.customer_name || '',
      due_date: order?.due_date || '',
      created_at: new Date().toISOString()
    }
  })

  pagination.value.total = scheduleTasks.value.length

  console.log('✓ 加载排程任务数据:', scheduleTasks.value.length, '条')
  console.log('✓ 加载产线数据:', productionLines.value.length, '条')
}

// 查询
const handleFilter = () => {
  console.log('筛选条件:', filterForm.value)
  ElMessage.success('查询成功')
}

// 重置
const handleReset = () => {
  filterForm.value = {
    line_id: '',
    date_range: [],
    status: ''
  }
  initializeData()
  ElMessage.info('已重置筛选条件')
}

// 查看详情
const handleViewDetail = (row) => {
  selectedTask.value = row
  detailVisible.value = true
}

// 调整
const handleAdjust = (row) => {
  adjustForm.value = {
    task_id: row.task_id,
    planned_start_date: row.planned_start_date,
    planned_end_date: row.planned_end_date,
    line_id: row.line_id,
    priority: row.priority
  }
  adjustVisible.value = true
}

// 保存调整
const handleSaveAdjust = () => {
  // 更新任务数据
  const index = scheduleTasks.value.findIndex(t => t.task_id === adjustForm.value.task_id)
  if (index !== -1) {
    scheduleTasks.value[index] = {
      ...scheduleTasks.value[index],
      planned_start_date: adjustForm.value.planned_start_date,
      planned_end_date: adjustForm.value.planned_end_date,
      line_id: adjustForm.value.line_id,
      priority: adjustForm.value.priority
    }
  }

  adjustVisible.value = false
  ElMessage.success('调整保存成功')
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除任务"${row.task_id}"吗?`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = scheduleTasks.value.findIndex(t => t.task_id === row.task_id)
    if (index !== -1) {
      scheduleTasks.value.splice(index, 1)
      pagination.value.total = scheduleTasks.value.length
    }

    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消
  }
}

// 分页
const handleSizeChange = (val) => {
  pagination.value.pageSize = val
}

const handleCurrentChange = (val) => {
  pagination.value.current = val
}

// 工具函数
const getLineName = (lineId) => {
  if (!productionLines.value || !Array.isArray(productionLines.value)) {
    return lineId || '未知产线'
  }
  const line = productionLines.value.find(l => l.line_id === lineId)
  return line ? line.line_name : lineId
}

const getLineType = (lineId) => {
  if (!productionLines.value || !Array.isArray(productionLines.value)) {
    return '未知'
  }
  const line = productionLines.value.find(l => l.line_id === lineId)
  const map = {
    'LINE001': 'primary',
    'LINE002': 'success',
    'LINE003': 'warning',
    'LINE004': 'info'
  }
  return map[lineId] || 'info'
}

const getStatusType = (status) => {
  const map = {
    '已排定': 'primary',
    '已揉单': 'success'
  }
  return map[status] || 'info'
}

// 生命周期
onMounted(() => {
  initializeData()
})
</script>

<style scoped>
.coarse-list {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
