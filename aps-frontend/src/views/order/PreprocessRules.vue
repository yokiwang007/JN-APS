<template>
  <div class="preprocess-rules">
    <el-page-header @back="goBack" content="预处理规则配置" style="margin-bottom: 20px" />
    
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>预处理检查规则</span>
          <div>
            <el-button type="primary" @click="handleSave">
              <el-icon><Check /></el-icon>
              保存配置
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              恢复默认
            </el-button>
          </div>
        </div>
      </template>
      
      <el-form :model="rulesForm" label-width="180px" v-loading="loading">
        <!-- 物料齐套检查 -->
        <el-divider content-position="left">
          <el-icon><Box /></el-icon>
          物料齐套检查
        </el-divider>
        
        <el-form-item label="检查级别">
          <el-radio-group v-model="rulesForm.materialCheck.level">
            <el-radio value="NONE">不检查</el-radio>
            <el-radio value="KEY">检查关键物料</el-radio>
            <el-radio value="ALL">检查全部物料</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="关键物料类型" v-if="rulesForm.materialCheck.level === 'KEY'">
          <el-checkbox-group v-model="rulesForm.materialCheck.keyMaterials">
            <el-checkbox label="板材">板材</el-checkbox>
            <el-checkbox label="封边带">封边带</el-checkbox>
            <el-checkbox label="五金件">五金件</el-checkbox>
            <el-checkbox label="功能件">功能件</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <!-- 信息完整性检查 -->
        <el-divider content-position="left">
          <el-icon><Document /></el-icon>
          信息完整性检查
        </el-divider>
        
        <el-form-item label="检查订单BOM">
          <el-switch v-model="rulesForm.infoCheck.checkBOM" />
          <span style="margin-left: 10px; color: #909399;">检查订单是否有关联的工件清单</span>
        </el-form-item>
        
        <el-form-item label="检查客户信息">
          <el-switch v-model="rulesForm.infoCheck.checkCustomer" />
          <span style="margin-left: 10px; color: #909399;">检查客户名称、联系方式等信息</span>
        </el-form-item>
        
        <el-form-item label="检查交货地址">
          <el-switch v-model="rulesForm.infoCheck.checkAddress" />
          <span style="margin-left: 10px; color: #909399;">检查交货地址是否完整</span>
        </el-form-item>
        
        <!-- 技术审核 -->
        <el-divider content-position="left">
          <el-icon><Tools /></el-icon>
          技术审核
        </el-divider>
        
        <el-form-item label="检查拆单状态">
          <el-switch v-model="rulesForm.techCheck.checkSplit" />
          <span style="margin-left: 10px; color: #909399;">检查订单是否已执行拆单</span>
        </el-form-item>
        
        <el-form-item label="检查关联图纸">
          <el-switch v-model="rulesForm.techCheck.checkDrawing" />
          <span style="margin-left: 10px; color: #909399;">检查订单是否有关联图纸</span>
        </el-form-item>
        
        <el-form-item label="检查工艺路线">
          <el-switch v-model="rulesForm.techCheck.checkProcessRoute" />
          <span style="margin-left: 10px; color: #909399;">检查所有工件是否配置工艺路线</span>
        </el-form-item>
        
        <el-form-item label="检查尺寸范围">
          <el-switch v-model="rulesForm.techCheck.checkSize" />
          <span style="margin-left: 10px; color: #909399;">检查工件尺寸是否在加工范围内</span>
        </el-form-item>
        
        <el-form-item label="尺寸范围设置" v-if="rulesForm.techCheck.checkSize">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="长度范围">
                <el-input-number v-model="rulesForm.techCheck.minLength" :min="0" :max="5000" placeholder="最小" style="width: 120px" />
                <span style="margin: 0 8px;">-</span>
                <el-input-number v-model="rulesForm.techCheck.maxLength" :min="0" :max="5000" placeholder="最大" style="width: 120px" />
                <span style="margin-left: 8px; color: #909399;">mm</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="宽度范围">
                <el-input-number v-model="rulesForm.techCheck.minWidth" :min="0" :max="5000" placeholder="最小" style="width: 120px" />
                <span style="margin: 0 8px;">-</span>
                <el-input-number v-model="rulesForm.techCheck.maxWidth" :min="0" :max="5000" placeholder="最大" style="width: 120px" />
                <span style="margin-left: 8px; color: #909399;">mm</span>
              </el-form-item>
            </el-col>
          </el-row>
          
        </el-form-item>
        
        <!-- 承诺交期检查 -->
        <el-divider content-position="left">
          <el-icon><Calendar /></el-icon>
          承诺交期检查
        </el-divider>
        
        <el-form-item label="检查交期可行性">
          <el-switch v-model="rulesForm.deliveryCheck.checkFeasibility" />
          <span style="margin-left: 10px; color: #909399;">检查承诺交期是否可达成</span>
        </el-form-item>
        
        <el-form-item label="最小生产周期" v-if="rulesForm.deliveryCheck.checkFeasibility">
          <el-input-number v-model="rulesForm.deliveryCheck.minLeadTime" :min="1" :max="30" />
          <span style="margin-left: 10px; color: #909399;">天（剩余天数小于此值视为异常）</span>
        </el-form-item>
        
        <el-form-item label="允许延期天数" v-if="rulesForm.deliveryCheck.checkFeasibility">
          <el-input-number v-model="rulesForm.deliveryCheck.allowDelay" :min="0" :max="10" />
          <span style="margin-left: 10px; color: #909399;">天（超过此天数视为不合格）</span>
        </el-form-item>
        
        <el-form-item label="自动调整优先级">
          <el-switch v-model="rulesForm.deliveryCheck.autoPriority" />
          <span style="margin-left: 10px; color: #909399;">根据交期紧急程度自动调整订单优先级</span>
        </el-form-item>
        
        <!-- 其他设置 -->
        <el-divider content-position="left">
          <el-icon><Setting /></el-icon>
          其他设置
        </el-divider>
        
        <el-form-item label="自动跳过已审核订单">
          <el-switch v-model="rulesForm.other.skipAudited" />
          <span style="margin-left: 10px; color: #909399;">预处理时自动跳过已审核的订单</span>
        </el-form-item>
        
        <el-form-item label="记录详细日志">
          <el-switch v-model="rulesForm.other.detailedLog" />
          <span style="margin-left: 10px; color: #909399;">记录每次预处理的详细检查日志</span>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check, Refresh, Box, Document, Tools, Calendar, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)

// 默认规则配置
const defaultRules = {
  materialCheck: {
    level: 'KEY',
    keyMaterials: ['板材', '封边带']
  },
  infoCheck: {
    checkBOM: true,
    checkCustomer: true,
    checkAddress: false
  },
  techCheck: {
    checkSplit: true,
    checkDrawing: false,
    checkProcessRoute: true,
    checkSize: true,
    minLength: 100,
    maxLength: 2800,
    minWidth: 100,
    maxWidth: 1200,
    minThickness: 5,
    maxThickness: 25
  },
  deliveryCheck: {
    checkFeasibility: true,
    minLeadTime: 3,
    allowDelay: 2,
    autoPriority: true
  },
  other: {
    skipAudited: true,
    detailedLog: false
  }
}

const rulesForm = ref(JSON.parse(JSON.stringify(defaultRules)))

// 返回
const goBack = () => {
  router.back()
}

// 保存配置
const handleSave = () => {
  loading.value = true
  try {
    localStorage.setItem('preprocess_rules', JSON.stringify(rulesForm.value))
    ElMessage.success('配置保存成功')
  } catch (error) {
    ElMessage.error('配置保存失败')
  } finally {
    loading.value = false
  }
}

// 恢复默认
const handleReset = () => {
  rulesForm.value = JSON.parse(JSON.stringify(defaultRules))
  ElMessage.success('已恢复默认配置')
}

// 加载配置
const loadRules = () => {
  loading.value = true
  try {
    const savedRules = localStorage.getItem('preprocess_rules')
    if (savedRules) {
      rulesForm.value = JSON.parse(savedRules)
    }
  } catch (error) {
    ElMessage.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRules()
})
</script>

<style scoped>
.preprocess-rules {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-divider__text) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #303133;
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}
</style>
