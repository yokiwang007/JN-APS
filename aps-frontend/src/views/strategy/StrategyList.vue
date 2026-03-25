<template>
  <div class="strategy-list">
    <el-row :gutter="20">
      <el-col :span="8" v-for="strategy in strategyStore.strategies" :key="strategy.strategyId">
        <el-card shadow="hover" :class="{ 'active-card': strategy.enabled }">
          <template #header>
            <div class="card-header">
              <span>{{ strategy.strategyName }}</span>
              <el-tag v-if="strategy.enabled" type="success">已启用</el-tag>
            </div>
          </template>
          
          <div class="strategy-desc">{{ strategy.description }}</div>
          
          <!-- 权重展示 -->
          <div style="margin: 16px 0">
            <div style="font-weight: bold; margin-bottom: 8px">权重配置</div>
            <div v-for="(value, key) in strategy.priorityWeights" :key="key" style="margin-bottom: 8px">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px">
                <span>{{ getWeightLabel(key) }}</span>
                <span>{{ (value * 100).toFixed(0) }}%</span>
              </div>
              <el-progress :percentage="value * 100" :show-text="false" />
            </div>
          </div>
          
          <!-- 约束条件 -->
          <div v-if="strategy.constraints && strategy.constraints.length > 0">
            <div style="font-weight: bold; margin-bottom: 8px">约束条件</div>
            <el-tag
              v-for="constraint in strategy.constraints"
              :key="constraint.constraintName"
              style="margin-right: 8px; margin-bottom: 8px"
              size="small"
            >
              {{ constraint.constraintName }} {{ constraint.type === 'MIN' ? '≥' : '≤' }} {{ constraint.threshold }}
            </el-tag>
          </div>

          <!-- 不可分割需求 -->
          <div v-if="strategy.indivisibleRequirements && (strategy.indivisibleRequirements.orderIndivisible || strategy.indivisibleRequirements.productIndivisible || strategy.indivisibleRequirements.batchIndivisible)">
            <div style="font-weight: bold; margin-bottom: 8px">不可分割需求</div>
            <el-tag v-if="strategy.indivisibleRequirements.orderIndivisible" type="warning" size="small" style="margin-right: 8px; margin-bottom: 8px">
              订单不可分割
            </el-tag>
            <el-tag v-if="strategy.indivisibleRequirements.productIndivisible" type="warning" size="small" style="margin-right: 8px; margin-bottom: 8px">
              产品不可分割
            </el-tag>
            <el-tag v-if="strategy.indivisibleRequirements.batchIndivisible" type="warning" size="small" style="margin-right: 8px; margin-bottom: 8px">
              批次不可分割
            </el-tag>
          </div>

          <!-- 优先级规则 -->
          <div v-if="strategy.priorityRules && (strategy.priorityRules.enableOrderTypePriority || strategy.priorityRules.enableInsertOrderPriority || strategy.priorityRules.enableCustomerGrouping || strategy.priorityRules.enableDeliveryDateGrouping)">
            <div style="font-weight: bold; margin-bottom: 8px">优先级规则</div>
            <el-tag v-if="strategy.priorityRules.enableOrderTypePriority" type="success" size="small" style="margin-right: 8px; margin-bottom: 8px">
              订单类型优先级
            </el-tag>
            <el-tag v-if="strategy.priorityRules.enableInsertOrderPriority" type="success" size="small" style="margin-right: 8px; margin-bottom: 8px">
              插单优先级
            </el-tag>
            <el-tag v-if="strategy.priorityRules.enableCustomerGrouping" type="success" size="small" style="margin-right: 8px; margin-bottom: 8px">
              客户分组
            </el-tag>
            <el-tag v-if="strategy.priorityRules.enableDeliveryDateGrouping" type="success" size="small" style="margin-right: 8px; margin-bottom: 8px">
              交期分组
            </el-tag>
          </div>

          <!-- 操作按钮 -->
          <div style="margin-top: 16px; display: flex; gap: 8px">
            <el-button
              type="primary"
              size="small"
              @click="viewDetail(strategy.strategyId)"
            >
              查看详情
            </el-button>
            <el-button
              size="small"
              @click="editStrategy(strategy.strategyId)"
            >
              编辑
            </el-button>
            <el-button
              v-if="!strategy.enabled"
              type="success"
              size="small"
              @click="activateStrategy(strategy.strategyId)"
            >
              启用
            </el-button>
            <el-button
              v-if="!strategy.enabled"
              type="danger"
              size="small"
              @click="deleteStrategy(strategy.strategyId)"
            >
              删除
            </el-button>
          </div>
        </el-card>
      </el-col>
      
      <!-- 新建策略卡片 -->
      <el-col :span="8">
        <el-card shadow="hover" class="add-card" @click="createStrategy">
          <div style="text-align: center; padding: 40px 0">
            <el-icon style="font-size: 48px; color: #909399"><Plus /></el-icon>
            <div style="margin-top: 16px; color: #909399">新建策略</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useStrategyStore } from '../../stores/strategy'

const router = useRouter()
const strategyStore = useStrategyStore()

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

// 查看详情
const viewDetail = (strategyId) => {
  router.push(`/strategy/detail/${strategyId}`)
}

// 编辑策略
const editStrategy = (strategyId) => {
  router.push(`/strategy/edit/${strategyId}`)
}

// 新建策略
const createStrategy = () => {
  router.push('/strategy/edit')
}

// 启用策略
const activateStrategy = async (strategyId) => {
  try {
    await ElMessageBox.confirm('确定要启用该策略吗?启用后将停用其他策略。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await strategyStore.activate(strategyId)
    ElMessage.success('策略已启用')
  } catch (error) {
    // 用户取消
  }
}

// 删除策略
const deleteStrategy = async (strategyId) => {
  try {
    await ElMessageBox.confirm('确定要删除该策略吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await strategyStore.remove(strategyId)
    ElMessage.success('策略已删除')
  } catch (error) {
    // 用户取消
  }
}

// 加载数据
onMounted(() => {
  strategyStore.fetchStrategies()
})
</script>

<style scoped>
.strategy-list {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.active-card {
  border: 2px solid #67c23a;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.strategy-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.add-card {
  cursor: pointer;
  border: 2px dashed #dcdfe6;
  transition: all 0.3s;
}

.add-card:hover {
  border-color: #409eff;
}
</style>
