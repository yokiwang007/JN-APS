<template>
  <div class="fulfillment-slots">
    <el-card class="toolbar-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-button type="primary" :icon="Plus" @click="handleAddSlot">
            新增货位
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="Refresh" @click="loadData">
            刷新
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="Download" @click="handleExport">
            导出货位
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="warning" :icon="Clock" @click="handleShowOverdue">
            超期预警
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input v-model="filterForm.keyword" placeholder="货位号/订单号" clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterForm.area" placeholder="区域" clearable style="width: 100%">
            <el-option label="全部区域" value="" />
            <el-option label="A区" value="A" />
            <el-option label="B区" value="B" />
            <el-option label="C区" value="C" />
            <el-option label="D区" value="D" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterForm.status" placeholder="状态" clearable style="width: 100%">
            <el-option label="全部状态" value="" />
            <el-option label="空闲" value="空闲" />
            <el-option label="占用" value="占用" />
            <el-option label="锁定" value="锁定" />
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
          <span>齐套货位管理</span>
          <div>
            <el-tag type="info">共 {{ slotList.length }} 个货位</el-tag>
            <el-tag type="success" style="margin-left: 10px;">空闲: {{ freeSlots }}</el-tag>
            <el-tag type="warning" style="margin-left: 10px;">占用: {{ occupiedSlots }}</el-tag>
          </div>
        </div>
      </template>

      <el-table :data="slotList" stripe size="default">
        <el-table-column prop="slot_id" label="货位号" width="130" fixed />
        <el-table-column prop="area" label="区域" width="80">
          <template #default="{ row }">
            <el-tag size="small">{{ row.area }}区</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shelf_id" label="货架号" width="100" />
        <el-table-column prop="position" label="位置" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="order_id" label="订单号" width="120" />
        <el-table-column prop="customer_name" label="客户名称" width="120" />
        <el-table-column prop="part_count" label="部件数" width="80" align="center" />
        <el-table-column prop="allocation_date" label="分配日期" width="110">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.allocation_date }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="due_date" label="交期" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="getDueDateType(row.due_date)">
              {{ row.due_date }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="occupancy_days" label="占用天数" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.occupancy_days > 7 ? 'danger' : 'info'">
              {{ row.occupancy_days }}天
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button 
              v-if="row.status === '占用'"
              type="success" 
              size="small" 
              link 
              @click="handleRelease(row)"
            >
              释放
            </el-button>
            <el-button 
              v-if="row.status === '占用'"
              type="warning" 
              size="small" 
              link 
              @click="handleLock(row)"
            >
              锁定
            </el-button>
            <el-button 
              v-if="row.status === '锁定'"
              type="success" 
              size="small" 
              link 
              @click="handleUnlock(row)"
            >
              解锁
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

    <!-- 超期预警对话框 -->
    <el-dialog v-model="overdueVisible" title="超期预警" width="900px">
      <el-alert
        title="以下货位占用时间已超过7天,需要及时处理"
        type="error"
        :closable="false"
        style="margin-bottom: 20px"
      />
      <el-table :data="overdueSlots" stripe>
        <el-table-column prop="slot_id" label="货位号" width="130" />
        <el-table-column prop="area" label="区域" width="80">
          <template #default="{ row }">
            <el-tag>{{ row.area }}区</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="order_id" label="订单号" width="120" />
        <el-table-column prop="customer_name" label="客户名称" width="120" />
        <el-table-column prop="allocation_date" label="分配日期" width="110" />
        <el-table-column prop="occupancy_days" label="占用天数" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="danger">{{ row.occupancy_days }}天</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleRelease(row)">
              立即释放
            </el-button>
            <el-button type="warning" size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="overdueVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 货位详情对话框 -->
    <el-dialog v-model="detailVisible" title="货位详情" width="600px">
      <el-descriptions v-if="selectedSlot" :column="2" border>
        <el-descriptions-item label="货位号" :span="1">
          {{ selectedSlot.slot_id }}
        </el-descriptions-item>
        <el-descriptions-item label="区域" :span="1">
          {{ selectedSlot.area }}区
        </el-descriptions-item>
        <el-descriptions-item label="货架号" :span="1">
          {{ selectedSlot.shelf_id }}
        </el-descriptions-item>
        <el-descriptions-item label="位置" :span="1">
          {{ selectedSlot.position }}
        </el-descriptions-item>
        <el-descriptions-item label="状态" :span="2">
          <el-tag :type="getStatusType(selectedSlot.status)">
            {{ selectedSlot.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单号" :span="1">
          {{ selectedSlot.order_id || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="客户名称" :span="1">
          {{ selectedSlot.customer_name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="部件数" :span="1">
          {{ selectedSlot.part_count || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="分配日期" :span="1">
          <el-tag type="info">{{ selectedSlot.allocation_date || '-' }}</el-tag>
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
import { Plus, Refresh, Download, Clock, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { initializeExtendedData } from '@/utils/mock-extended.js'

// 响应式数据
const slotList = ref([])
const overdueSlots = ref([])
const selectedSlot = ref(null)
const overdueVisible = ref(false)
const detailVisible = ref(false)

// 筛选表单
const filterForm = ref({
  keyword: '',
  area: '',
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
  console.log('🔄 开始加载齐套货位数据...')

  const data = initializeExtendedData()
  console.log('📦 initializeExtendedData 返回的数据:', Object.keys(data))
  console.log('  - mes_sorting_slots:', data.mes_sorting_slots?.length || 0, '条')
  console.log('  - erp_sales_orders:', data.erp_sales_orders?.length || 0, '条')
  console.log('  - mes_production_orders:', data.mes_production_orders?.length || 0, '条')

  // 齐套货位数据(直接使用生成的数据,已与订单和生产工单关联)
  slotList.value = (data.mes_sorting_slots || []).map(slot => {
    // 获取该货位对应的订单
    const order = (data.erp_sales_orders || []).find(o => o.order_id === slot.order_id)

    // 获取该货位对应的生产工单
    const workOrder = (data.mes_production_orders || []).find(wo => wo.work_order_id === slot.work_order_id)

    // 计算占用天数
    const today = new Date()
    const allocationDate = new Date(slot.allocation_date)
    const occupancyDays = Math.max(0, Math.floor((today - allocationDate) / (1000 * 60 * 60 * 24)))

    // 根据齐套状态确定货位状态
    let status = '空闲'
    if (slot.sort_status === '部分齐套' || slot.sort_status === '已齐套') {
      status = '占用'
    }

    return {
      ...slot,
      status: status,
      order_id: slot.order_id,
      customer_name: order?.customer_name || '',
      part_count: slot.total_parts,
      allocation_date: slot.allocation_date,
      due_date: slot.due_date,
      occupancy_days: occupancyDays,
      work_order_id: slot.work_order_id
    }
  })

  // 超期货位(占用超过7天)
  overdueSlots.value = slotList.value
    .filter(slot => slot.status !== '空闲' && slot.occupancy_days > 7)

  pagination.value.total = slotList.value.length

  console.log('✓ 加载齐套货位数据:', slotList.value.length, '个')
}

// 计算属性
const freeSlots = computed(() => {
  return slotList.value.filter(s => s.status === '空闲').length
})

const occupiedSlots = computed(() => {
  return slotList.value.filter(s => s.status === '占用').length
})

// 事件处理
const handleAddSlot = () => {
  ElMessage.info('新增货位功能开发中...')
}

const handleFilter = () => {
  ElMessage.success('查询成功')
}

const handleReset = () => {
  filterForm.value = {
    keyword: '',
    area: '',
    status: ''
  }
  loadData()
}

const handleViewDetail = (slot) => {
  selectedSlot.value = slot
  detailVisible.value = true
}

const handleRelease = async (slot) => {
  try {
    await ElMessageBox.confirm(`确定要释放货位 ${slot.slot_id} 吗?`, '确认释放', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    slot.status = '空闲'
    slot.order_id = ''
    slot.customer_name = ''
    slot.part_count = 0
    slot.allocation_date = ''
    slot.occupancy_days = 0

    ElMessage.success('货位释放成功')
  } catch (error) {
    // 用户取消
  }
}

const handleLock = (slot) => {
  slot.status = '锁定'
  ElMessage.success(`货位 ${slot.slot_id} 已锁定`)
}

const handleUnlock = (slot) => {
  slot.status = '占用'
  ElMessage.success(`货位 ${slot.slot_id} 已解锁`)
}

const handleDelete = async (slot) => {
  try {
    await ElMessageBox.confirm(`确定要删除货位 ${slot.slot_id} 吗?`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const index = slotList.value.findIndex(s => s.slot_id === slot.slot_id)
    if (index !== -1) {
      slotList.value.splice(index, 1)
      pagination.value.total = slotList.value.length
    }

    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消
  }
}

const handleShowOverdue = () => {
  if (overdueSlots.value.length === 0) {
    ElMessage.info('暂无超期货位')
    return
  }
  overdueVisible.value = true
}

const handleExport = () => {
  ElMessage.success('货位导出中...')
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
    '空闲': 'success',
    '占用': 'warning',
    '锁定': 'danger'
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

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.fulfillment-slots {
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
