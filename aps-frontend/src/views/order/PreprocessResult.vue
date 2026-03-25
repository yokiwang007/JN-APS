<template>
  <div class="preprocess-result">
    <el-page-header @back="goBack" content="预处理结果" style="margin-bottom: 20px" />
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">总订单数</div>
          <div class="stat-value">{{ stats.total }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card success">
          <div class="stat-label">合格订单</div>
          <div class="stat-value">{{ stats.qualified }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card danger">
          <div class="stat-label">不合格订单</div>
          <div class="stat-value">{{ stats.unqualified }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">合格率</div>
          <div class="stat-value">{{ stats.rate }}%</div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 标签页 -->
    <el-tabs v-model="activeTab">
      <!-- 合格订单 -->
      <el-tab-pane label="合格订单" name="qualified">
        <el-table :data="qualifiedOrders" stripe>
          <el-table-column prop="orderNo" label="订单号" width="180" />
          <el-table-column prop="customerName" label="客户名称" width="120" />
          <el-table-column prop="productType" label="产品类型" width="100" />
          <el-table-column prop="deliveryDate" label="交货期" width="120" />
          <el-table-column prop="priority" label="优先级" width="100">
            <template #default="{ row }">
              <el-tag :type="getPriorityType(row.priority)">{{ row.priority }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="panelCount" label="板件数" width="100" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewDetail(row.orderNo)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      
      <!-- 不合格订单 -->
      <el-tab-pane label="不合格订单" name="unqualified">
        <el-table :data="unqualifiedOrders" stripe>
          <el-table-column prop="orderNo" label="订单号" width="180" />
          <el-table-column prop="customerName" label="客户名称" width="120" />
          <el-table-column prop="productType" label="产品类型" width="100" />
          <el-table-column prop="orderType" label="订单类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getOrderTypeColor(row.orderType)">{{ row.orderType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="失败原因" width="150">
            <template #default="{ row }">
              <el-tag type="danger">{{ row.reason }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="details" label="详细信息" min-width="200" />
          <el-table-column prop="suggestion" label="处理建议" min-width="200" />
          <el-table-column prop="checkTime" label="检查时间" width="180">
            <template #default="{ row }">
              {{ row.checkTime ? new Date(row.checkTime).toLocaleString() : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewDetail(row.orderNo)">
                查看详情
              </el-button>
              <el-button type="success" link @click="repreprocess(row.orderNo)">
                重新预处理
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useOrderStore } from '../../stores/order'

const router = useRouter()
const orderStore = useOrderStore()

const activeTab = ref('qualified')
const allOrders = ref([])

// 统计数据
const stats = computed(() => {
  const total = allOrders.value.length
  const qualified = qualifiedOrders.value.length
  const unqualified = unqualifiedOrders.value.length
  const rate = total > 0 ? ((qualified / total) * 100).toFixed(1) : 0
  
  return { total, qualified, unqualified, rate }
})

// 合格订单
const qualifiedOrders = computed(() => {
  return allOrders.value.filter(o => o.status === '待排产')
})

// 不合格订单
const unqualifiedOrders = computed(() => {
  return allOrders.value.filter(o => o.status === '审核失败')
})

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

// 返回
const goBack = () => {
  router.back()
}

// 查看详情
const viewDetail = (orderNo) => {
  router.push(`/order/detail/${orderNo}`)
}

// 重新预处理
const repreprocess = async (orderNo) => {
  try {
    await orderStore.executePreprocess({
      orderPoolScope: 'CUSTOM',
      customOrderIds: [orderNo]
    })
    ElMessage.success('重新预处理完成')
    loadData()
  } catch (error) {
    ElMessage.error('预处理失败')
  }
}

// 加载数据
const loadData = async () => {
  // 优先从store的预处理结果中获取数据
  if (orderStore.preprocessResult && orderStore.preprocessResult.unqualifiedOrders) {
    // 合并合格和不合格订单
    const qualifiedOrders = orderStore.orders.filter(o => o.status === '待排产')
    const unqualifiedOrders = orderStore.preprocessResult.unqualifiedOrders

    allOrders.value = [...qualifiedOrders, ...unqualifiedOrders]

    // 如果有不合格订单,自动切换到不合格订单标签页
    if (unqualifiedOrders.length > 0) {
      activeTab.value = 'unqualified'
    }
  } else {
    // 如果没有预处理结果,获取所有订单
    await orderStore.fetchOrders()
    allOrders.value = orderStore.orders
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.preprocess-result {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-card .stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-card .stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
}

.stat-card.success .stat-value {
  color: #67c23a;
}

.stat-card.danger .stat-value {
  color: #f56c6c;
}
</style>
