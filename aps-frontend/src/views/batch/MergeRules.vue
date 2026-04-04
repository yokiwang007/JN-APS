<template>
  <div class="merge-rules">
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

    <el-card class="rules-card">
      <template #header>
        <div class="card-header">
          <span>揉单规则配置</span>
          <el-tag type="info">共 {{ mergeRules.length }} 条规则</el-tag>
        </div>
      </template>
      
      <el-collapse v-model="activeNames" accordion>
        <!-- 合并原则配置 -->
        <el-collapse-item title="合并原则" name="principle">
          <el-form :model="mergePrinciple" label-width="140px">
            <el-form-item label="合并原则">
              <el-radio-group v-model="mergePrinciple.type">
                <el-radio value="板材利用率优先">板材利用率优先</el-radio>
                <el-radio value="设备利用率优先">设备利用率优先</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="说明">
              <div class="form-tip">
                <p>板材利用率优先: 优先考虑提高板材出材率,适合大批量生产</p>
                <p>设备利用率优先: 优先考虑设备利用效率,适合小批量多品种</p>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSavePrinciple">保存</el-button>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <!-- 时间窗规则配置 -->
        <el-collapse-item title="时间窗规则" name="timeWindow">
          <el-form :model="timeWindow" label-width="140px">
            <el-form-item label="最大提前天数">
              <el-input-number
                v-model="timeWindow.forward_days"
                :min="0"
                :max="7"
                controls-position="right"
                style="width: 200px"
              />
              <span style="margin-left: 10px;">天</span>
              <div class="form-tip">允许将未来订单提前到当前批次</div>
            </el-form-item>
            <el-form-item label="最大延后天数">
              <el-input-number
                v-model="timeWindow.backward_days"
                :min="0"
                :max="7"
                controls-position="right"
                style="width: 200px"
              />
              <span style="margin-left: 10px;">天</span>
              <div class="form-tip">允许将当前订单延后到未来批次</div>
            </el-form-item>
            <el-form-item label="最大跨越天数">
              <el-input-number
                v-model="timeWindow.max_cross_days"
                :min="0"
                :max="3"
                controls-position="right"
                style="width: 200px"
              />
              <span style="margin-left: 10px;">天</span>
              <div class="form-tip">允许跨越的最大天数范围</div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveTimeWindow">保存</el-button>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <!-- 批次规模规则配置 -->
        <el-collapse-item title="批次规模规则" name="batchSize">
          <el-form :model="batchSize" label-width="140px">
            <el-form-item label="最小部件数">
              <el-input-number
                v-model="batchSize.min_parts"
                :min="10"
                :max="50"
                controls-position="right"
                style="width: 200px"
              />
              <span style="margin-left: 10px;">件</span>
            </el-form-item>
            <el-form-item label="最大部件数">
              <el-input-number
                v-model="batchSize.max_parts"
                :min="50"
                :max="200"
                controls-position="right"
                style="width: 200px"
              />
              <span style="margin-left: 10px;">件</span>
            </el-form-item>
            <el-form-item label="最大订单数">
              <el-input-number
                v-model="batchSize.max_orders"
                :min="1"
                :max="10"
                controls-position="right"
                style="width: 200px"
              />
              <span style="margin-left: 10px;">个</span>
            </el-form-item>
            <el-form-item label="相似度阈值">
              <el-input-number
                v-model="batchSize.similarity_threshold"
                :min="50"
                :max="100"
                controls-position="right"
                style="width: 200px"
              />
              <span style="margin-left: 10px;">%</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveBatchSize">保存</el-button>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <!-- 交期红线策略配置 -->
        <el-collapse-item title="交期红线策略" name="deadline">
          <el-form :model="deadline" label-width="140px">
            <el-form-item label="启用交期红线">
              <el-switch v-model="deadline.enabled" />
              <div class="form-tip">启用后,订单达到最迟开工日时强制下发</div>
            </el-form-item>
            <el-form-item label="强制下发预警">
              <el-input-number
                v-model="deadline.warning_days"
                :min="0"
                :max="5"
                controls-position="right"
                style="width: 200px"
              />
              <span style="margin-left: 10px;">天</span>
              <div class="form-tip">距离交期多少天时触发强制下发</div>
            </el-form-item>
            <el-form-item label="最低利用率要求">
              <el-input-number
                v-model="deadline.min_utilization"
                :min="0"
                :max="100"
                controls-position="right"
                style="width: 200px"
              />
              <span style="margin-left: 10px;">%</span>
              <div class="form-tip">强制下发时的最低利用率要求</div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveDeadline">保存</el-button>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <!-- 智能填缝策略配置 -->
        <el-collapse-item title="智能填缝策略" name="filler">
          <el-form :model="filler" label-width="140px">
            <el-form-item label="启用智能填缝">
              <el-switch v-model="filler.enabled" />
            </el-form-item>
            <el-form-item label="利用率阈值">
              <el-input-number
                v-model="filler.utilization_threshold"
                :min="0"
                :max="100"
                controls-position="right"
                style="width: 200px"
              />
              <span style="margin-left: 10px;">%</span>
              <div class="form-tip">利用率低于此值时触发填缝</div>
            </el-form-item>
            <el-form-item label="填缝来源">
              <el-checkbox-group v-model="filler.sources">
                <el-checkbox label="标准件需求池" />
                <el-checkbox label="售后补件池" />
                <el-checkbox label="样板间订单" />
              </el-checkbox-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveFiller">保存</el-button>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Download, Upload, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const activeNames = ref(['principle', 'timeWindow', 'batchSize', 'deadline', 'filler'])
const mergeRules = ref([])

// 合并原则
const mergePrinciple = ref({
  type: '板材利用率优先'
})

// 时间窗规则
const timeWindow = ref({
  forward_days: 1,
  backward_days: 1,
  max_cross_days: 1
})

// 批次规模规则
const batchSize = ref({
  min_parts: 40,
  max_parts: 80,
  max_orders: 5,
  similarity_threshold: 70
})

// 交期红线策略
const deadline = ref({
  enabled: true,
  warning_days: 0,
  min_utilization: 70
})

// 智能填缝策略
const filler = ref({
  enabled: true,
  utilization_threshold: 85,
  sources: ['标准件需求池', '售后补件池']
})

// 加载规则
const loadRules = () => {
  // 模拟加载规则
  mergeRules.value = [
    {
      id: 1,
      name: '合并原则',
      type: '板材利用率优先',
      enabled: true
    },
    {
      id: 2,
      name: '时间窗规则',
      type: '±1天',
      enabled: true
    },
    {
      id: 3,
      name: '批次规模规则',
      type: '40-80件',
      enabled: true
    },
    {
      id: 4,
      name: '交期红线策略',
      type: '启用',
      enabled: true
    },
    {
      id: 5,
      name: '智能填缝策略',
      type: '启用',
      enabled: true
    }
  ]

  console.log('✓ 加载揉单规则:', mergeRules.value.length, '条')
}

// 保存合并原则
const handleSavePrinciple = () => {
  const rule = mergeRules.value.find(r => r.id === 1)
  if (rule) {
    rule.type = mergePrinciple.value.type === '板材利用率优先' ? '板材利用率优先' : '设备利用率优先'
  }
  ElMessage.success('合并原则保存成功')
}

// 保存时间窗规则
const handleSaveTimeWindow = () => {
  const rule = mergeRules.value.find(r => r.id === 2)
  if (rule) {
    rule.type = `±${timeWindow.value.forward_days}/${timeWindow.value.backward_days}天`
  }
  ElMessage.success('时间窗规则保存成功')
}

// 保存批次规模规则
const handleSaveBatchSize = () => {
  const rule = mergeRules.value.find(r => r.id === 3)
  if (rule) {
    rule.type = `${batchSize.value.min_parts}-${batchSize.value.max_parts}件`
  }
  ElMessage.success('批次规模规则保存成功')
}

// 保存交期红线策略
const handleSaveDeadline = () => {
  const rule = mergeRules.value.find(r => r.id === 4)
  if (rule) {
    rule.type = deadline.value.enabled ? '启用' : '禁用'
  }
  ElMessage.success('交期红线策略保存成功')
}

// 保存智能填缝策略
const handleSaveFiller = () => {
  const rule = mergeRules.value.find(r => r.id === 5)
  if (rule) {
    rule.type = filler.value.enabled ? '启用' : '禁用'
  }
  ElMessage.success('智能填缝策略保存成功')
}

// 新增规则
const handleAddRule = () => {
  ElMessage.info('新增规则功能开发中...')
}

// 导入规则
const handleImportRules = () => {
  ElMessage.info('规则导入功能开发中...')
}

// 导出规则
const handleExportRules = () => {
  ElMessage.info('规则导出功能开发中...')
}

// 生命周期
onMounted(() => {
  loadRules()
})
</script>

<style scoped>
.merge-rules {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.operation-card {
  margin-bottom: 20px;
}

.rules-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}

.form-tip p {
  margin: 0;
  padding: 4px 0;
}
</style>
