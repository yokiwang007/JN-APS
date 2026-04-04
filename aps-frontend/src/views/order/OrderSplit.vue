<template>
  <div class="order-split">
    <el-card class="operation-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-button type="primary" :icon="Refresh" @click="handleSyncErpOrders">
            同步ERP订单
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-select v-model="selectedSplitRule" placeholder="选择拆单规则" style="width: 100%">
            <el-option label="默认规则" value="default" />
            <el-option label="优先利用率规则" value="utilization" />
            <el-option label="优先交期规则" value="delivery" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button type="success" :icon="Operation" @click="handleExecuteSplit" :disabled="!hasSelectedOrders">
            执行拆解
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="Setting" @click="goToSplitRules">
            拆单规则配置
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 左侧: 待拆解订单列表 -->
      <el-col :span="10">
        <el-card class="list-card">
          <template #header>
            <div class="card-header">
              <span>待拆解订单列表</span>
              <el-checkbox v-model="selectAll" @change="handleSelectAll">
                全选
              </el-checkbox>
            </div>
          </template>
          <el-table
            ref="orderTableRef"
            :data="pendingOrders"
            style="width: 100%"
            size="small"
            max-height="600"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="order_id" label="订单号" width="120" />
            <el-table-column prop="customer_name" label="客户" width="80" />
            <el-table-column prop="due_date" label="交期" width="90">
              <template #default="scope">
                <el-tag size="small" :type="getDueDateType(scope.row.due_date)">
                  {{ scope.row.due_date }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="scope">
                <el-tag size="small" type="info">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template #default="scope">
                <el-button
                  type="primary"
                  size="small"
                  link
                  @click="handleViewOrderDetail(scope.row)"
                >
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧: 拆解结果 -->
      <el-col :span="14">
        <el-card class="result-card">
          <template #header>
            <div class="card-header">
              <span>生产子订单列表</span>
              <el-tag type="success">共 {{ productionOrders.length }} 个子订单</el-tag>
            </div>
          </template>
          <div v-if="productionOrders.length === 0" class="empty-result">
            <el-empty description="请先选择订单并执行拆解" />
          </div>
          <div v-else class="production-orders-list">
            <div v-for="po in productionOrders" :key="po.production_order_id" class="po-item">
              <div class="po-header">
                <span class="po-id">{{ po.production_order_id }}</span>
                <el-tag :type="getProcessRouteType(po.process_route)" size="small">
                  {{ po.process_route }}
                </el-tag>
                <span class="po-count">{{ po.total_part_count }}件</span>
              </div>
              <div class="po-details">
                <div class="po-detail-item">
                  <span class="label">材质:</span>
                  <span class="value">{{ po.material }}</span>
                </div>
                <div class="po-detail-item">
                  <span class="label">厚度:</span>
                  <span class="value">{{ po.thickness }}mm</span>
                </div>
                <div class="po-detail-item">
                  <span class="label">花色:</span>
                  <span class="value">{{ po.color }}</span>
                </div>
                <div class="po-detail-item">
                  <span class="label">封边:</span>
                  <span class="value">{{ po.edge_banding }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- BOM解析详情 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card class="bom-card">
          <template #header>
            <div class="card-header">
              <span>BOM解析(选中订单的零件明细)</span>
              <el-tag v-if="selectedOrder" type="primary">
                {{ selectedOrder.order_id }} - {{ selectedOrder.customer_name }}
              </el-tag>
            </div>
          </template>
          <div v-if="!selectedOrder" class="empty-result">
            <el-empty description="请选择订单查看BOM明细" />
          </div>
          <el-table
            v-else
            :data="bomParts"
            style="width: 100%"
            size="small"
            max-height="400"
          >
            <el-table-column prop="part_id" label="零件号" width="150" />
            <el-table-column prop="part_type" label="类型" width="100" />
            <el-table-column prop="length" label="长度" width="80">
              <template #default="scope">
                {{ scope.row.length ? scope.row.length + 'mm' : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="width" label="宽度" width="80">
              <template #default="scope">
                {{ scope.row.width ? scope.row.width + 'mm' : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="thickness" label="厚度" width="80">
              <template #default="scope">
                {{ scope.row.thickness ? scope.row.thickness + 'mm' : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="material" label="材质" width="100" />
            <el-table-column prop="color" label="花色" width="100" />
            <el-table-column prop="edge_banding" label="封边" width="120" />
            <el-table-column prop="process_route" label="工艺路线" width="120">
              <template #default="scope">
                <el-tag size="small" :type="getProcessRouteType(scope.row.process_route)">
                  {{ scope.row.process_route }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="orderDetailVisible"
      title="订单详情"
      width="800px"
    >
      <el-descriptions v-if="selectedOrderDetail" :column="2" border>
        <el-descriptions-item label="订单号">{{ selectedOrderDetail.order_id }}</el-descriptions-item>
        <el-descriptions-item label="客户名称">{{ selectedOrderDetail.customer_name }}</el-descriptions-item>
        <el-descriptions-item label="承诺交期">{{ selectedOrderDetail.due_date }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">¥{{ selectedOrderDetail.total_amount }}</el-descriptions-item>
        <el-descriptions-item label="优先级">
          {{ selectedOrderDetail.priority_label || selectedOrderDetail.priority }}
        </el-descriptions-item>
        <el-descriptions-item label="齐套规则">{{ selectedOrderDetail.fulfillment_rule === 'full' ? '全齐套' : '可分批发货' }}</el-descriptions-item>
        <el-descriptions-item label="订单状态" :span="2">
          <el-tag :type="getOrderStatusType(selectedOrderDetail.status)">
            {{ selectedOrderDetail.status }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="orderDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Refresh, Operation, Setting } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { buildOrderSplitContext, generateApsProductionOrders } from '@/utils/mock-extended.js'
import { readMockStore, writeMockStore } from '@/utils/api.js'

const router = useRouter()

// 响应式数据
const pendingOrders = ref([])
const productionOrders = ref([])
const bomParts = ref([])
const selectedOrders = ref([])
const selectedOrder = ref(null)
const selectedOrderDetail = ref(null)
const selectedSplitRule = ref('default')
const selectAll = ref(false)
const orderDetailVisible = ref(false)
const orderTableRef = ref(null)

// 计算属性
const hasSelectedOrders = computed(() => selectedOrders.value.length > 0)

// 待拆解列表与主数据 orders 同源（仅展示 status=待审核 映射后的「待拆解」）
const initializeData = () => {
  const { erpSalesOrders } = buildOrderSplitContext()
  pendingOrders.value = erpSalesOrders.filter((order) => order.status === '待拆解').slice(0, 20)
}

// 同步ERP订单
const handleSyncErpOrders = async () => {
  try {
    await ElMessageBox.confirm('确定要从ERP系统同步订单吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })

    ElMessage.info('正在同步ERP订单...')

    // 模拟同步过程
    setTimeout(() => {
      ElMessage.success('同步成功,新增 5 个订单')
      initializeData()
    }, 1500)
  } catch (error) {
    // 用户取消
  }
}

// 执行拆解
const handleExecuteSplit = async () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要拆解的订单')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要对选中的 ${selectedOrders.value.length} 个订单执行拆解吗?`,
      '确认拆解',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    ElMessage.info('正在执行订单拆解...')

    // 基于主数据板件生成子订单，并回写主订单状态为「待排产」（与列表页数据流一致）
    setTimeout(() => {
      const ctx = buildOrderSplitContext()
      const selected = [...selectedOrders.value]
      productionOrders.value = generateApsProductionOrders(selected, ctx.cadBomParts)

      if (selected.length === 1) {
        bomParts.value = ctx.cadBomParts
          .filter((p) => p.order_id === selected[0].order_id)
          .slice(0, 50)
      }

      const store = readMockStore()
      selected.forEach((sel) => {
        const o = store.orders.find((x) => x.orderNo === sel.order_id)
        if (o) {
          o.status = '待排产'
          o.updatedAt = new Date().toISOString()
        }
      })
      writeMockStore(store)

      ElMessage.success(`拆解完成，共生成 ${productionOrders.value.length} 个生产子订单；主数据订单已更新为「待排产」`)

      orderTableRef.value?.clearSelection()
      initializeData()
    }, 1500)
  } catch (error) {
    // 用户取消
  }
}

// 全选
const handleSelectAll = (val) => {
  if (val) {
    orderTableRef.value?.toggleAllSelection()
  } else {
    orderTableRef.value?.clearSelection()
  }
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedOrders.value = selection

  // 如果只选中了一个订单,显示其BOM明细
  if (selection.length === 1) {
    selectedOrder.value = selection[0]
    loadBomParts(selection[0])
  } else {
    selectedOrder.value = null
    bomParts.value = []
  }
}

// 加载BOM零件明细（与订单详情中的板件同源）
const loadBomParts = (order) => {
  const { cadBomParts } = buildOrderSplitContext()
  bomParts.value = cadBomParts.filter((part) => part.order_id === order.order_id).slice(0, 50)
}

// 查看订单详情
const handleViewOrderDetail = (order) => {
  selectedOrderDetail.value = order
  orderDetailVisible.value = true
}

// 跳转到拆单规则配置
const goToSplitRules = () => {
  router.push('/order/split-rules')
}

// 工具函数
const getDueDateType = (date) => {
  const dueDate = new Date(date)
  const today = new Date()
  const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))

  if (daysDiff < 0) return 'danger'
  if (daysDiff <= 3) return 'warning'
  if (daysDiff <= 7) return 'info'
  return 'success'
}

const getProcessRouteType = (route) => {
  const map = {
    '标准柜体线': 'primary',
    '吸塑门板线': 'success',
    '背板线': 'warning',
    '外协采购': 'info'
  }
  return map[route] || 'info'
}

const getOrderStatusType = (status) => {
  const map = {
    '待拆解': 'info',
    '已拆解': 'primary',
    '已排程': 'success',
    '生产中': 'warning',
    '已完成': 'success'
  }
  return map[status] || 'info'
}

// 生命周期
onMounted(() => {
  initializeData()
})
</script>

<style scoped>
.order-split {
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

.result-card {
  margin-bottom: 20px;
}

.empty-result {
  padding: 40px 0;
}

.production-orders-list {
  max-height: 600px;
  overflow-y: auto;
}

.po-item {
  padding: 15px;
  margin-bottom: 10px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.3s;
}

.po-item:hover {
  border-color: #409EFF;
  background: #ecf5ff;
}

.po-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.po-id {
  font-weight: 600;
  margin-right: 10px;
}

.po-count {
  margin-left: auto;
  color: #909399;
}

.po-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.po-detail-item {
  display: flex;
  align-items: center;
}

.po-detail-item .label {
  color: #909399;
  margin-right: 8px;
  font-size: 12px;
}

.po-detail-item .value {
  color: #303133;
  font-size: 13px;
}

.bom-card {
  margin-bottom: 20px;
}
</style>
