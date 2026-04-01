<template>
  <div class="process-route-manage">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>生产周期设置</span>
          <el-button type="primary" size="small" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      
      <el-table :data="processRoutes" v-loading="loading" stripe>
        <el-table-column prop="routeId" label="路线编号" width="120" />
        
        <el-table-column prop="routeName" label="工艺路线名称" width="180" />
        
        <el-table-column prop="panelType" label="适用部件类型" width="150">
          <template #default="{ row }">
            <el-tag>{{ row.panelType }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="工序序列" width="300">
          <template #default="{ row }">
            <el-steps :active="row.processSequence.length" finish-status="success" simple>
              <el-step
                v-for="(process, index) in row.processSequence"
                :key="index"
                :title="process"
              />
            </el-steps>
          </template>
        </el-table-column>
        
        <el-table-column prop="standardWorkTime" label="标准工时" width="120">
          <template #default="{ row }">
            {{ row.standardWorkTime }} 分钟
          </template>
        </el-table-column>
        
        <el-table-column prop="productionCycle" label="生产周期" width="120">
          <template #default="{ row }">
            {{ row.productionCycle || '-' }} 天
          </template>
        </el-table-column>
        
        <el-table-column prop="deliveryCommitment" label="对外承诺交期" width="140">
          <template #default="{ row }">
            {{ row.deliveryCommitment || '-' }} 天
          </template>
        </el-table-column>
        
        <el-table-column label="所需设备" width="250">
          <template #default="{ row }">
            <el-tag
              v-for="equipment in row.requiredEquipments"
              :key="equipment"
              size="small"
              type="info"
              style="margin-right: 4px"
            >
              {{ equipment }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="processRequirement" label="工艺要求" />
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editRoute(row)">
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
      title="编辑生产周期"
      width="700px"
    >
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="工艺路线名称">
          <el-input v-model="editForm.routeName" placeholder="请输入工艺路线名称" />
        </el-form-item>
        
        <el-form-item label="适用部件类型">
          <el-select v-model="editForm.panelType" style="width: 100%">
            <el-option label="柜体板" value="柜体板" />
            <el-option label="门板" value="门板" />
            <el-option label="背板" value="背板" />
            <el-option label="装饰条" value="装饰条" />
            <el-option label="抽面" value="抽面" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="工序序列">
          <div style="width: 100%">
            <el-tag
              v-for="(process, index) in editForm.processSequence"
              :key="index"
              closable
              @close="removeProcess(index)"
              style="margin-right: 8px; margin-bottom: 8px"
            >
              {{ process }}
            </el-tag>
            <el-input
              v-if="inputVisible"
              ref="inputRef"
              v-model="inputValue"
              size="small"
              style="width: 100px"
              @keyup.enter="addProcess"
              @blur="addProcess"
            />
            <el-button
              v-else
              size="small"
              @click="showInput"
            >
              + 添加工序
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="标准工时">
          <el-input-number v-model="editForm.standardWorkTime" :min="1" :max="120" />
          <span style="margin-left: 8px; color: #909399">分钟</span>
        </el-form-item>
        
        <el-form-item label="生产周期">
          <el-input-number v-model="editForm.productionCycle" :min="1" :max="30" />
          <span style="margin-left: 8px; color: #909399">天</span>
        </el-form-item>
        
        <el-form-item label="对外承诺交期">
          <el-input-number v-model="editForm.deliveryCommitment" :min="1" :max="60" />
          <span style="margin-left: 8px; color: #909399">天</span>
        </el-form-item>
        
        <el-form-item label="所需设备">
          <el-select
            v-model="editForm.requiredEquipments"
            multiple
            filterable
            allow-create
            style="width: 100%"
            placeholder="请选择或输入设备名称"
          >
            <el-option label="电子锯" value="电子锯" />
            <el-option label="封边机" value="封边机" />
            <el-option label="六面钻" value="六面钻" />
            <el-option label="加工中心" value="加工中心" />
            <el-option label="镂铣机" value="镂铣机" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="工艺要求">
          <el-input
            v-model="editForm.processRequirement"
            type="textarea"
            :rows="3"
            placeholder="请输入特殊工艺要求"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRoute">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Edit } from '@element-plus/icons-vue'
import { getProcessRoutes, updateProcessRoute } from '../../utils/api'

const processRoutes = ref([])
const loading = ref(false)
const editDialogVisible = ref(false)
const editForm = ref({})
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref(null)

// 编辑工艺路线
const editRoute = (route) => {
  editForm.value = { ...route }
  editDialogVisible.value = true
}

// 移除工序
const removeProcess = (index) => {
  editForm.value.processSequence.splice(index, 1)
}

// 显示输入框
const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 添加工序
const addProcess = () => {
  if (inputValue.value) {
    editForm.value.processSequence.push(inputValue.value)
    inputValue.value = ''
  }
  inputVisible.value = false
}

// 保存工艺路线
const saveRoute = async () => {
  try {
    const result = await updateProcessRoute(editForm.value.routeId, editForm.value)
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
    const result = await getProcessRoutes()
    if (result.code === 'SUCCESS') {
      processRoutes.value = result.data
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
.process-route-manage {
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
