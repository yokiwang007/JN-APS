<template>
  <div class="batch-list">
    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="批次状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 150px">
            <el-option label="待下发" value="待下发" />
            <el-option label="已下发" value="已下发" />
            <el-option label="生产中" value="生产中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="产线">
          <el-select v-model="searchForm.productionLine" placeholder="请选择" clearable style="width: 150px">
            <el-option label="电子锯线1" value="电子锯线1" />
            <el-option label="电子锯线2" value="电子锯线2" />
            <el-option label="封边线A" value="封边线A" />
            <el-option label="封边线B" value="封边线B" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="花色">
          <el-select v-model="searchForm.color" placeholder="请选择" clearable style="width: 150px">
            <el-option label="子午灰" value="子午灰" />
            <el-option label="黑胡桃" value="黑胡桃" />
            <el-option label="羊绒灰" value="羊绒灰" />
          </el-select>
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
    
    <!-- 表格区域 -->
    <div class="table-area">
      <el-table
        :data="batchStore.batches"
        v-loading="batchStore.loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="batchNo" label="批次号" width="180" />
        
        <el-table-column prop="color" label="花色" width="100" />
        
        <el-table-column prop="thickness" label="厚度" width="80" />
        
        <el-table-column prop="material" label="材质" width="100" />
        
        <el-table-column prop="orderIds" label="订单数" width="80">
          <template #default="{ row }">
            {{ row.orderIds.length }}
          </template>
        </el-table-column>
        
        <el-table-column prop="panelCount" label="板件数" width="100" />
        
        <el-table-column prop="utilizationRate" label="利用率" width="120">
          <template #default="{ row }">
            <el-progress
              :percentage="parseFloat(row.utilizationRate)"
              :color="getUtilizationColor(row.utilizationRate)"
              :stroke-width="15"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="planStartDate" label="计划开始" width="120" />
        
        <el-table-column prop="planEndDate" label="计划结束" width="120" />
        
        <el-table-column prop="productionLine" label="产线" width="120" />
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row.batchNo)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button
              type="success"
              link
              @click="issueInstruction(row.batchNo)"
              v-if="row.status === '待下发'"
            >
              <el-icon><Upload /></el-icon>
              下发
            </el-button>
            <el-button type="warning" link @click="adjustBatch(row.batchNo)">
              <el-icon><Edit /></el-icon>
              调整
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="batchStore.pagination.page"
        v-model:page-size="batchStore.pagination.pageSize"
        :total="batchStore.pagination.total"
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, View, Upload, Edit } from '@element-plus/icons-vue'
import { useBatchStore } from '../../stores/batch'
import { issueInstructions } from '../../utils/api-unified'

const router = useRouter()
const batchStore = useBatchStore()

const searchForm = ref({
  status: '',
  productionLine: '',
  color: ''
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

// 搜索
const handleSearch = () => {
  batchStore.updateFilters(searchForm.value)
  batchStore.fetchBatches()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    status: '',
    productionLine: '',
    color: ''
  }
  batchStore.updateFilters(searchForm.value)
  batchStore.fetchBatches()
}

// 查看详情
const viewDetail = (batchNo) => {
  router.push(`/batch/detail/${batchNo}`)
}

// 下发指令
const issueInstruction = async (batchNo) => {
  try {
    await ElMessageBox.confirm('确定要下发该批次的生产指令吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const result = await issueInstructions({ batchNos: [batchNo] })
    if (result.code === 'SUCCESS') {
      ElMessage.success('下发成功')
      batchStore.fetchBatches()
    }
  } catch (error) {
    // 用户取消
  }
}

// 调整批次
const adjustBatch = (batchNo) => {
  router.push({ path: '/monitor/adjust', query: { batchNo } })
}

// 分页
const handleSizeChange = (size) => {
  batchStore.updatePagination({ pageSize: size })
  batchStore.fetchBatches()
}

const handleCurrentChange = (page) => {
  batchStore.updatePagination({ page })
  batchStore.fetchBatches()
}

// 初始化
onMounted(() => {
  batchStore.fetchBatches()
})
</script>

<style scoped>
.batch-list {
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
</style>
