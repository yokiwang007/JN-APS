<template>
  <div class="batch-detail">
    <el-page-header @back="goBack" content="批次详情" style="margin-bottom: 20px" />
    
    <div v-loading="batchStore.loading">
      <!-- 基本信息 -->
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-tag :type="getStatusType(batch.status)">{{ batch.status }}</el-tag>
          </div>
        </template>
        
        <el-descriptions :column="3" border>
          <el-descriptions-item label="批次号">{{ batch.batchNo }}</el-descriptions-item>
          <el-descriptions-item label="板材花色">{{ batch.color }}</el-descriptions-item>
          <el-descriptions-item label="板材厚度">{{ batch.thickness }} mm</el-descriptions-item>
          <el-descriptions-item label="板材材质">{{ batch.material }}</el-descriptions-item>
          <el-descriptions-item label="计划开始">{{ batch.planStartDate }}</el-descriptions-item>
          <el-descriptions-item label="计划结束">{{ batch.planEndDate }}</el-descriptions-item>
          <el-descriptions-item label="所属产线">{{ batch.productionLine }}</el-descriptions-item>
          <el-descriptions-item label="板材利用率">
            <el-progress
              :percentage="parseFloat(batch.utilizationRate || 0)"
              :color="getUtilizationColor(batch.utilizationRate)"
              :stroke-width="20"
            />
          </el-descriptions-item>
          <el-descriptions-item label="板件数量">{{ batch.panelCount }} 件</el-descriptions-item>
        </el-descriptions>
      </el-card>
      
      <el-row :gutter="20" style="margin-top: 20px">
        <!-- 包含订单 -->
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <span>包含订单 ({{ orders.length }} 个)</span>
            </template>
            
            <el-table :data="orders" stripe max-height="300">
              <el-table-column prop="orderNo" label="订单号" width="160" />
              <el-table-column prop="customerName" label="客户" width="100" />
              <el-table-column prop="productType" label="产品" width="80" />
              <el-table-column prop="deliveryDate" label="交期" width="120" />
              <el-table-column label="操作" width="80">
                <template #default="{ row }">
                  <el-button type="primary" link @click="viewOrder(row.orderNo)">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <!-- 优化开料图 -->
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span>优化开料图</span>
                <el-button type="primary" size="small" @click="viewOptimizeImage">
                  <el-icon><ZoomIn /></el-icon>
                  放大查看
                </el-button>
              </div>
            </template>
            
            <div class="optimize-preview">
              <div class="optimize-info">
                <el-icon><Picture /></el-icon>
                <div>板材利用率: {{ batch.utilizationRate }}%</div>
              </div>
              <div class="optimize-placeholder">
                <el-icon style="font-size: 80px; color: #dcdfe6"><Picture /></el-icon>
                <div style="margin-top: 16px; color: #909399">开料优化图预览</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 板件清单 -->
      <el-card shadow="never" style="margin-top: 20px">
        <template #header>
          <div class="card-header">
            <span>工件清单 ({{ panels.length }} 件)</span>
            <el-button type="primary" size="small" @click="exportPanels">
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
          </el-select>
          <el-select v-model="panelFilter.color" placeholder="花色" clearable style="width: 150px">
            <el-option label="子午灰" value="子午灰" />
            <el-option label="黑胡桃" value="黑胡桃" />
            <el-option label="羊绒灰" value="羊绒灰" />
          </el-select>
          <el-input
            v-model="panelFilter.orderNo"
            placeholder="订单号"
            clearable
            style="width: 200px"
          />
          <el-divider direction="vertical" />
          <el-radio-group v-model="displayMode">
            <el-radio-button label="list">列表视图</el-radio-button>
            <el-radio-button label="group">分组视图</el-radio-button>
          </el-radio-group>
        </div>
        
        <!-- 列表视图 -->
        <el-table v-if="displayMode === 'list'" :data="filteredPanels" stripe max-height="400">
          <el-table-column prop="panelNo" label="板件号" width="200" />
          <el-table-column prop="orderNo" label="订单号" width="160" />
          <el-table-column prop="panelType" label="部件类型" width="100" />
          <el-table-column prop="itemType" label="工件类型" width="90">
            <template #default="{ row }">
              <el-tag :type="row.itemType === '板件' ? 'primary' : 'success'" size="small">
                {{ row.itemType || '板件' }}
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
          <el-table-column label="工艺路径">
            <template #default="{ row }">
              {{ row.processRoute ? row.processRoute.join(' → ') : '-' }}
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
                    {{ group.itemType || '板件' }}
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
                      v-for="(route, idx) in group.processRoutes"
                      :key="idx"
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
                <el-table-column prop="panelNo" label="板件号" width="180" />
                <el-table-column prop="orderNo" label="订单号" width="140" />
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
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-card>
    </div>
    
    <!-- 开料图对话框 -->
    <el-dialog
      v-model="imageDialogVisible"
      title="优化开料图"
      width="80%"
    >
      <div class="optimize-full">
        <div class="optimize-stats">
          <el-tag type="success">板材利用率: {{ batch.utilizationRate }}%</el-tag>
          <el-tag type="info">板件数量: {{ panels.length }} 件</el-tag>
          <el-tag type="warning">订单数量: {{ orders.length }} 个</el-tag>
        </div>
        <div class="optimize-canvas">
          <el-icon style="font-size: 120px; color: #dcdfe6"><Picture /></el-icon>
          <div style="margin-top: 20px; color: #909399; font-size: 16px">
            开料优化图详细展示
          </div>
          <div style="margin-top: 10px; color: #c0c4cc; font-size: 14px">
            (实际项目中可集成专业开料优化软件的图形展示)
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ZoomIn, Picture, Download } from '@element-plus/icons-vue'
import { useBatchStore } from '../../stores/batch'

const route = useRoute()
const router = useRouter()
const batchStore = useBatchStore()

const batch = ref({})
const orders = ref([])
const panels = ref([])
const imageDialogVisible = ref(false)
const displayMode = ref('list')
const expandedGroups = ref([0])

const panelFilter = ref({
  type: '',
  color: '',
  orderNo: ''
})

// 筛选后的板件
const filteredPanels = computed(() => {
  let result = panels.value
  if (panelFilter.value.type) {
    result = result.filter(p => p.panelType === panelFilter.value.type)
  }
  if (panelFilter.value.color) {
    result = result.filter(p => p.color === panelFilter.value.color)
  }
  if (panelFilter.value.orderNo) {
    result = result.filter(p => p.orderNo.includes(panelFilter.value.orderNo))
  }
  return result
})

// 分组后的板件
const groupedPanels = computed(() => {
  const groups = {}
  
  filteredPanels.value.forEach(panel => {
    const key = `${panel.panelType}_${panel.color || '无'}_${panel.thickness || '无'}`
    
    if (!groups[key]) {
      groups[key] = {
        panelType: panel.panelType,
        color: panel.color,
        thickness: panel.thickness,
        itemType: panel.itemType || '板件',
        count: 0,
        totalArea: 0,
        processRoutes: [],
        items: []
      }
    }
    
    groups[key].count++
    groups[key].totalArea += parseFloat(panel.area) || 0
    groups[key].items.push(panel)
    
    if (panel.processRoute) {
      const routeStr = panel.processRoute.join(' → ')
      if (!groups[key].processRoutes.includes(routeStr)) {
        groups[key].processRoutes.push(routeStr)
      }
    }
  })
  
  return Object.values(groups)
    .map(group => ({
      ...group,
      totalArea: group.totalArea.toFixed(2)
    }))
    .sort((a, b) => {
      // 先按部件类型排序
      if (a.panelType !== b.panelType) {
        return a.panelType.localeCompare(b.panelType)
      }
      // 再按花色排序
      if (a.color !== b.color) {
        return (a.color || '无').localeCompare(b.color || '无')
      }
      // 最后按厚度排序
      return (a.thickness || 0) - (b.thickness || 0)
    })
})

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    '待下发': 'info',
    '已下发': 'primary',
    '生产中': 'warning',
    '已完成': 'success'
  }
  return types[status] || 'info'
}

// 获取利用率颜色
const getUtilizationColor = (rate) => {
  if (rate >= 90) return '#67c23a'
  if (rate >= 85) return '#e6a23c'
  return '#f56c6c'
}

// 返回
const goBack = () => {
  router.back()
}

// 查看订单
const viewOrder = (orderNo) => {
  router.push(`/order/detail/${orderNo}`)
}

// 查看开料图
const viewOptimizeImage = () => {
  imageDialogVisible.value = true
}

// 导出板件
const exportPanels = () => {
  ElMessage.success('导出功能开发中')
}

// 加载数据
const loadData = async () => {
  const batchNo = route.params.id
  await batchStore.fetchBatchDetail(batchNo)
  
  if (batchStore.currentBatch) {
    batch.value = batchStore.currentBatch
    orders.value = batchStore.currentBatch.orders || []
    panels.value = batchStore.currentBatch.panels || []
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.batch-detail {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.optimize-preview {
  text-align: center;
  padding: 20px;
}

.optimize-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  color: #67c23a;
  font-weight: bold;
}

.optimize-placeholder {
  padding: 40px;
  background: #f5f7fa;
  border-radius: 8px;
}

.optimize-full {
  text-align: center;
  padding: 40px;
}

.optimize-stats {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 30px;
}

.optimize-canvas {
  padding: 60px;
  background: #f5f7fa;
  border-radius: 8px;
}
</style>
