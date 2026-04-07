<template>
  <div class="order-list">
    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="待审核" value="待审核" />
            <el-option label="待排产" value="待排产" />
            <el-option label="已排产" value="已排产" />
            <el-option label="生产中" value="生产中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>

        <el-form-item label="组织">
          <el-select v-model="searchForm.organization" placeholder="请选择" clearable style="width: 150px">
            <el-option label="杰诺销售公司" value="杰诺销售公司" />
            <el-option label="杰诺智造中心" value="杰诺智造中心" />
          </el-select>
        </el-form-item>

        <el-form-item label="单据类型">
          <el-select v-model="searchForm.documentType" placeholder="请选择" clearable style="width: 150px">
            <el-option label="零售订单" value="零售订单" />
            <el-option label="工程订单" value="工程订单" />
            <el-option label="电商订单" value="电商订单" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="订单类型">
          <el-select v-model="searchForm.orderType" placeholder="请选择" clearable style="width: 120px">
            <el-option label="标准订单" value="标准订单" />
            <el-option label="加急订单" value="加急订单" />
            <el-option label="补件订单" value="补件订单" />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级">
          <el-select v-model="searchForm.priority" placeholder="请选择" clearable style="width: 120px">
            <el-option label="普通" value="普通" />
            <el-option label="紧急" value="紧急" />
            <el-option label="特急" value="特急" />
          </el-select>
        </el-form-item>

        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable style="width: 200px" />
        </el-form-item>

        <el-form-item label="销售员">
          <el-input v-model="searchForm.salesman" placeholder="请输入销售员" clearable style="width: 150px" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 操作区域 -->
    <div class="table-area">
      <div class="table-toolbar">
        <el-button type="success" @click="addOrder">
          <el-icon><Plus /></el-icon>
          新增订单
        </el-button>
        <el-button type="primary" @click="handlePreprocess" :disabled="selectedOrders.length === 0">
          <el-icon><VideoPlay /></el-icon>
          批量预处理
        </el-button>
        <el-tag type="info" style="margin-left: 10px">
          已选择 {{ selectedOrders.length }} 条
        </el-tag>
      </div>
      
      <!-- 表格 -->
      <el-table
        :data="orderStore.orders"
        v-loading="orderStore.loading"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="orderNo" label="订单号" width="150" />

        <el-table-column prop="organization" label="组织" width="120" />

        <el-table-column prop="documentType" label="单据类型" width="110" />

        <el-table-column prop="createdAt" label="订单日期" width="120">
          <template #default="{ row }">
            {{ row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="customerName" label="客户名称" width="120" />

        <el-table-column prop="salesman" label="销售员" width="100" />

        <el-table-column prop="creator" label="创建人" width="100" />

        <el-table-column prop="productType" label="产品名称" width="100" />

        <el-table-column prop="orderType" label="订单类型" width="120">
          <template #default="{ row }">
            <span :style="{ color: getOrderTypeColor(row.orderType) }">{{ row.orderType || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="deliveryDate" label="承诺交期" width="120" />
        
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="panelCount" label="板件数" width="100" />
        
        <el-table-column label="操作" width="350" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDetail(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button type="success" link @click="handleEditOrder(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDeleteOrder(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
            <el-button 
              type="warning" 
              link 
              @click="handleSinglePreprocess(row)"
              v-if="row.status === '待审核'"
            >
              <el-icon><VideoPlay /></el-icon>
              预处理
            </el-button>
            <template v-if="row.status === '审核失败'">
              <el-button type="info" link @click="handleMarkPending(row)">
                标记待审核
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="orderStore.pagination.page"
        v-model:page-size="orderStore.pagination.pageSize"
        :total="orderStore.pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </div>

    <!-- 新增/编辑订单对话框 -->
    <el-dialog
      v-model="orderDialogVisible"
      :title="isEditMode ? '编辑订单' : '新增订单'"
      width="800px"
    >
      <el-form :model="orderForm" label-width="120px">
        <el-form-item label="订单号">
          <el-input v-model="orderForm.orderNo" placeholder="留空自动生成" :disabled="isEditMode" />
        </el-form-item>

        <el-form-item label="组织">
          <el-select v-model="orderForm.organization" style="width: 100%">
            <el-option label="杰诺销售公司" value="杰诺销售公司" />
            <el-option label="杰诺智造中心" value="杰诺智造中心" />
          </el-select>
        </el-form-item>

        <el-form-item label="单据类型">
          <el-select v-model="orderForm.documentType" style="width: 100%">
            <el-option label="零售订单" value="零售订单" />
            <el-option label="工程订单" value="工程订单" />
            <el-option label="电商订单" value="电商订单" />
          </el-select>
        </el-form-item>

        <el-form-item label="订单类型">
          <el-select v-model="orderForm.orderType" style="width: 100%">
            <el-option label="标准订单" value="标准订单" />
            <el-option label="加急订单" value="加急订单" />
            <el-option label="补件订单" value="补件订单" />
          </el-select>
        </el-form-item>

        <el-form-item label="客户名称">
          <el-input v-model="orderForm.customerName" placeholder="请输入客户名称" />
        </el-form-item>

        <el-form-item label="销售员">
          <el-input v-model="orderForm.salesman" placeholder="请输入销售员" />
        </el-form-item>

        <el-form-item label="产品名称">
          <el-input v-model="orderForm.productType" placeholder="请输入产品名称" />
        </el-form-item>

        <el-form-item label="承诺交期">
          <el-date-picker
            v-model="orderForm.deliveryDate"
            type="date"
            placeholder="选择交期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="优先级">
          <el-select v-model="orderForm.priority" style="width: 100%">
            <el-option label="普通" value="普通" />
            <el-option label="紧急" value="紧急" />
            <el-option label="特急" value="特急" />
          </el-select>
        </el-form-item>

        <el-form-item label="特殊工艺">
          <el-input v-model="orderForm.specialProcess" placeholder="如无特殊工艺可留空" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="orderForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="orderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveOrder">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, VideoPlay, View, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useOrderStore } from '../../stores/order'
import { getOrders, createOrder, updateOrder, deleteOrder } from '../../utils/api-unified'

const router = useRouter()
const orderStore = useOrderStore()

const searchForm = ref({
  status: '',
  organization: '',
  documentType: '',
  orderType: '',
  priority: '',
  customerName: '',
  salesman: ''
})

const selectedOrders = ref([])
const orderDialogVisible = ref(false)
const isEditMode = ref(false)
const orderForm = ref({})

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    '待审核': 'info',
    '技术审核中': 'warning',
    '齐套检查中': 'warning',
    '待排产': 'primary',
    '已排产': 'success',
    '生产中': 'success',
    '已完成': 'success',
    '已取消': 'danger'
  }
  return types[status] || 'info'
}

// 获取优先级类型
const getPriorityType = (priority) => {
  const types = {
    '普通': 'info',
    '紧急': 'warning',
    '特急': 'danger'
  }
  return types[priority] || 'info'
}

// 获取订单类型颜色
const getOrderTypeColor = (orderType) => {
  const colors = {
    '标准订单': '#409EFF',
    '加急订单': '#E6A23C',
    '补件订单': '#F56C6C'
  }
  return colors[orderType] || '#909399'
}

// 搜索
const handleSearch = () => {
  orderStore.updateFilters(searchForm.value)
  orderStore.fetchOrders()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    status: '',
    organization: '',
    documentType: '',
    orderType: '',
    priority: '',
    customerName: '',
    salesman: ''
  }
  orderStore.updateFilters(searchForm.value)
  orderStore.fetchOrders()
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedOrders.value = selection
}

// 批量预处理
const handlePreprocess = async () => {
  const orderIds = selectedOrders.value
    .filter(o => o.status === '待审核')
    .map(o => o.orderNo)
  
  if (orderIds.length === 0) {
    ElMessage.warning('请选择待审核的订单')
    return
  }
  
  try {
    const result = await orderStore.executePreprocess({
      orderPoolScope: 'CUSTOM',
      customOrderIds: orderIds
    })
    
    ElMessage.success(`预处理完成: 合格${result.qualifiedOrderCount}个, 不合格${result.unqualifiedOrderCount}个`)
    
    // 跳转到预处理结果页
    router.push('/order/preprocess-result')
  } catch (error) {
    ElMessage.error('预处理失败')
  }
}

// 单个预处理
const handleSinglePreprocess = async (row) => {
  try {
    const result = await orderStore.executePreprocess({
      orderPoolScope: 'CUSTOM',
      customOrderIds: [row.orderNo]
    })
    
    ElMessage.success(`预处理完成: 合格${result.qualifiedOrderCount}个, 不合格${result.unqualifiedOrderCount}个`)
    orderStore.fetchOrders()
  } catch (error) {
    ElMessage.error('预处理失败')
  }
}

// 查看详情
const handleViewDetail = (row) => {
  router.push(`/order/detail/${row.orderNo}`)
}

// 标记为待审核
const handleMarkPending = async (row) => {
  try {
    const storageKey = 'aps_mock_data'
    const storedData = localStorage.getItem(storageKey)
    if (storedData) {
      const data = JSON.parse(storedData)
      const order = data.orders.find(o => o.orderNo === row.orderNo)
      if (order) {
        order.status = '待审核'
        localStorage.setItem(storageKey, JSON.stringify(data))
        ElMessage.success('订单已标记为待审核状态')
        orderStore.fetchOrders()
      }
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 取消订单
const handleCancelOrder = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消订单 ${row.orderNo} 吗？取消后将无法恢复。`,
      '取消订单',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const storageKey = 'aps_mock_data'
    const storedData = localStorage.getItem(storageKey)
    if (storedData) {
      const data = JSON.parse(storedData)
      const order = data.orders.find(o => o.orderNo === row.orderNo)
      if (order) {
        order.status = '已取消'
        localStorage.setItem(storageKey, JSON.stringify(data))
        ElMessage.success('订单已取消')
        orderStore.fetchOrders()
      }
    }
  } catch (error) {
    // 用户取消操作
  }
}

// 分页
const handleSizeChange = (size) => {
  orderStore.updatePagination({ pageSize: size })
  orderStore.fetchOrders()
}

const handleCurrentChange = (page) => {
  orderStore.updatePagination({ page })
  orderStore.fetchOrders()
}

// 新增订单
const addOrder = () => {
  isEditMode.value = false
  orderForm.value = {
    orderNo: '',
    organization: '杰诺销售公司',
    documentType: '零售订单',
    orderType: '标准订单',
    customerName: '',
    salesman: '',
    productType: '',
    deliveryDate: '',
    priority: '普通',
    specialProcess: '',
    remark: ''
  }
  orderDialogVisible.value = true
}

// 编辑订单
const handleEditOrder = (row) => {
  isEditMode.value = true
  orderForm.value = { ...row }
  orderDialogVisible.value = true
}

// 保存订单
const saveOrder = async () => {
  try {
    let result
    if (isEditMode.value) {
      result = await updateOrder(orderForm.value.orderNo, orderForm.value)
    } else {
      result = await createOrder(orderForm.value)
    }

    // 兼容V1和V2响应格式
    if (result.code === 'SUCCESS' || result.success === true) {
      ElMessage.success(result.message || (isEditMode.value ? '更新成功' : '创建成功'))
      orderDialogVisible.value = false
      orderStore.fetchOrders()
    } else {
      ElMessage.error(result.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error(isEditMode.value ? '更新失败' : '创建失败')
  }
}

// 删除订单
const handleDeleteOrder = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除订单"${row.orderNo} - ${row.customerName}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const result = await deleteOrder(row.orderNo)
    // 兼容V1和V2响应格式
    if (result.code === 'SUCCESS' || result.success === true) {
      ElMessage.success(result.message || '删除成功')
      orderStore.fetchOrders()
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 初始化
onMounted(() => {
  orderStore.fetchOrders()
})
</script>

<style scoped>
.order-list {
  height: 100%;
}

.search-area {
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.table-area {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.table-toolbar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}
</style>
