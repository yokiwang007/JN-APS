<template>
  <div class="production-line-manage">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>标准产能设置</span>
          <el-button type="primary" size="small" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <el-table :data="productionLines" v-loading="loading" stripe>
        <el-table-column prop="lineId" label="产线编号" width="120" />
        
        <el-table-column prop="lineName" label="产线名称" width="150" />
        
        <el-table-column prop="lineType" label="产线类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getLineTypeColor(row.lineType)">{{ row.lineType }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="standardCapacity" label="标准产能(件)" width="130">
          <template #default="{ row }">
            {{ row.standardCapacity }} 件/天
          </template>
        </el-table-column>
        
        <el-table-column prop="standardCapacityArea" label="标准产能(㎡)" width="130">
          <template #default="{ row }">
            {{ row.standardCapacityArea || '-' }} ㎡/天
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="当前状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="workshop" label="所属车间" width="120" />
        
        <el-table-column label="主要设备" width="200">
          <template #default="{ row }">
            <el-tag
              v-for="equipment in row.mainEquipments"
              :key="equipment"
              size="small"
              style="margin-right: 4px"
            >
              {{ equipment }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="当前负荷" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="row.loadRate || Math.floor(Math.random() * 40 + 60)"
              :color="getLoadColor"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editLine(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑标准产能"
      width="600px"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="产线名称">
          <el-input v-model="editForm.lineName" />
        </el-form-item>
        
        <el-form-item label="产线类型">
          <el-select v-model="editForm.lineType" style="width: 100%">
            <el-option label="开料线" value="开料线" />
            <el-option label="封边线" value="封边线" />
            <el-option label="钻孔线" value="钻孔线" />
            <el-option label="包装线" value="包装线" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="标准产能(件)">
          <el-input-number v-model="editForm.standardCapacity" :min="100" :max="2000" />
          <span style="margin-left: 8px; color: #909399">件/天</span>
        </el-form-item>
        
        <el-form-item label="标准产能(㎡)">
          <el-input-number v-model="editForm.standardCapacityArea" :min="10" :max="1000" />
          <span style="margin-left: 8px; color: #909399">㎡/天</span>
        </el-form-item>
        
        <el-form-item label="当前状态">
          <el-select v-model="editForm.status" style="width: 100%">
            <el-option label="正常" value="正常" />
            <el-option label="维护中" value="维护中" />
            <el-option label="故障" value="故障" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="所属车间">
          <el-input v-model="editForm.workshop" />
        </el-form-item>
        
        <el-form-item label="主要设备">
          <el-select
            v-model="editForm.mainEquipments"
            multiple
            filterable
            allow-create
            style="width: 100%"
            placeholder="请选择或输入设备名称"
          >
            <el-option label="电子锯1" value="电子锯1" />
            <el-option label="电子锯2" value="电子锯2" />
            <el-option label="封边机1" value="封边机1" />
            <el-option label="封边机2" value="封边机2" />
            <el-option label="六面钻1" value="六面钻1" />
            <el-option label="六面钻2" value="六面钻2" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveLine">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Edit } from '@element-plus/icons-vue'
import { getProductionLines, updateProductionLine } from '../../utils/api'

const productionLines = ref([])
const loading = ref(false)
const editDialogVisible = ref(false)
const editForm = ref({})

// 获取产线类型颜色
const getLineTypeColor = (type) => {
  const colors = {
    '开料线': 'primary',
    '封边线': 'success',
    '钻孔线': 'warning',
    '包装线': 'info'
  }
  return colors[type] || 'info'
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    '正常': 'success',
    '维护中': 'warning',
    '故障': 'danger'
  }
  return types[status] || 'info'
}

// 获取负荷颜色
const getLoadColor = (percentage) => {
  if (percentage < 70) return '#67c23a'
  if (percentage < 90) return '#e6a23c'
  return '#f56c6c'
}

// 编辑产线
const editLine = (line) => {
  editForm.value = { ...line }
  editDialogVisible.value = true
}

// 保存产线
const saveLine = async () => {
  try {
    const result = await updateProductionLine(editForm.value.lineId, editForm.value)
    if (result.code === 'SUCCESS') {
      ElMessage.success('保存成功')
      editDialogVisible.value = false
      refreshData()
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    const result = await getProductionLines()
    if (result.code === 'SUCCESS') {
      productionLines.value = result.data
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.production-line-manage {
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
