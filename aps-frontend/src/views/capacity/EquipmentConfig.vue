<template>
  <div class="equipment-config">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>设备配置管理</span>
          <div>
            <el-button type="primary" size="small" @click="addEquipment">
              <el-icon><Plus /></el-icon>
              新增
            </el-button>
            <el-button type="primary" size="small" @click="refreshData" style="margin-left: 8px">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 左右分栏布局 -->
      <div class="equipment-layout">
        <!-- 左侧：设备类型树 -->
        <div class="type-tree">
          <el-tree
            :data="equipmentTypeTree"
            :props="{ label: 'label', children: 'children' }"
            node-key="type"
            highlight-current
            default-expand-all
            @node-click="handleTypeSelect"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <el-icon v-if="data.type === 'all'"><List /></el-icon>
                <el-icon v-else><Monitor /></el-icon>
                <span style="margin-left: 8px">{{ data.label }}</span>
                <el-badge :value="data.count" type="primary" style="margin-left: 8px" />
              </span>
            </template>
          </el-tree>
        </div>
        
        <!-- 右侧：设备列表 -->
        <div class="equipment-list">
          <el-table :data="filteredEquipments" v-loading="loading" stripe>
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
                  :percentage="row.loadRate || 0"
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
                <el-button type="danger" link @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
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
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Edit, Delete, Plus, List, Monitor } from '@element-plus/icons-vue'
import { getEquipments, createEquipment, updateEquipment, deleteEquipment } from '../../utils/api-unified'

const equipments = ref([])
const loading = ref(false)
const editDialogVisible = ref(false)
const editForm = ref({})
const selectedType = ref('all')

// 设备类型树
const equipmentTypeTree = computed(() => {
  const typeMap = {}
  
  // 统计各类型设备数量
  equipments.value.forEach(e => {
    if (!typeMap[e.type]) {
      typeMap[e.type] = 0
    }
    typeMap[e.type]++
  })
  
  // 构建树形数据
  const children = Object.keys(typeMap).map(type => ({
    label: type,
    type: type,
    count: typeMap[type]
  }))
  
  return [{
    label: '全部设备',
    type: 'all',
    count: equipments.value.length,
    children: children
  }]
})

// 过滤后的设备列表
const filteredEquipments = computed(() => {
  if (selectedType.value === 'all') {
    return equipments.value
  }
  return equipments.value.filter(e => e.type === selectedType.value)
})

// 选择设备类型
const handleTypeSelect = (data) => {
  selectedType.value = data.type
}

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
const saveEquipment = async () => {
  try {
    const isNew = !equipments.value.find(e => e.equipmentId === editForm.value.equipmentId)
    let result
    if (isNew) {
      result = await createEquipment(editForm.value)
    } else {
      result = await updateEquipment(editForm.value.equipmentId, editForm.value)
    }
    if (result.code === 'SUCCESS') {
      ElMessage.success(isNew ? '创建成功' : '保存成功')
      editDialogVisible.value = false
      refreshData()
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 刷新数据
const refreshData = () => {
  loadData()
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const result = await getEquipments()
    if (result.code === 'SUCCESS') {
      equipments.value = result.data
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 新增设备
const addEquipment = () => {
  editForm.value = {
    equipmentId: `EQ${Date.now().toString().slice(-6)}`,
    equipmentName: '',
    type: '开料设备',
    precision: 3,
    supportedProcesses: ['开料'],
    status: '正常',
    loadRate: 0
  }
  editDialogVisible.value = true
}

// 删除设备
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除设备 "${row.equipmentName}" 吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const result = await deleteEquipment(row.equipmentId)
    if (result.code === 'SUCCESS') {
      ElMessage.success('删除成功')
      refreshData()
    }
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('删除失败')
  }
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

.equipment-layout {
  display: flex;
  gap: 20px;
  min-height: 500px;
}

.type-tree {
  width: 250px;
  border-right: 1px solid #e4e7ed;
  padding-right: 20px;
}

.tree-node {
  display: flex;
  align-items: center;
}

.equipment-list {
  flex: 1;
  overflow-x: auto;
}
</style>
