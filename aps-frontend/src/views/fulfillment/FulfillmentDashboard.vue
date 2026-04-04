<template>
  <div class="fulfillment-dashboard">
    <el-card class="toolbar-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-button type="primary" :icon="Refresh" @click="loadData">
            刷新
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="Download" @click="handleExport">
            导出报表
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="warning" :icon="Clock" @click="handleShowUrgent">
            紧急订单
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="success" :icon="Check" @click="handleShowCompleted">
            已齐套订单
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 齐套统计 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">待齐套订单</div>
            <div class="stat-value">{{ fulfillmentStats.pending }}</div>
            <div class="stat-trend">
              <el-icon class="stat-icon-warning"><Clock /></el-icon>
              <span>等待齐套</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">齐套中订单</div>
            <div class="stat-value">{{ fulfillmentStats.in_progress }}</div>
            <div class="stat-trend">
              <el-icon class="stat-icon-info"><Loading /></el-icon>
              <span>正在齐套</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">已完成齐套</div>
            <div class="stat-value">{{ fulfillmentStats.completed }}</div>
            <div class="stat-trend">
              <el-icon class="stat-icon-success"><Check /></el-icon>
              <span>可发货</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">齐套率</div>
            <div class="stat-value">{{ fulfillmentStats.rate }}%</div>
            <div class="stat-trend">
              <el-icon class="stat-icon-up"><TrendCharts /></el-icon>
              <span>较上周 +5%</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 齐套进度表格 -->
    <el-card class="progress-card">
      <template #header>
        <div class="card-header">
          <span>齐套进度</span>
          <div>
            <el-tag type="info">共 {{ fulfillmentOrders.length }} 个订单</el-tag>
            <el-radio-group v-model="viewMode" size="small" style="margin-left: 10px;">
              <el-radio-button value="pending">待齐套</el-radio-button>
              <el-radio-button value="in_progress">齐套中</el-radio-button>
              <el-radio-button value="completed">已完成</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <el-table :data="filteredOrders" stripe size="default">
        <el-table-column prop="order_id" label="订单号" width="120" fixed />
        <el-table-column prop="customer_name" label="客户名称" width="120" />
        <el-table-column prop="due_date" label="交期" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="getDueDateType(row.due_date)">
              {{ row.due_date }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fulfillment_status" label="齐套状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.fulfillment_status)">
              {{ row.fulfillment_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="total_parts" label="总部件数" width="100" align="center" />
        <el-table-column prop="completed_parts" label="已完成" width="100" align="center" />
        <el-table-column prop="progress" label="齐套进度" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :color="getProgressColor(row.progress)"
              :stroke-width="12"
            />
          </template>
        </el-table-column>
        <el-table-column prop="slot_id" label="货位" width="100" />
        <el-table-column prop="waiting_days" label="等待天数" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.waiting_days > 3 ? 'danger' : 'info'">
              {{ row.waiting_days }}天
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button 
              v-if="row.fulfillment_status === '待齐套'"
              type="success" 
              size="small" 
              link 
              @click="handleStartFulfillment(row)"
            >
              开始齐套
            </el-button>
            <el-button 
              v-if="row.fulfillment_status === '齐套中'"
              type="success" 
              size="small" 
              link 
              @click="handleCompleteFulfillment(row)"
            >
              完成齐套
            </el-button>
            <el-button 
              v-if="row.fulfillment_status === '已完成'"
              type="warning" 
              size="small" 
              link 
              @click="handleShipment(row)"
            >
              发货
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

    <!-- 紧急订单对话框 -->
    <el-dialog v-model="urgentVisible" title="紧急订单" width="900px">
      <el-alert
        title="以下订单即将到期,需要优先齐套"
        type="warning"
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-table :data="urgentOrders" stripe>
        <el-table-column prop="order_id" label="订单号" width="120" />
        <el-table-column prop="customer_name" label="客户名称" width="120" />
        <el-table-column prop="due_date" label="交期" width="110">
          <template #default="{ row }">
            <el-tag type="danger">{{ row.due_date }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remaining_days" label="剩余天数" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="danger">{{ row.remaining_days }}天</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="齐套进度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="12" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handlePriority(row)">
              优先齐套
            </el-button>
            <el-button type="warning" size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="urgentVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailVisible" title="订单齐套详情" width="900px">
      <el-descriptions v-if="selectedOrder" :column="3" border>
        <el-descriptions-item label="订单号" :span="1">
          {{ selectedOrder.order_id }}
        </el-descriptions-item>
        <el-descriptions-item label="客户名称" :span="1">
          {{ selectedOrder.customer_name }}
        </el-descriptions-item>
        <el-descriptions-item label="交期" :span="1">
          <el-tag type="danger">{{ selectedOrder.due_date }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="齐套状态" :span="1">
          <el-tag :type="getStatusType(selectedOrder.fulfillment_status)">
            {{ selectedOrder.fulfillment_status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="总部件数" :span="1">
          {{ selectedOrder.total_parts }}
        </el-descriptions-item>
        <el-descriptions-item label="已完成" :span="1">
          {{ selectedOrder.completed_parts }}
        </el-descriptions-item>
        <el-descriptions-item label="齐套进度" :span="3">
          <el-progress
            :percentage="selectedOrder.progress"
            :color="getProgressColor(selectedOrder.progress)"
            :stroke-width="12"
          />
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">部件明细</el-divider>
      <el-table :data="selectedOrderParts" stripe size="small">
        <el-table-column prop="part_id" label="部件号" width="120" />
        <el-table-column prop="part_name" label="部件名称" width="150" />
        <el-table-column prop="quantity" label="数量" width="80" align="center" />
        <el-table-column prop="completed_quantity" label="已完成" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getPartStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="slot_id" label="货位" width="100" />
      </el-table>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button 
          v-if="selectedOrder?.fulfillment_status === '待齐套'"
          type="primary" 
          @click="handleStartFulfillment(selectedOrder)"
        >
          开始齐套
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Refresh, Download, Clock, Check, Loading, TrendCharts } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { initializeExtendedData } from '@/utils/mock-extended.js'

// 响应式数据
const fulfillmentOrders = ref([])
const urgentOrders = ref([])
const selectedOrder = ref(null)
const selectedOrderParts = ref([])
const viewMode = ref('pending')
const urgentVisible = ref(false)
const detailVisible = ref(false)

// 齐套统计
const fulfillmentStats = ref({
  pending: 15,
  in_progress: 8,
  completed: 25,
  rate: 85
})

// 分页
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 初始化数据
const loadData = () => {
  console.log('🔄 开始加载齐套看板数据...')

  const data = initializeExtendedData()
  console.log('📦 initializeExtendedData 返回的数据:', Object.keys(data))
  console.log('  - mes_sorting_slots:', data.mes_sorting_slots?.length || 0, '条')
  console.log('  - erp_sales_orders:', data.erp_sales_orders?.length || 0, '条')
  console.log('  - mes_fulfillment_details:', data.mes_fulfillment_details?.length || 0, '条')
  console.log('  - cad_bom_parts:', data.cad_bom_parts?.length || 0, '条')

  // 齐套订单数据(使用齐套货位数据,已与订单和生产工单关联)
  fulfillmentOrders.value = (data.mes_sorting_slots || []).map(slot => {
    // 获取该货位对应的订单
    const order = (data.erp_sales_orders || []).find(o => o.order_id === slot.order_id)

    // 获取该货位对应的齐套明细
    const fulfillmentDetails = (data.mes_fulfillment_details || []).filter(fd => fd.slot_id === slot.slot_id)

    // 获取该订单的零件
    const orderParts = (data.cad_bom_parts || []).filter(p => p.order_id === slot.order_id)

    return {
      order_id: slot.order_id,
      customer_name: order?.customer_name || '',
      due_date: slot.due_date,
      fulfillment_status: slot.sort_status,
      total_parts: slot.total_parts,
      completed_parts: slot.completed_parts,
      progress: slot.completion_rate,
      slot_id: slot.slot_id,
      waiting_days: slot.waiting_days,
      // 部件明细
      parts: fulfillmentDetails.map(fd => {
        const part = orderParts.find(p => p.part_id === fd.part_id)
        return {
          part_id: fd.part_id,
          part_name: part?.part_type || '未知部件',
          quantity: fd.quantity,
          completed_quantity: fd.completed_quantity,
          status: fd.status,
          slot_id: fd.slot_id
        }
      })
    }
  })

  // 紧急订单(3天内到期)
  const today = new Date()
  const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
  urgentOrders.value = fulfillmentOrders.value
    .filter(order => new Date(order.due_date) <= threeDaysLater && order.progress < 100)
    .map(order => ({
      ...order,
      remaining_days: Math.max(0, Math.ceil((new Date(order.due_date) - today) / (1000 * 60 * 60 * 24)))
    }))

  // 更新统计
  fulfillmentStats.value.pending = fulfillmentOrders.value.filter(o => o.fulfillment_status === '待齐套').length
  fulfillmentStats.value.in_progress = fulfillmentOrders.value.filter(o => o.fulfillment_status === '部分齐套').length
  fulfillmentStats.value.completed = fulfillmentOrders.value.filter(o => o.fulfillment_status === '已齐套').length
  const total = fulfillmentOrders.value.length
  fulfillmentStats.value.rate = total > 0 ? Math.round((fulfillmentStats.value.completed / total) * 100) : 0

  pagination.value.total = fulfillmentOrders.value.length

  console.log('✓ 加载齐套订单数据:', fulfillmentOrders.value.length, '个')
}

// 计算属性
const filteredOrders = computed(() => {
  const statusMap = {
    'pending': '待齐套',
    'in_progress': '齐套中',
    'completed': '已完成'
  }
  const targetStatus = statusMap[viewMode.value]
  return fulfillmentOrders.value.filter(order => order.fulfillment_status === targetStatus)
})

// 事件处理
const handleShowUrgent = () => {
  if (urgentOrders.value.length === 0) {
    ElMessage.info('暂无紧急订单')
    return
  }
  urgentVisible.value = true
}

const handleShowCompleted = () => {
  viewMode.value = 'completed'
}

const handlePriority = (order) => {
  ElMessage.success(`订单 ${order.order_id} 已标记为优先齐套`)
}

const handleViewDetail = (order) => {
  selectedOrder.value = order
  selectedOrderParts.value = order.parts || []
  detailVisible.value = true
}

const handleStartFulfillment = (order) => {
  order.fulfillment_status = '齐套中'
  ElMessage.success(`订单 ${order.order_id} 开始齐套`)
}

const handleCompleteFulfillment = (order) => {
  order.fulfillment_status = '已完成'
  order.progress = 100
  order.completed_parts = order.total_parts
  ElMessage.success(`订单 ${order.order_id} 已完成齐套`)
}

const handleShipment = (order) => {
  ElMessage.success(`订单 ${order.order_id} 已发货`)
}

const handleExport = () => {
  ElMessage.success('报表导出中...')
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
    '待齐套': 'warning',
    '齐套中': 'primary',
    '已完成': 'success'
  }
  return map[status] || 'info'
}

const getDueDateType = (dueDate) => {
  const today = new Date()
  const due = new Date(dueDate)
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  
  if (diff <= 0) return 'danger'
  if (diff <= 3) return 'warning'
  return 'success'
}

const getProgressColor = (progress) => {
  if (progress >= 100) return '#67C23A'
  if (progress >= 50) return '#409EFF'
  return '#E6A23C'
}

const getPartStatusType = (status) => {
  const map = {
    '已完成': 'success',
    '齐套中': 'primary',
    '待齐套': 'warning'
  }
  return map[status] || 'info'
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.fulfillment-dashboard {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.toolbar-card {
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-content {
  padding: 10px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-icon-success {
  color: #67C23A;
}

.stat-icon-info {
  color: #409EFF;
}

.stat-icon-warning {
  color: #E6A23C;
}

.stat-icon-up {
  color: #67C23A;
}

.progress-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
