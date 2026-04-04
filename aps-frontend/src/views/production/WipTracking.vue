<template>
  <div class="wip-tracking">
    <el-card class="toolbar-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-button type="primary" :icon="Plus" @click="handleAddTracking">
            添加追踪
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="Refresh" @click="loadData">
            刷新
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="Download" @click="handleExport">
            导出数据
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="warning" :icon="Clock" @click="handleShowDelayed">
            延期预警
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input v-model="filterForm.keyword" placeholder="工单号/部件号" clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterForm.process_name" placeholder="工序" clearable style="width: 100%">
            <el-option label="全部工序" value="" />
            <el-option label="开料" value="开料" />
            <el-option label="封边" value="封边" />
            <el-option label="钻孔" value="钻孔" />
            <el-option label="包装" value="包装" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterForm.status" placeholder="状态" clearable style="width: 100%">
            <el-option label="全部状态" value="" />
            <el-option label="待开始" value="待开始" />
            <el-option label="进行中" value="进行中" />
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
          <span>在制品追踪</span>
          <div>
            <el-tag type="info">共 {{ wipTrackingList.length }} 条记录</el-tag>
            <el-tag type="primary" style="margin-left: 10px;">进行中: {{ inProgressCount }}</el-tag>
            <el-tag type="warning" style="margin-left: 10px;">待开始: {{ pendingCount }}</el-tag>
          </div>
        </div>
      </template>

      <el-table :data="wipTrackingList" stripe size="default">
        <el-table-column prop="tracking_id" label="追踪号" width="130" fixed />
        <el-table-column prop="work_order_id" label="工单号" width="130" />
        <el-table-column prop="part_id" label="部件号" width="120" />
        <el-table-column prop="process_name" label="工序" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ row.process_name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="equipment_id" label="设备" width="100" />
        <el-table-column prop="planned_start_time" label="计划开始" width="160" />
        <el-table-column prop="actual_start_time" label="实际开始" width="160">
          <template #default="{ row }">
            <span :style="{ color: row.actual_start_time ? '' : '#909399' }">
              {{ row.actual_start_time || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="planned_end_time" label="计划结束" width="160" />
        <el-table-column prop="actual_end_time" label="实际结束" width="160">
          <template #default="{ row }">
            <span :style="{ color: row.actual_end_time ? '' : '#909399' }">
              {{ row.actual_end_time || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作员" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleScanStart(row)">
              扫码开始
            </el-button>
            <el-button type="success" size="small" link @click="handleScanComplete(row)">
              扫码完成
            </el-button>
            <el-button type="warning" size="small" link @click="handleViewDetail(row)">
              详情
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

    <!-- 延期预警对话框 -->
    <el-dialog v-model="delayedVisible" title="延期预警" width="800px">
      <el-alert
        title="以下工序已超过计划完成时间"
        type="error"
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-table :data="delayedTasks" stripe>
        <el-table-column prop="tracking_id" label="追踪号" width="130" />
        <el-table-column prop="work_order_id" label="工单号" width="130" />
        <el-table-column prop="part_id" label="部件号" width="120" />
        <el-table-column prop="process_name" label="工序" width="100" />
        <el-table-column prop="planned_end_time" label="计划结束" width="160">
          <template #default="{ row }">
            <el-tag type="danger">{{ row.planned_end_time }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="delay_hours" label="延期时长" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="danger">{{ row.delay_hours }}h</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleHandleDelayed(row)">
              处理
            </el-button>
            <el-button type="danger" size="small" @click="handleEscalate(row)">
              升级
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="delayedVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Refresh, Download, Clock, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { initializeExtendedData } from '@/utils/mock-extended.js'

// 响应式数据
const wipTrackingList = ref([])
const delayedTasks = ref([])
const delayedVisible = ref(false)

// 筛选表单
const filterForm = ref({
  keyword: '',
  process_name: '',
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
  const data = initializeExtendedData()

  // 在制品追踪数据(直接使用生成的数据,已与生产工单关联)
  wipTrackingList.value = data.mes_wip_tracking.map(tracking => {
    // 获取该追踪记录对应的生产工单
    const workOrder = data.mes_production_orders.find(wo => wo.work_order_id === tracking.work_order_id)
    
    // 获取该追踪记录对应的批次
    const batch = data.aps_merge_batches.find(b => b.batch_id === tracking.batch_id)
    
    // 获取该追踪记录对应的订单
    const order = workOrder ? data.erp_sales_orders.find(o => o.order_id === workOrder.order_id) : null

    return {
      ...tracking,
      work_order_id: tracking.work_order_id,
      batch_id: tracking.batch_id,
      process_name: tracking.process_name,
      equipment_id: tracking.equipment_id,
      planned_start_time: tracking.planned_start_time,
      planned_end_time: tracking.planned_end_time,
      actual_start_time: tracking.actual_start_time,
      actual_end_time: tracking.actual_end_time,
      status: tracking.status,
      operator: tracking.operator,
      // 添加关联信息
      order_id: order?.order_id || '',
      due_date: order?.due_date || ''
    }
  })

  pagination.value.total = wipTrackingList.value.length

  console.log('✓ 加载在制品追踪数据:', wipTrackingList.value.length, '条')
}

// 计算属性
const inProgressCount = computed(() => {
  return wipTrackingList.value.filter(t => t.status === '进行中').length
})

const pendingCount = computed(() => {
  return wipTrackingList.value.filter(t => t.status === '待开始').length
})

// 事件处理
const handleAddTracking = () => {
  ElMessage.info('添加追踪功能开发中...')
}

const handleFilter = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  filterForm.value = {
    keyword: '',
    process_name: '',
    status: ''
  }
  loadData()
}

const handleScanStart = (row) => {
  row.status = '进行中'
  row.actual_start_time = new Date().toISOString()
  ElMessage.success(`工序 ${row.process_name} 已开始`)
}

const handleScanComplete = (row) => {
  row.status = '已完成'
  row.actual_end_time = new Date().toISOString()
  ElMessage.success(`工序 ${row.process_name} 已完成`)
}

const handleViewDetail = (row) => {
  ElMessage.info(`查看追踪 ${row.tracking_id} 详情`)
}

const handleShowDelayed = () => {
  // 筛选延期任务
  const now = new Date()
  delayedTasks.value = wipTrackingList.value
    .filter(task => task.status !== '已完成' && new Date(task.planned_end_time) < now)
    .map(task => ({
      ...task,
      delay_hours: Math.floor((now - new Date(task.planned_end_time)) / (1000 * 60 * 60))
    }))

  if (delayedTasks.value.length === 0) {
    ElMessage.info('暂无延期任务')
    return
  }

  delayedVisible.value = true
}

const handleHandleDelayed = (task) => {
  ElMessage.success(`任务 ${task.tracking_id} 已标记为处理中`)
}

const handleEscalate = (task) => {
  ElMessage.warning(`任务 ${task.tracking_id} 已升级处理`)
}

const handleExport = () => {
  ElMessage.success('数据导出中...')
}

// 分页
const handleSizeChange = (val) => {
  pagination.value.pageSize = val
}

const handleCurrentChange = (val) => {
  pagination.value.current = val
}

// 工具函数
const getStatusType = (status) => {
  const map = {
    '待开始': 'info',
    '进行中': 'primary',
    '已完成': 'success'
  }
  return map[status] || 'info'
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.wip-tracking {
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
