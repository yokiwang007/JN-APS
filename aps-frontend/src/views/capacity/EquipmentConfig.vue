<template>
  <div class="equipment-config">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>设备配置管理</span>
          <el-button type="primary" size="small" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <el-table :data="equipments" v-loading="loading" stripe>
        <el-table-column prop="equipmentId" label="设备编号" width="120" />
        
        <el-table-column prop="equipmentName" label="设备名称" width="150" />
        
        <el-table-column prop="type" label="设备类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="precision" label="精度等级" width="100">
          <template #default="{ row }">
            <el-rate
              v-model="row.precision"
              :max="5"
              disabled
              show-score
              text-color="#ff9900"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="支持工艺" width="250">
          <template #default="{ row }">
            <el-tag
              v-for="process in row.supportedProcesses"
              :key="process"
              size="small"
              type="info"
              style="margin-right: 4px"
            >
              {{ process }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="当前负荷" width="150">
          <template #default="{ row }">
            <el-progress
              :percentage="row.loadRate || Math.floor(Math.random() * 100)"
              :color="getLoadColor"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editEquipment(row)">
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
      title="编辑设备"
      width="600px"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="设备名称">
          <el-input v-model="editForm.equipmentName" />
        </el-form-item>
        
        <el-form-item label="设备类型">
          <el-select v-model="editForm.type" style="width: 100%">
            <el-option label="开料设备" value="开料设备" />
            <el-option label="封边设备" value="封边设备" />
            <el-option label="钻孔设备" value="钻孔设备" />
            <el-option label="加工中心" value="加工中心" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="精度等级">
          <el-rate v-model="editForm.precision" :max="5" show-text />
        </el-form-item>
        
        <el-form-item label="支持工艺">
          <el-select
            v-model="editForm.supportedProcesses"
            multiple
            filterable
            allow-create
            style="width: 100%"
            placeholder="请选择或输入工艺名称"
          >
            <el-option label="开料" value="开料" />
            <el-option label="封边" value="封边" />
            <el-option label="钻孔" value="钻孔" />
            <el-option label="铣型" value="铣型" />
            <el-option label="镂铣" value="镂铣" />
            <el-option label="质检" value="质检" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="当前状态">
          <el-select v-model="editForm.status" style="width: 100%">
            <el-option label="正常" value="正常" />
            <el-option label="维护中" value="维护中" />
            <el-option label="故障" value="故障" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEquipment">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Edit } from '@element-plus/icons-vue'

const equipments = ref([])
const loading = ref(false)
const editDialogVisible = ref(false)
const editForm = ref({})

// 获取设备类型颜色
const getTypeColor = (type) => {
  const colors = {
    '开料设备': 'primary',
    '封边设备': 'success',
    '钻孔设备': 'warning',
    '加工中心': 'danger'
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

// 编辑设备
const editEquipment = (equipment) => {
  editForm.value = { ...equipment }
  editDialogVisible.value = true
}

// 保存设备
const saveEquipment = () => {
  ElMessage.success('保存成功')
  editDialogVisible.value = false
}

// 刷新数据
const refreshData = () => {
  loadData()
}

// 加载数据
const loadData = () => {
  loading.value = true
  equipments.value = [
    {
      equipmentId: 'EQ001',
      equipmentName: '电子锯1',
      type: '开料设备',
      precision: 4,
      supportedProcesses: ['开料'],
      status: '正常',
      loadRate: 75
    },
    {
      equipmentId: 'EQ002',
      equipmentName: '电子锯2',
      type: '开料设备',
      precision: 4,
      supportedProcesses: ['开料'],
      status: '正常',
      loadRate: 60
    },
    {
      equipmentId: 'EQ003',
      equipmentName: '封边机1',
      type: '封边设备',
      precision: 5,
      supportedProcesses: ['封边'],
      status: '正常',
      loadRate: 85
    },
    {
      equipmentId: 'EQ004',
      equipmentName: '封边机2',
      type: '封边设备',
      precision: 4,
      supportedProcesses: ['封边'],
      status: '维护中',
      loadRate: 0
    },
    {
      equipmentId: 'EQ005',
      equipmentName: '六面钻1',
      type: '钻孔设备',
      precision: 5,
      supportedProcesses: ['钻孔'],
      status: '正常',
      loadRate: 70
    },
    {
      equipmentId: 'EQ006',
      equipmentName: '六面钻2',
      type: '钻孔设备',
      precision: 5,
      supportedProcesses: ['钻孔'],
      status: '正常',
      loadRate: 65
    },
    {
      equipmentId: 'EQ007',
      equipmentName: '五轴加工中心',
      type: '加工中心',
      precision: 5,
      supportedProcesses: ['铣型', '镂铣', '钻孔'],
      status: '正常',
      loadRate: 90
    }
  ]
  loading.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.equipment-config {
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
