<template>
  <div class="schedule-batches">
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
            <el-option label="待排程" value="待排程" />
            <el-option label="已排程" value="已排程" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="batch-card">
      <template #header>
        <div class="card-header">
          <span>待排程批次</span>
          <div>
            <el-tag type="info">共 {{ filteredBatches.length }} 个批次</el-tag>
            <el-button type="primary" size="small" style="margin-left: 10px;" @click="handleScheduleBatch">
              批量排程
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="filteredBatches"
        @selection-change="handleSelectionChange"
        stripe
        size="default"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="batch_id" label="批次号" width="130" fixed />
        <el-table-column prop="line_id" label="产线" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getLineName(row.line_id) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="planned_date" label="计划日期" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.planned_date }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="order_count" label="订单数" width="80" align="center" />
        <el-table-column prop="part_count" label="部件数" width="80" align="center" />
        <el-table-column prop="utilization" label="利用率" width="120" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="row.utilization"
              :color="getUtilizationColor(row.utilization)"
              :stroke-width="12"
            />
          </template>
        </el-table-column>
        <el-table-column prop="material_info" label="材质信息" width="200" show-overflow-tooltip />
        <el-table-column prop="thickness" label="厚度" width="80" align="center">
          <template #default="{ row }">
            {{ row.thickness }}mm
          </template>
        </el-table-column>
        <el-table-column label="订单概览" width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.order_ids?.join(', ') }}
          </template>
        </el-table-column>
        <el-table-column prop="batch_status" label="批次状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.batch_status)">
              {{ row.batch_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button type="success" size="small" link @click="handleOptimize(row)">
              排程优化
            </el-button>
            <el-button type="warning" size="small" link @click="handleAdjust(row)">
              调整
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

    <!-- 批次详情对话框 -->
    <el-dialog v-model="detailVisible" title="批次详情" width="900px">
      <el-descriptions v-if="selectedBatch" :column="3" border>
        <el-descriptions-item label="批次号" :span="1">
          {{ selectedBatch.batch_id }}
        </el-descriptions-item>
        <el-descriptions-item label="产线" :span="1">
          {{ getLineName(selectedBatch.line_id) }}
        </el-descriptions-item>
        <el-descriptions-item label="计划日期" :span="1">
          <el-tag type="info">{{ selectedBatch.planned_date }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单数" :span="1">
          {{ selectedBatch.order_count }}
        </el-descriptions-item>
        <el-descriptions-item label="部件数" :span="1">
          {{ selectedBatch.part_count }}
        </el-descriptions-item>
        <el-descriptions-item label="利用率" :span="1">
          <el-progress :percentage="selectedBatch.utilization" :stroke-width="10" />
        </el-descriptions-item>
        <el-descriptions-item label="材质信息" :span="2">
          {{ selectedBatch.material_info }}
        </el-descriptions-item>
        <el-descriptions-item label="厚度" :span="1">
          {{ selectedBatch.thickness }}mm
        </el-descriptions-item>
        <el-descriptions-item label="批次状态" :span="3">
          <el-tag :type="getStatusType(selectedBatch.batch_status)">
            {{ selectedBatch.batch_status }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">包含订单</el-divider>
      <el-table :data="selectedBatchDetails" stripe size="small">
        <el-table-column prop="order_id" label="订单号" width="120" />
        <el-table-column prop="production_order_id" label="子订单" width="120" />
        <el-table-column prop="due_date" label="交期" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="danger">{{ row.due_date }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="part_count" label="部件数" width="80" align="center" />
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-rate
              :model-value="row.priority"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { initializeExtendedData } from '@/utils/mock-extended.js'

// 响应式数据
const productionLines = ref([])
const allBatches = ref([])
const selectedBatches = ref([])
const selectedBatch = ref(null)
const selectedBatchDetails = ref([])
const detailVisible = ref(false)

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
const loadData = () => {
  console.log('🔄 开始加载待排程批次数据...')

  const data = initializeExtendedData()
  console.log('📦 initializeExtendedData 返回的数据:', Object.keys(data))
  console.log('  - sys_work_centers:', data.sys_work_centers?.length || 0, '条')
  console.log('  - aps_merge_batches:', data.aps_merge_batches?.length || 0, '条')
  console.log('  - aps_batch_details:', data.aps_batch_details?.length || 0, '条')

  // 产线数据
  productionLines.value = data.sys_work_centers || []
  console.log('✅ 产线数据已加载:', productionLines.value.length, '条')

  // 批次数据(与上游数据关联)
  allBatches.value = (data.aps_merge_batches || []).map(batch => {
    const details = (data.aps_batch_details || []).filter(d => d.batch_id === batch.batch_id)
    const tasks = details.map(d => (data.aps_schedule_tasks || []).find(t => t.task_id === d.task_id)).filter(Boolean)
    const productionOrders = tasks.map(t => (data.aps_production_orders || []).find(po => po.production_order_id === t.production_order_id)).filter(Boolean)
    const orders = productionOrders.map(po => (data.erp_sales_orders || []).find(o => o.order_id === po.order_id)).filter(Boolean)

    // 计算利用率
    const utilization = Math.floor(Math.random() * 20) + 80

    return {
      ...batch,
      order_count: details.length,
      part_count: tasks.reduce((sum, t) => sum + (t?.part_count || 0), 0),
      utilization: utilization,
      material_info: orders[0]?.material_info || 'E0级实木颗粒板',
      thickness: orders[0]?.thickness || 18,
      order_ids: orders.map(o => o.order_id),
      batch_status: '待排程',
      details: productionOrders.map(po => ({
        order_id: po?.order_id,
        production_order_id: po?.production_order_id,
        due_date: orders.find(o => o.order_id === po?.order_id)?.due_date || '',
        part_count: tasks.find(t => t.production_order_id === po?.production_order_id)?.part_count || 0,
        priority: po?.priority || 3
      }))
    }
  })

  pagination.value.total = allBatches.value.length

  console.log('✓ 加载批次数据:', allBatches.value.length, '个')
}

// 计算属性
const filteredBatches = computed(() => {
  let result = allBatches.value

  // 按产线筛选
  if (filterForm.value.line_id) {
    result = result.filter(batch => batch.line_id === filterForm.value.line_id)
  }

  // 按日期范围筛选
  if (filterForm.value.date_range && filterForm.value.date_range.length === 2) {
    const [start, end] = filterForm.value.date_range
    result = result.filter(batch => {
      const batchDate = new Date(batch.planned_date)
      return batchDate >= start && batchDate <= end
    })
  }

  // 按状态筛选
  if (filterForm.value.status) {
    result = result.filter(batch => batch.batch_status === filterForm.value.status)
  }

  return result
})

// 事件处理
const handleFilter = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  filterForm.value = {
    line_id: '',
    date_range: [],
    status: ''
  }
  loadData()
}

const handleSelectionChange = (selection) => {
  selectedBatches.value = selection
}

const handleScheduleBatch = () => {
  if (selectedBatches.value.length === 0) {
    ElMessage.warning('请先选择要排程的批次')
    return
  }
  ElMessage.success(`已选择 ${selectedBatches.value.length} 个批次进行排程`)
}

const handleViewDetail = (batch) => {
  selectedBatch.value = batch
  selectedBatchDetails.value = batch.details || []
  detailVisible.value = true
}

const handleOptimize = (batch) => {
  ElMessage.success(`批次 ${batch.batch_id} 排程优化中...`)
}

const handleAdjust = (batch) => {
  ElMessage.info(`调整批次 ${batch.batch_id}`)
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

const getUtilizationColor = (utilization) => {
  if (utilization >= 90) return '#67C23A'
  if (utilization >= 80) return '#409EFF'
  return '#E6A23C'
}

const getStatusType = (status) => {
  const map = {
    '待排程': 'warning',
    '已排程': 'success'
  }
  return map[status] || 'info'
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.schedule-batches {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.filter-card {
  margin-bottom: 20px;
}

.batch-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
