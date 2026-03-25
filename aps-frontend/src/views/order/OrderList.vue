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

        <el-table-column prop="createdAt" label="订单日期" width="120">
          <template #default="{ row }">
            {{ row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="customerName" label="客户名称" width="120" />
        
        <el-table-column prop="productType" label="产品类型" width="100" />

        <el-table-column prop="orderType" label="订单类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getOrderTypeColor(row.orderType)">{{ row.orderType }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="deliveryDate" label="交货期" width="120" />
        
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
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDetail(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button 
              type="success" 
              link 
              @click="handleSinglePreprocess(row)"
              v-if="row.status === '待审核'"
            >
              <el-icon><VideoPlay /></el-icon>
              预处理
            </el-button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Refresh, VideoPlay, View } from '@element-plus/icons-vue'
import { useOrderStore } from '../../stores/order'

const router = useRouter()
const orderStore = useOrderStore()

const searchForm = ref({
  status: '',
  orderType: '',
  priority: '',
  customerName: ''
})

const selectedOrders = ref([])

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
  const types = {
    '标准订单': 'info',
    '加急订单': 'warning',
    '补件订单': 'danger'
  }
  return types[orderType] || 'info'
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
    orderType: '',
    priority: '',
    customerName: ''
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

// 分页
const handleSizeChange = (size) => {
  orderStore.updatePagination({ pageSize: size })
  orderStore.fetchOrders()
}

const handleCurrentChange = (page) => {
  orderStore.updatePagination({ page })
  orderStore.fetchOrders()
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
