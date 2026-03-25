<template>
  <div class="order-detail">
    <el-page-header @back="goBack" content="订单详情" style="margin-bottom: 20px" />
    
    <div v-loading="orderStore.loading">
      <!-- 基本信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-tag :type="getStatusType(order.status)">{{ order.status }}</el-tag>
          </div>
        </template>
        
        <el-descriptions :column="3" border>
          <el-descriptions-item label="订单号">{{ order.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="客户名称">{{ order.customerName }}</el-descriptions-item>
          <el-descriptions-item label="产品类型">{{ order.productType }}</el-descriptions-item>
          <el-descriptions-item label="交货期">{{ order.deliveryDate }}</el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityType(order.priority)">{{ order.priority }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="工件数">{{ order.panelCount }} 件</el-descriptions-item>
          <el-descriptions-item label="特殊工艺" v-if="order.specialProcess">{{ order.specialProcess }}</el-descriptions-item>
          <el-descriptions-item label="备注" v-if="order.remark">{{ order.remark }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
      
      <!-- 工件清单 -->
      <el-card class="panel-card" shadow="never" style="margin-top: 20px">
        <template #header>
          <div class="card-header">
            <span>工件清单 ({{ panels.length }} 件)</span>
            <el-button type="primary" size="small" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出Excel
            </el-button>
          </div>
        </template>
        
        <!-- 筛选和显示方式 -->
        <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 10px">
          <el-select v-model="panelFilter.type" placeholder="部件类型" clearable style="width: 150px">
            <el-option label="柜体板" value="柜体板" />
            <el-option label="门板" value="门板" />
            <el-option label="背板" value="背板" />
            <el-option label="装饰条" value="装饰条" />
            <el-option label="铰链" value="铰链" />
            <el-option label="滑轨" value="滑轨" />
            <el-option label="拉手" value="拉手" />
          </el-select>
          <el-select v-model="panelFilter.color" placeholder="花色" clearable style="width: 150px">
            <el-option label="子午灰" value="子午灰" />
            <el-option label="黑胡桃" value="黑胡桃" />
            <el-option label="羊绒灰" value="羊绒灰" />
          </el-select>
          <el-divider direction="vertical" />
          <el-radio-group v-model="displayMode">
            <el-radio-button label="list">列表视图</el-radio-button>
            <el-radio-button label="group">分组视图</el-radio-button>
          </el-radio-group>
        </div>
        
        <!-- 列表视图 -->
        <el-table v-if="displayMode === 'list'" :data="filteredPanels" stripe max-height="400">
          <el-table-column prop="panelNo" label="工件号" width="200" />
          <el-table-column prop="panelType" label="部件类型" width="100" />
          <el-table-column prop="itemType" label="工件类型" width="90">
            <template #default="{ row }">
              <el-tag :type="row.itemType === '板件' ? 'primary' : 'success'" size="small">
                {{ row.itemType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="尺寸" width="150">
            <template #default="{ row }">
              {{ row.length && row.width ? `${row.length} × ${row.width} mm` : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="thickness" label="厚度(mm)" width="100">
            <template #default="{ row }">
              {{ row.thickness || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="color" label="花色" width="100">
            <template #default="{ row }">
              {{ row.color || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="material" label="材质/规格" width="150" />
          <el-table-column prop="edgeRequirement" label="封边要求" width="150">
            <template #default="{ row }">
              {{ row.edgeRequirement || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="area" label="面积(m²)" width="100">
            <template #default="{ row }">
              {{ row.area || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80">
            <template #default="{ row }">
              {{ row.quantity || 1 }}
            </template>
          </el-table-column>
          <el-table-column label="工艺路径">
            <template #default="{ row }">
              {{ row.processRoute.join(' → ') }}
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分组视图 -->
        <div v-if="displayMode === 'group'" style="max-height: 400px; overflow-y: auto">
          <el-collapse v-model="expandedGroups">
            <el-collapse-item
              v-for="(group, index) in groupedPanels"
              :key="index"
              :name="index"
            >
              <template #title>
                <div style="display: flex; align-items: center; width: 100%; flex-wrap: wrap">
                  <el-tag :type="group.itemType === '板件' ? 'primary' : 'success'" style="margin-right: 8px">
                    {{ group.itemType }}
                  </el-tag>
                  <span style="font-weight: 500; margin-right: 16px">
                    {{ group.panelType }}
                  </span>
                  <span v-if="group.color" style="color: #909399; margin-right: 16px">
                    {{ group.color }}
                  </span>
                  <span v-if="group.thickness" style="color: #909399; margin-right: 16px">
                    {{ group.thickness }}mm
                  </span>
                  <el-divider direction="vertical" />
                  <span style="color: #409eff; margin-right: 16px">
                    数量: {{ group.count }} 件
                  </span>
                  <span v-if="group.totalArea" style="color: #67c23a; margin-right: 16px">
                    面积: {{ group.totalArea }} m²
                  </span>
                  <template v-if="group.processRoutes && group.processRoutes.length > 0">
                    <el-divider direction="vertical" />
                    <span style="color: #909399; margin-right: 8px">工艺路径:</span>
                    <el-tag
                      v-for="(route, index) in group.processRoutes"
                      :key="index"
                      size="small"
                      type="info"
                      style="margin-right: 4px"
                    >
                      {{ route }}
                    </el-tag>
                  </template>
                </div>
              </template>
              
              <!-- 分组明细 -->
              <el-table :data="group.items" stripe size="small">
                <el-table-column prop="panelNo" label="工件号" width="180" />
                <el-table-column label="尺寸" width="120">
                  <template #default="{ row }">
                    {{ row.length && row.width ? `${row.length} × ${row.width} mm` : '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="thickness" label="厚度" width="80">
                  <template #default="{ row }">
                    {{ row.thickness || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="color" label="花色" width="100">
                  <template #default="{ row }">
                    {{ row.color || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="material" label="材质/规格" width="150" />
                <el-table-column prop="edgeRequirement" label="封边要求" width="120">
                  <template #default="{ row }">
                    {{ row.edgeRequirement || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="area" label="面积(m²)" width="100">
                  <template #default="{ row }">
                    {{ row.area || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="quantity" label="数量" width="80">
                  <template #default="{ row }">
                    {{ row.quantity || 1 }}
                  </template>
                </el-table-column>
                <el-table-column label="工艺路径">
                  <template #default="{ row }">
                    {{ row.processRoute.join(' → ') }}
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-card>
      
      <!-- 预处理结果 -->
      <el-card class="result-card" shadow="never" style="margin-top: 20px" v-if="preprocessResult">
        <template #header>
          <span>预处理结果</span>
        </template>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="信息完整性校验">
            <el-tag :type="preprocessResult.infoValidation === 'PASSED' ? 'success' : 'danger'">
              {{ preprocessResult.infoValidation }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="技术审核">
            <el-tag :type="preprocessResult.splitAudit === 'PASSED' ? 'success' : 'danger'">
              {{ preprocessResult.splitAudit }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="物料齐套检查">
            <el-tag :type="preprocessResult.materialCheck.status === 'PASSED' ? 'success' : 'danger'">
              {{ preprocessResult.materialCheck.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="交期分级">
            <el-tag :type="getPriorityType(preprocessResult.priority)">
              {{ preprocessResult.priority }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- 缺料信息 -->
        <div v-if="preprocessResult.materialCheck.details.length > 0" style="margin-top: 16px">
          <el-alert title="缺料信息" type="warning" :closable="false">
            <div v-for="(item, index) in preprocessResult.materialCheck.details" :key="index">
              {{ item.material }}: 缺料 {{ item.shortage }} 件
            </div>
          </el-alert>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { useOrderStore } from '../../stores/order'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const order = ref({})
const panels = ref([])
const preprocessResult = ref(null)
const displayMode = ref('list')
const expandedGroups = ref([])

const panelFilter = ref({
  type: '',
  color: ''
})

// 筛选后的工件
const filteredPanels = computed(() => {
  let result = panels.value
  if (panelFilter.value.type) {
    result = result.filter(p => p.panelType === panelFilter.value.type)
  }
  if (panelFilter.value.color) {
    result = result.filter(p => p.color === panelFilter.value.color)
  }
  return result
})

// 分组后的工件
const groupedPanels = computed(() => {
  const groups = {}
  
  filteredPanels.value.forEach(panel => {
    // 分组键: 部件类型+花色+厚度
    const key = `${panel.panelType}_${panel.color || 'none'}_${panel.thickness || 'none'}`
    
    if (!groups[key]) {
      groups[key] = {
        panelType: panel.panelType,
        color: panel.color,
        thickness: panel.thickness,
        itemType: panel.itemType,
        items: [],
        count: 0,
        totalArea: 0,
        processRoutes: new Set()
      }
    }
    
    groups[key].items.push(panel)
    groups[key].count += (panel.quantity || 1)
    
    // 只计算板件的面积
    if (panel.itemType === '板件' && panel.area) {
      groups[key].totalArea += parseFloat(panel.area) * (panel.quantity || 1)
    }
    
    // 收集工艺路径
    if (panel.processRoute && panel.processRoute.length > 0) {
      panel.processRoute.forEach(route => groups[key].processRoutes.add(route))
    }
  })
  
  // 转换为数组,排序并格式化数据
  const groupArray = Object.values(groups).map(group => ({
    ...group,
    processRoutes: Array.from(group.processRoutes),
    totalArea: group.totalArea > 0 ? group.totalArea.toFixed(4) : ''
  }))
  
  // 按部件类型、花色、厚度排序
  groupArray.sort((a, b) => {
    // 先按部件类型排序
    if (a.panelType !== b.panelType) {
      return a.panelType.localeCompare(b.panelType)
    }
    // 再按花色排序
    if (a.color !== b.color) {
      return (a.color || '').localeCompare(b.color || '')
    }
    // 最后按厚度排序
    return (a.thickness || 0) - (b.thickness || 0)
  })
  
  return groupArray
})

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    '待审核': 'info',
    '待排产': 'primary',
    '已排产': 'success',
    '生产中': 'success',
    '已完成': 'success'
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

// 返回
const goBack = () => {
  router.back()
}

// 导出Excel
const handleExport = () => {
  ElMessage.success('导出功能开发中')
}

// 加载数据
const loadData = async () => {
  const orderNo = route.params.id
  await orderStore.fetchOrderDetail(orderNo)
  
  if (orderStore.currentOrder) {
    order.value = orderStore.currentOrder
    panels.value = orderStore.currentOrder.panels || []
    
    // 获取预处理结果
    if (order.value.status !== '待审核') {
      const result = await orderStore.fetchPreprocessResult(orderNo)
      if (result) {
        preprocessResult.value = result
      }
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.order-detail {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
