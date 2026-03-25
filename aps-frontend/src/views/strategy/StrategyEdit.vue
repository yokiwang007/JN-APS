<template>
  <div class="strategy-edit">
    <el-page-header @back="goBack" :content="isEdit ? '编辑策略' : '新建策略'" style="margin-bottom: 20px" />
    
    <el-card shadow="never">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="策略名称" prop="strategyName">
          <el-input v-model="form.strategyName" placeholder="请输入策略名称" />
        </el-form-item>
        
        <el-form-item label="策略描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入策略描述"
          />
        </el-form-item>
        
        <el-divider>权重配置</el-divider>
        
        <el-form-item label="板材利用率">
          <el-slider
            v-model="form.priorityWeights.utilizationRate"
            :min="0"
            :max="100"
            :format-tooltip="formatTooltip"
            @change="normalizeWeights('utilizationRate')"
          />
          <span style="margin-left: 16px; color: #909399">
            {{ (form.priorityWeights.utilizationRate / 100).toFixed(2) }}
          </span>
        </el-form-item>
        
        <el-form-item label="交期满足率">
          <el-slider
            v-model="form.priorityWeights.deliverySatisfaction"
            :min="0"
            :max="100"
            :format-tooltip="formatTooltip"
            @change="normalizeWeights('deliverySatisfaction')"
          />
          <span style="margin-left: 16px; color: #909399">
            {{ (form.priorityWeights.deliverySatisfaction / 100).toFixed(2) }}
          </span>
        </el-form-item>
        
        <el-form-item label="换模成本">
          <el-slider
            v-model="form.priorityWeights.changeoverCost"
            :min="0"
            :max="100"
            :format-tooltip="formatTooltip"
            @change="normalizeWeights('changeoverCost')"
          />
          <span style="margin-left: 16px; color: #909399">
            {{ (form.priorityWeights.changeoverCost / 100).toFixed(2) }}
          </span>
        </el-form-item>
        
        <el-form-item label="产能均衡">
          <el-slider
            v-model="form.priorityWeights.capacityBalance"
            :min="0"
            :max="100"
            :format-tooltip="formatTooltip"
            @change="normalizeWeights('capacityBalance')"
          />
          <span style="margin-left: 16px; color: #909399">
            {{ (form.priorityWeights.capacityBalance / 100).toFixed(2) }}
          </span>
        </el-form-item>
        
        <el-alert
          :title="`权重总和: ${totalWeight.toFixed(2)} (应为1.00)`"
          :type="totalWeight === 1 ? 'success' : 'warning'"
          :closable="false"
          style="margin-bottom: 20px"
        />
        
        <el-divider>约束条件</el-divider>

        <div v-for="(constraint, index) in form.constraints" :key="index" style="margin-bottom: 16px">
          <el-card shadow="hover">
            <div style="display: flex; gap: 16px; align-items: center">
              <el-input v-model="constraint.constraintName" placeholder="约束名称" style="width: 200px" />
              <el-select v-model="constraint.type" style="width: 100px">
                <el-option label="≥" value="MIN" />
                <el-option label="≤" value="MAX" />
              </el-select>
              <el-input v-model="constraint.expression" placeholder="表达式" style="width: 150px" />
              <el-input-number v-model="constraint.threshold" :min="0" :max="100" />
              <el-button type="danger" circle @click="removeConstraint(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </el-card>
        </div>

        <el-button type="primary" plain @click="addConstraint">
          <el-icon><Plus /></el-icon>
          添加约束条件
        </el-button>

        <el-divider>不可分割需求</el-divider>

        <el-form-item label="订单不可分割">
          <el-switch v-model="form.indivisibleRequirements.orderIndivisible" />
          <span style="margin-left: 16px; color: #909399; font-size: 12px">
            同一订单的所有板件不能拆分到不同批次
          </span>
        </el-form-item>

        <el-form-item label="产品不可分割">
          <el-switch v-model="form.indivisibleRequirements.productIndivisible" />
          <span style="margin-left: 16px; color: #909399; font-size: 12px">
            同一产品类型的板件不能拆分到不同批次
          </span>
        </el-form-item>

        <el-form-item label="批次不可分割">
          <el-switch v-model="form.indivisibleRequirements.batchIndivisible" />
          <span style="margin-left: 16px; color: #909399; font-size: 12px">
            批次一旦规划完成,不能再拆分或合并
          </span>
        </el-form-item>

        <el-form-item label="设置原因">
          <el-input
            v-model="form.indivisibleRequirements.reason"
            type="textarea"
            :rows="2"
            placeholder="请说明设置不可分割需求的原因"
            style="width: 600px"
          />
        </el-form-item>

        <el-divider>优先级规则</el-divider>

        <el-form-item label="启用订单类型优先级">
          <el-switch v-model="form.priorityRules.enableOrderTypePriority" />
        </el-form-item>

        <div v-if="form.priorityRules.enableOrderTypePriority" style="margin-left: 20px; margin-bottom: 20px">
          <el-form-item label="补件订单权重">
            <el-input-number v-model="form.priorityRules.orderTypeWeights['补件订单']" :min="1" :max="5" :step="0.1" />
            <span style="margin-left: 8px; color: #909399; font-size: 12px">权重越高,优先级越高</span>
          </el-form-item>

          <el-form-item label="加急订单权重">
            <el-input-number v-model="form.priorityRules.orderTypeWeights['加急订单']" :min="1" :max="5" :step="0.1" />
            <span style="margin-left: 8px; color: #909399; font-size: 12px">权重越高,优先级越高</span>
          </el-form-item>

          <el-form-item label="标准订单权重">
            <el-input-number v-model="form.priorityRules.orderTypeWeights['标准订单']" :min="1" :max="5" :step="0.1" />
            <span style="margin-left: 8px; color: #909399; font-size: 12px">权重越高,优先级越高</span>
          </el-form-item>
        </div>

        <el-form-item label="启用插单优先级">
          <el-switch v-model="form.priorityRules.enableInsertOrderPriority" />
        </el-form-item>

        <div v-if="form.priorityRules.enableInsertOrderPriority" style="margin-left: 20px; margin-bottom: 20px">
          <el-form-item label="插单权重">
            <el-input-number v-model="form.priorityRules.insertOrderWeight" :min="1" :max="5" :step="0.1" />
            <span style="margin-left: 8px; color: #909399; font-size: 12px">插单的优先级权重</span>
          </el-form-item>
        </div>

        <el-form-item label="启用客户分组">
          <el-switch v-model="form.priorityRules.enableCustomerGrouping" />
        </el-form-item>

        <div v-if="form.priorityRules.enableCustomerGrouping" style="margin-left: 20px; margin-bottom: 20px">
          <el-form-item label="客户分组权重">
            <el-input-number v-model="form.priorityRules.customerGroupingWeight" :min="0" :max="1" :step="0.1" />
            <span style="margin-left: 8px; color: #909399; font-size: 12px">同一客户的订单尽量排在一起</span>
          </el-form-item>
        </div>

        <el-form-item label="启用交期分组">
          <el-switch v-model="form.priorityRules.enableDeliveryDateGrouping" />
        </el-form-item>

        <div v-if="form.priorityRules.enableDeliveryDateGrouping" style="margin-left: 20px; margin-bottom: 20px">
          <el-form-item label="交期分组天数">
            <el-input-number v-model="form.priorityRules.deliveryDateGroupingDays" :min="1" :max="30" />
            <span style="margin-left: 8px; color: #909399; font-size: 12px">交期相差N天内的订单尽量排在一起</span>
          </el-form-item>
        </div>

        <el-divider />
        
        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存
          </el-button>
          <el-button @click="goBack">取消</el-button>
          <el-button @click="handlePreview" v-if="!isEdit">
            预览
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" title="策略预览" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="策略名称">{{ form.strategyName }}</el-descriptions-item>
        <el-descriptions-item label="策略描述">{{ form.description }}</el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 16px">
        <div style="font-weight: bold; margin-bottom: 8px">权重配置</div>
        <el-tag
          v-for="(value, key) in form.priorityWeights"
          :key="key"
          style="margin-right: 8px"
        >
          {{ getWeightLabel(key) }}: {{ (value / 100).toFixed(2) }}
        </el-tag>
      </div>

      <div style="margin-top: 16px">
        <div style="font-weight: bold; margin-bottom: 8px">不可分割需求</div>
        <el-tag v-if="form.indivisibleRequirements.orderIndivisible" type="warning" style="margin-right: 8px">
          订单不可分割
        </el-tag>
        <el-tag v-if="form.indivisibleRequirements.productIndivisible" type="warning" style="margin-right: 8px">
          产品不可分割
        </el-tag>
        <el-tag v-if="form.indivisibleRequirements.batchIndivisible" type="warning" style="margin-right: 8px">
          批次不可分割
        </el-tag>
        <div v-if="form.indivisibleRequirements.reason" style="margin-top: 8px; color: #909399; font-size: 12px">
          原因: {{ form.indivisibleRequirements.reason }}
        </div>
      </div>

      <div style="margin-top: 16px">
        <div style="font-weight: bold; margin-bottom: 8px">优先级规则</div>
        <div v-if="form.priorityRules.enableOrderTypePriority">
          <el-tag type="success" style="margin-right: 8px">订单类型优先级</el-tag>
          <span style="color: #909399; font-size: 12px; margin-left: 8px">
            补件: {{ form.priorityRules.orderTypeWeights['补件订单'] }}x,
            加急: {{ form.priorityRules.orderTypeWeights['加急订单'] }}x,
            标准: {{ form.priorityRules.orderTypeWeights['标准订单'] }}x
          </span>
        </div>
        <div v-if="form.priorityRules.enableInsertOrderPriority" style="margin-top: 8px">
          <el-tag type="success" style="margin-right: 8px">插单优先级</el-tag>
          <span style="color: #909399; font-size: 12px; margin-left: 8px">
            权重: {{ form.priorityRules.insertOrderWeight }}x
          </span>
        </div>
        <div v-if="form.priorityRules.enableCustomerGrouping" style="margin-top: 8px">
          <el-tag type="success" style="margin-right: 8px">客户分组</el-tag>
          <span style="color: #909399; font-size: 12px; margin-left: 8px">
            权重: {{ form.priorityRules.customerGroupingWeight }}
          </span>
        </div>
        <div v-if="form.priorityRules.enableDeliveryDateGrouping" style="margin-top: 8px">
          <el-tag type="success" style="margin-right: 8px">交期分组</el-tag>
          <span style="color: #909399; font-size: 12px; margin-left: 8px">
            天数: {{ form.priorityRules.deliveryDateGroupingDays }}天
          </span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import { useStrategyStore } from '../../stores/strategy'

const route = useRoute()
const router = useRouter()
const strategyStore = useStrategyStore()

const formRef = ref(null)
const isEdit = ref(false)
const saving = ref(false)
const previewVisible = ref(false)

const form = ref({
  strategyName: '',
  description: '',
  priorityWeights: {
    utilizationRate: 40,
    deliverySatisfaction: 30,
    changeoverCost: 20,
    capacityBalance: 10
  },
  constraints: [],
  // 不可分割需求
  indivisibleRequirements: {
    orderIndivisible: false,
    productIndivisible: false,
    batchIndivisible: false,
    reason: ''
  },
  // 优先级规则
  priorityRules: {
    enableOrderTypePriority: false,
    orderTypeWeights: {
      '补件订单': 1.5,
      '加急订单': 1.3,
      '标准订单': 1.0
    },
    enableInsertOrderPriority: false,
    insertOrderWeight: 1.4,
    enableCustomerGrouping: false,
    customerGroupingWeight: 0.8,
    enableDeliveryDateGrouping: false,
    deliveryDateGroupingDays: 3
  }
})

const rules = {
  strategyName: [{ required: true, message: '请输入策略名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入策略描述', trigger: 'blur' }]
}

// 权重总和
const totalWeight = computed(() => {
  const weights = form.value.priorityWeights
  return (weights.utilizationRate + weights.deliverySatisfaction + 
          weights.changeoverCost + weights.capacityBalance) / 100
})

// 格式化提示
const formatTooltip = (val) => `${val}%`

// 获取权重标签
const getWeightLabel = (key) => {
  const labels = {
    utilizationRate: '板材利用率',
    deliverySatisfaction: '交期满足率',
    changeoverCost: '换模成本',
    capacityBalance: '产能均衡'
  }
  return labels[key] || key
}

// 归一化权重
const normalizeWeights = (changedKey) => {
  const total = Object.values(form.value.priorityWeights).reduce((sum, val) => sum + val, 0)
  if (total !== 100) {
    const diff = total - 100
    const otherKeys = Object.keys(form.value.priorityWeights).filter(k => k !== changedKey)
    const adjustPerKey = diff / otherKeys.length
    
    otherKeys.forEach(key => {
      form.value.priorityWeights[key] = Math.max(0, form.value.priorityWeights[key] - adjustPerKey)
    })
  }
}

// 添加约束
const addConstraint = () => {
  form.value.constraints.push({
    constraintName: '',
    type: 'MIN',
    expression: '',
    threshold: 85
  })
}

// 移除约束
const removeConstraint = (index) => {
  form.value.constraints.splice(index, 1)
}

// 返回
const goBack = () => {
  router.back()
}

// 保存
const handleSave = async () => {
  try {
    await formRef.value.validate()

    saving.value = true

    const params = {
      strategyName: form.value.strategyName,
      description: form.value.description,
      priorityWeights: {
        utilizationRate: form.value.priorityWeights.utilizationRate / 100,
        deliverySatisfaction: form.value.priorityWeights.deliverySatisfaction / 100,
        changeoverCost: form.value.priorityWeights.changeoverCost / 100,
        capacityBalance: form.value.priorityWeights.capacityBalance / 100
      },
      constraints: form.value.constraints,
      indivisibleRequirements: form.value.indivisibleRequirements,
      priorityRules: form.value.priorityRules
    }

    if (isEdit.value) {
      await strategyStore.update(route.params.id, params)
    } else {
      await strategyStore.create(params)
    }

    ElMessage.success('保存成功')
    router.push('/strategy/list')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 预览
const handlePreview = () => {
  previewVisible.value = true
}

// 加载数据
const loadData = async () => {
  if (route.params.id) {
    isEdit.value = true
    await strategyStore.fetchStrategies()
    const strategy = strategyStore.strategies.find(s => s.strategyId === route.params.id)

    if (strategy) {
      form.value = {
        strategyName: strategy.strategyName,
        description: strategy.description,
        priorityWeights: {
          utilizationRate: strategy.priorityWeights.utilizationRate * 100,
          deliverySatisfaction: strategy.priorityWeights.deliverySatisfaction * 100,
          changeoverCost: strategy.priorityWeights.changeoverCost * 100,
          capacityBalance: (strategy.priorityWeights.capacityBalance || 0) * 100
        },
        constraints: strategy.constraints || [],
        indivisibleRequirements: strategy.indivisibleRequirements || {
          orderIndivisible: false,
          productIndivisible: false,
          batchIndivisible: false,
          reason: ''
        },
        priorityRules: strategy.priorityRules || {
          enableOrderTypePriority: false,
          orderTypeWeights: {
            '补件订单': 1.5,
            '加急订单': 1.3,
            '标准订单': 1.0
          },
          enableInsertOrderPriority: false,
          insertOrderWeight: 1.4,
          enableCustomerGrouping: false,
          customerGroupingWeight: 0.8,
          enableDeliveryDateGrouping: false,
          deliveryDateGroupingDays: 3
        }
      }
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.strategy-edit {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}
</style>
