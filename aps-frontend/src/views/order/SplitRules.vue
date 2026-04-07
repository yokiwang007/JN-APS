<template>
  <div class="split-rules">
    <el-card class="operation-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-button type="primary" :icon="Plus" @click="handleAddRule">
            新增规则
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="Download" @click="handleImportRules">
            导入规则
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="Upload" @click="handleExportRules">
            导出规则
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="Refresh" @click="loadRules">
            刷新
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="table-card">
      <el-table :data="rules" style="width: 100%" size="default" stripe>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="rule_name" label="规则名称" width="200" />
        <el-table-column prop="conditions" label="条件" min-width="300">
          <template #default="scope">
            <div class="condition-text">{{ scope.row.conditions }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="result" label="结果" width="150" />
        <el-table-column prop="priority" label="优先级" width="100" sortable>
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priority)" size="small">
              {{ scope.row.priority }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.enabled"
              @change="handleToggleStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              link
              :icon="Edit"
              @click="handleEditRule(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              :icon="Delete"
              @click="handleDeleteRule(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 规则编辑对话框 -->
    <el-dialog
      v-model="ruleDialogVisible"
      :title="isEditMode ? '编辑规则' : '新增规则'"
      width="800px"
      @close="handleDialogClose"
    >
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="ruleFormRules" label-width="120px">
        <el-form-item label="规则名称" prop="rule_name">
          <el-input v-model="ruleForm.rule_name" placeholder="请输入规则名称" />
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-input-number
            v-model="ruleForm.priority"
            :min="1"
            :max="100"
            controls-position="right"
            style="width: 100%"
          />
          <div class="form-tip">数字越小优先级越高</div>
        </el-form-item>

        <el-divider content-position="left">条件设置</el-divider>

        <el-form-item label="零件类型">
          <el-select v-model="ruleForm.conditions.part_type" placeholder="请选择零件类型" clearable style="width: 100%">
            <el-option label="柜体板" value="柜体板" />
            <el-option label="门板" value="门板" />
            <el-option label="背板" value="背板" />
            <el-option label="装饰条" value="装饰条" />
            <el-option label="抽面" value="抽面" />
          </el-select>
        </el-form-item>

        <el-form-item label="材质">
          <el-select v-model="ruleForm.conditions.material" placeholder="请选择材质" clearable style="width: 100%">
            <el-option label="颗粒板" value="颗粒板" />
            <el-option label="多层板" value="多层板" />
            <el-option label="密度板" value="密度板" />
            <el-option label="实木" value="实木" />
          </el-select>
        </el-form-item>

        <el-form-item label="厚度">
          <el-input-number
            v-model="ruleForm.conditions.thickness"
            :min="5"
            :max="25"
            controls-position="right"
            placeholder="请输入厚度"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="花色">
          <el-select v-model="ruleForm.conditions.color" placeholder="请选择花色" clearable style="width: 100%">
            <el-option label="子午灰" value="子午灰" />
            <el-option label="黑胡桃" value="黑胡桃" />
            <el-option label="羊绒灰" value="羊绒灰" />
            <el-option label="白橡木" value="白橡木" />
            <el-option label="胡桃木" value="胡桃木" />
            <el-option label="深空灰" value="深空灰" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">结果设置</el-divider>

        <el-form-item label="工艺路线" prop="result">
          <el-select v-model="ruleForm.result" placeholder="请选择工艺路线" style="width: 100%">
            <el-option label="标准柜体线" value="标准柜体线" />
            <el-option label="异形门板线" value="异形门板线" />
            <el-option label="吸塑门板线" value="吸塑门板线" />
            <el-option label="背板线" value="背板线" />
            <el-option label="外协采购" value="外协采购" />
          </el-select>
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch v-model="ruleForm.enabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="ruleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Download, Upload, Refresh, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const rules = ref([])
const ruleDialogVisible = ref(false)
const isEditMode = ref(false)
const ruleFormRef = ref(null)

// 表单数据
const ruleForm = ref({
  rule_name: '',
  conditions: {
    part_type: '',
    material: '',
    thickness: null,
    color: ''
  },
  result: '',
  priority: 1,
  enabled: true
})

// 表单验证规则
const ruleFormRules = {
  rule_name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' }
  ],
  result: [
    { required: true, message: '请选择工艺路线', trigger: 'change' }
  ]
}

// 加载规则
const loadRules = () => {
  // 模拟数据
  rules.value = [
    {
      id: 1,
      rule_name: '柜体板规则',
      conditions: '材质=颗粒板 AND 厚度=18mm',
      result: '标准柜体线',
      priority: 1,
      enabled: true
    },
    {
      id: 2,
      rule_name: '门板规则',
      conditions: '材质=密度板 AND 铣型',
      result: '吸塑门板线',
      priority: 2,
      enabled: true
    },
    {
      id: 3,
      rule_name: '背板规则',
      conditions: '厚度=9mm',
      result: '背板线',
      priority: 3,
      enabled: true
    },
    {
      id: 4,
      rule_name: '异形门板规则',
      conditions: '零件类型=门板 AND 材质=多层板',
      result: '异形门板线',
      priority: 4,
      enabled: false
    },
    {
      id: 5,
      rule_name: '外协采购规则',
      conditions: '零件类型=五金件',
      result: '外协采购',
      priority: 5,
      enabled: true
    }
  ]

  console.log('✓ 加载拆解规则:', rules.value.length, '条')
}

// 新增规则
const handleAddRule = () => {
  isEditMode.value = false
  ruleForm.value = {
    rule_name: '',
    conditions: {
      part_type: '',
      material: '',
      thickness: null,
      color: ''
    },
    result: '',
    priority: rules.value.length + 1,
    enabled: true
  }
  ruleDialogVisible.value = true
}

// 编辑规则
const handleEditRule = (row) => {
  isEditMode.value = true
  ruleForm.value = JSON.parse(JSON.stringify(row))
  ruleDialogVisible.value = true
}

// 保存规则
const handleSaveRule = async () => {
  if (!ruleFormRef.value) return

  await ruleFormRef.value.validate((valid) => {
    if (valid) {
      // 生成条件文本
      const conditions = []
      if (ruleForm.value.conditions.part_type) {
        conditions.push(`零件类型=${ruleForm.value.conditions.part_type}`)
      }
      if (ruleForm.value.conditions.material) {
        conditions.push(`材质=${ruleForm.value.conditions.material}`)
      }
      if (ruleForm.value.conditions.thickness) {
        conditions.push(`厚度=${ruleForm.value.conditions.thickness}mm`)
      }
      if (ruleForm.value.conditions.color) {
        conditions.push(`花色=${ruleForm.value.conditions.color}`)
      }

      const conditionText = conditions.join(' AND ')

      if (isEditMode.value) {
        // 更新规则
        const index = rules.value.findIndex(r => r.id === ruleForm.value.id)
        if (index !== -1) {
          rules.value[index] = {
            ...ruleForm.value,
            conditions: conditionText
          }
          ElMessage.success('规则更新成功')
        }
      } else {
        // 新增规则
        rules.value.push({
          id: Date.now(),
          ...ruleForm.value,
          conditions: conditionText
        })
        ElMessage.success('规则添加成功')
      }

      ruleDialogVisible.value = false
    }
  })
}

// 删除规则
const handleDeleteRule = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除规则"${row.rule_name}"吗?`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = rules.value.findIndex(r => r.id === row.id)
    if (index !== -1) {
      rules.value.splice(index, 1)
      ElMessage.success('规则删除成功')
    }
  } catch (error) {
    // 用户取消
  }
}

// 切换规则状态
const handleToggleStatus = (row) => {
  const status = row.enabled ? '启用' : '禁用'
  ElMessage.success(`规则"${row.rule_name}"已${status}`)
}

// 导入规则
const handleImportRules = () => {
  ElMessage.info('规则导入功能开发中...')
}

// 导出规则
const handleExportRules = () => {
  ElMessage.info('规则导出功能开发中...')
}

// 对话框关闭
const handleDialogClose = () => {
  ruleFormRef.value?.resetFields()
}

// 工具函数
const getPriorityType = (priority) => {
  if (priority <= 2) return 'danger'
  if (priority <= 5) return 'warning'
  return 'info'
}

// 生命周期
onMounted(() => {
  loadRules()
})
</script>

<style scoped>
.split-rules {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.operation-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.condition-text {
  color: #606266;
  font-family: 'Courier New', monospace;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
