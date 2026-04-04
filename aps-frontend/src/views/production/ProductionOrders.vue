<template>
  <div class="production-orders">
    <el-card class="toolbar-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-button type="primary" :icon="Plus" @click="handleCreateOrder">
            新建工单
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="Upload" @click="handleImport">
            批量导入
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="Download" @click="handleExport">
            导出工单
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="Refresh" @click="loadData">
            刷新
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input v-model="filterForm.keyword" placeholder="工单号/订单号" clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
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
          <el-select v-model="filterForm.status" placeholder="状态" clearable style="width: 100%">
            <el-option label="全部状态" value="" />
            <el-option label="待下发" value="待下发" />
            <el-option label="生产中" value="生产中" />
            <el-option label="已完成" value="已完成" />
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
          <span>生产工单列表</span>
          <el-tag type="info">共 {{ productionOrderList.length }} 个工单</el-tag>
        </div>
      </template>

      <el-table :data="productionOrderList" stripe size="default">
        <el-table-column prop="work_order_id" label="工单号" width="130" fixed />
        <el-table-column prop="batch_id" label="批次号" width="130" />
        <el-table-column prop="order_id" label="订单号" width="120" />
        <el-table-column prop="line_id" label="产线" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getLineName(row.line_id) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="planned_start_date" label="计划开工" width="110">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.planned_start_date }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="planned_end_date" label="计划完工" width="110">
          <template #default="{ row }">
            <el-tag size="small" type="success">{{ row.planned_end_date }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="part_count" label="部件数" width="80" align="center" />
        <el-table-column prop="work_order_status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.work_order_status)">
              {{ row.work_order_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :color="getProgressColor(row.progress)"
              :stroke-width="12"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button type="success" size="small" link @click="handleIssue(row)">
              下发
            </el-button>
            <el-button type="warning" size="small" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" link @click="handleDelete(row)">
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

    <!-- 工单详情对话框 -->
    <el-dialog v-model="detailVisible" title="工单详情" width="900px">
      <el-descriptions v-if="selectedOrder" :column="3" border>
        <el-descriptions-item label="工单号" :span="1">
          {{ selectedOrder.work_order_id }}
        </el-descriptions-item>
        <el-descriptions-item label="批次号" :span="1">
          {{ selectedOrder.batch_id }}
        </el-descriptions-item>
        <el-descriptions-item label="订单号" :span="1">
          {{ selectedOrder.order_id }}
        </el-descriptions-item>
        <el-descriptions-item label="产线" :span="1">
          {{ getLineName(selectedOrder.line_id) }}
        </el-descriptions-item>
        <el-descriptions-item label="计划开工" :span="1">
          <el-tag type="info">{{ selectedOrder.planned_start_date }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="计划完工" :span="1">
          <el-tag type="success">{{ selectedOrder.planned_end_date }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="部件数" :span="1">
          {{ selectedOrder.part_count }}
        </el-descriptions-item>
        <el-descriptions-item label="状态" :span="2">
          <el-tag :type="getStatusType(selectedOrder.work_order_status)">
            {{ selectedOrder.work_order_status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="进度" :span="3">
          <el-progress
            :percentage="selectedOrder.progress"
            :color="getProgressColor(selectedOrder.progress)"
            :stroke-width="12"
          />
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">工序详情</el-divider>
      <el-table :data="selectedOrderProcesses" stripe size="small">
        <el-table-column prop="process_name" label="工序名称" width="120" />
        <el-table-column prop="equipment_id" label="设备" width="120" />
        <el-table-column prop="planned_start_time" label="计划开始" width="160" />
        <el-table-column prop="planned_end_time" label="计划结束" width="160" />
        <el-table-column prop="actual_start_time" label="实际开始" width="160" />
        <el-table-column prop="actual_end_time" label="实际结束" width="160" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getProcessStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleIssue(selectedOrder)">下发</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Upload, Download, Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { initializeExtendedData } from '@/utils/mock-extended.js'

// 响应式数据
const productionLines = ref([])
const productionOrderList = ref([])
const selectedOrder = ref(null)
const selectedOrderProcesses = ref([])
const detailVisible = ref(false)

// 筛选表单
const filterForm = ref({
  keyword: '',
  line_id: '',
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
  console.log('🔄 开始加载生产工单数据...')

  const data = initializeExtendedData()
  console.log('📦 initializeExtendedData 返回的数据:', Object.keys(data))
  console.log('  - sys_work_centers:', data.sys_work_centers?.length || 0, '条')
  console.log('  - mes_production_orders:', data.mes_production_orders?.length || 0, '条')
  console.log('  - aps_merge_batches:', data.aps_merge_batches?.length || 0, '条')
  console.log('  - mes_wip_tracking:', data.mes_wip_tracking?.length || 0, '条')

  // 产线数据
  productionLines.value = data.sys_work_centers || []
  console.log('✅ 产线数据已加载:', productionLines.value.length, '条')

  // 生产工单数据(直接使用生成的数据,已与批次关联)
  productionOrderList.value = (data.mes_production_orders || []).map(wo => {
    // 获取该工单对应的批次
    const batch = (data.aps_merge_batches || []).find(b => b.batch_id === wo.batch_id)

    // 获取该批次包含的工序追踪记录
    const batchTracking = (data.mes_wip_tracking || []).filter(t => t.batch_id === wo.batch_id)

    // 按工序分组
    const processes = {}
    batchTracking.forEach(t => {
      if (!processes[t.process_name]) {
        processes[t.process_name] = []
      }
      processes[t.process_name].push(t)
    })

    // 生成工序列表
    const processList = Object.keys(processes).sort((a, b) => {
      const processOrder = ['开料', '封边', '钻孔', '包装']
      return processOrder.indexOf(a) - processOrder.indexOf(b)
    }).map(processName => {
      const trackings = processes[processName]
      const firstTracking = trackings[0]
      
      return {
        process_name: processName,
        equipment_id: firstTracking.equipment_id,
        planned_start_time: firstTracking.planned_start_time,
        planned_end_time: firstTracking.planned_end_time,
        actual_start_time: firstTracking.actual_start_time,
        actual_end_time: firstTracking.actual_end_time,
        status: firstTracking.status
      }
    })

    return {
      ...wo,
      work_order_status: wo.status,
      processes: processList
    }
  })

  pagination.value.total = productionOrderList.value.length

  console.log('✓ 加载生产工单数据:', productionOrderList.value.length, '个')
}

// 事件处理
const handleCreateOrder = () => {
  ElMessage.info('新建工单功能开发中...')
}

const handleImport = () => {
  ElMessage.info('批量导入功能开发中...')
}

const handleExport = () => {
  ElMessage.success('工单导出中...')
}

const handleFilter = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  filterForm.value = {
    keyword: '',
    line_id: '',
    status: ''
  }
  loadData()
}

const handleViewDetail = (order) => {
  selectedOrder.value = order
  selectedOrderProcesses.value = order.processes || []
  detailVisible.value = true
}

const handleIssue = (order) => {
  ElMessage.success(`工单 ${order.work_order_id} 已下发`)
}

const handleEdit = (order) => {
  ElMessage.info(`编辑工单 ${order.work_order_id}`)
}

const handleDelete = async (order) => {
  try {
    await ElMessageBox.confirm(`确定要删除工单 ${order.work_order_id} 吗?`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const index = productionOrderList.value.findIndex(o => o.work_order_id === order.work_order_id)
    if (index !== -1) {
      productionOrderList.value.splice(index, 1)
      pagination.value.total = productionOrderList.value.length
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

const getStatusType = (status) => {
  const map = {
    '待下发': 'warning',
    '生产中': 'primary',
    '已完成': 'success'
  }
  return map[status] || 'info'
}

const getProgressColor = (progress) => {
  if (progress >= 100) return '#67C23A'
  if (progress >= 50) return '#409EFF'
  return '#E6A23C'
}

const getProcessStatusType = (status) => {
  const map = {
    '已完成': 'success',
    '进行中': 'primary',
    '待开始': 'info'
  }
  return map[status] || 'info'
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.production-orders {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.toolbar-card {
  margin-bottom: 20px;
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
