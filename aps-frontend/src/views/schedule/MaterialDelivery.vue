<template>
  <div class="material-delivery">
    <el-page-header @back="goBack" content="物料配送单" style="margin-bottom: 20px" />
    
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>配送单信息</span>
          <el-tag type="success">已配送</el-tag>
        </div>
      </template>
      
      <el-descriptions :column="3" border>
        <el-descriptions-item label="配送单号">DL{{ Date.now() }}</el-descriptions-item>
        <el-descriptions-item label="批次号">{{ batchNo }}</el-descriptions-item>
        <el-descriptions-item label="配送时间">{{ new Date().toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="配送地点">车间A - 电子锯线1</el-descriptions-item>
        <el-descriptions-item label="配送状态">
          <el-tag type="success">已完成</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="接收人">王五</el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <!-- 物料清单 -->
    <el-card shadow="never" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>物料清单</span>
          <el-button type="primary" size="small" @click="printDelivery">
            <el-icon><Printer /></el-icon>
            打印配送单
          </el-button>
        </div>
      </template>
      
      <el-table :data="materials" stripe>
        <el-table-column prop="materialNo" label="物料号" width="120" />
        <el-table-column prop="materialName" label="物料名称" width="200" />
        <el-table-column prop="specification" label="规格型号" width="150" />
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="unit" label="单位" width="80" />
        <el-table-column prop="warehouse" label="来源仓库" width="120" />
        <el-table-column label="状态" width="100">
          <template #default>
            <el-tag type="success">已配送</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Printer } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const batchNo = ref('')
const materials = ref([
  { materialNo: 'MAT001', materialName: '18mm子午灰颗粒板', specification: '2440×1220×18mm', quantity: 15, unit: '张', warehouse: '原料仓' },
  { materialNo: 'MAT007', materialName: '1mm子午灰ABS封边带', specification: '1×22mm', quantity: 500, unit: '米', warehouse: '辅料仓' },
  { materialNo: 'MAT010', materialName: '三合一连接件', specification: 'φ15×13mm', quantity: 800, unit: '件', warehouse: '五金仓' }
])

const goBack = () => {
  router.back()
}

const printDelivery = () => {
  ElMessage.success('打印功能开发中')
}

onMounted(() => {
  batchNo.value = route.params.id
})
</script>

<style scoped>
.material-delivery {
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
