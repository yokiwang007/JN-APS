<template>
  <div class="schedule-adjust">
    <el-row :gutter="20">
      <!-- 左侧：批次选择和调整配置 -->
      <el-col :span="12">
        <!-- 批次选择 -->
        <el-card shadow="never" style="margin-bottom: 20px">
          <template #header>
            <span>选择批次</span>
          </template>
          
          <el-select
            v-model="selectedBatchNo"
            placeholder="请选择批次"
            filterable
            style="width: 100%"
            @change="handleBatchChange"
          >
            <el-option
              v-for="batch in batches"
              :key="batch.batchNo"
              :label="batch.batchNo"
              :value="batch.batchNo"
            >
              <span>{{ batch.batchNo }}</span>
              <span style="float: right; color: #909399; font-size: 12px">
                {{ batch.status }}
              </span>
            </el-option>
          </el-select>
          
          <!-- 批次信息 -->
          <div v-if="selectedBatch" style="margin-top: 16px">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="批次号">{{ selectedBatch.batchNo }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusType(selectedBatch.status)">{{ selectedBatch.status }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="花色">{{ selectedBatch.color }}</el-descriptions-item>
              <el-descriptions-item label="板件数">{{ selectedBatch.panelCount }}</el-descriptions-item>
              <el-descriptions-item label="计划开始">{{ selectedBatch.planStartDate }}</el-descriptions-item>
              <el-descriptions-item label="计划结束">{{ selectedBatch.planEndDate }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
        
        <!-- 调整类型 -->
        <el-card shadow="never" style="margin-bottom: 20px">
          <template #header>
            <span>调整类型</span>
          </template>
          
          <el-radio-group v-model="adjustType" style="width: 100%">
            <el-radio label="DELAY" style="display: block; margin-bottom: 10px">
              <div>
                <div style="font-weight: bold">延期</div>
                <div style="font-size: 12px; color: #909399">推迟批次生产时间</div>
              </div>
            </el-radio>
            <el-radio label="TRANSFER" style="display: block; margin-bottom: 10px">
              <div>
                <div style="font-weight: bold">转移产线</div>
                <div style="font-size: 12px; color: #909399">调整到其他产线生产</div>
              </div>
            </el-radio>
            <el-radio label="INSERT" style="display: block; margin-bottom: 10px">
              <div>
                <div style="font-weight: bold">紧急插单</div>
                <div style="font-size: 12px; color: #909399">插入紧急订单</div>
              </div>
            </el-radio>
            <el-radio label="CANCEL" style="display: block">
              <div>
                <div style="font-weight: bold">取消批次</div>
                <div style="font-size: 12px; color: #909399">取消该批次生产</div>
              </div>
            </el-radio>
          </el-radio-group>
        </el-card>
        
        <!-- 调整参数 -->
        <el-card shadow="never">
          <template #header>
            <span>调整参数</span>
          </template>
          
          <!-- 延期参数 -->
          <div v-if="adjustType === 'DELAY'">
            <el-form label-width="100px">
              <el-form-item label="延期天数">
                <el-input-number v-model="adjustParams.delayDays" :min="1" :max="30" />
              </el-form-item>
              <el-form-item label="延期原因">
                <el-select v-model="adjustParams.reason" placeholder="请选择" style="width: 100%">
                  <el-option label="设备故障" value="设备故障" />
                  <el-option label="物料短缺" value="物料短缺" />
                  <el-option label="人员不足" value="人员不足" />
                  <el-option label="其他" value="其他" />
                </el-select>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- 转移产线参数 -->
          <div v-if="adjustType === 'TRANSFER'">
            <el-form label-width="100px">
              <el-form-item label="目标产线">
                <el-select v-model="adjustParams.targetLine" placeholder="请选择" style="width: 100%">
                  <el-option label="电子锯线1" value="电子锯线1" />
                  <el-option label="电子锯线2" value="电子锯线2" />
                  <el-option label="封边线A" value="封边线A" />
                  <el-option label="封边线B" value="封边线B" />
                </el-select>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- 紧急插单参数 -->
          <div v-if="adjustType === 'INSERT'">
            <el-form label-width="100px">
              <el-form-item label="插单位置">
                <el-radio-group v-model="adjustParams.position">
                  <el-radio label="before">当前批次前</el-radio>
                  <el-radio label="after">当前批次后</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧：影响分析和操作 -->
      <el-col :span="12">
        <!-- 操作按钮 -->
        <el-card shadow="never" style="margin-bottom: 20px">
          <el-button
            type="primary"
            size="large"
            :disabled="!selectedBatchNo"
            :loading="analyzing"
            @click="analyzeImpact"
            style="width: 100%; margin-bottom: 16px"
          >
            <el-icon><Search /></el-icon>
            分析影响
          </el-button>
          
          <el-button
            type="success"
            size="large"
            :disabled="!impactResult"
            :loading="adjusting"
            @click="confirmAdjust"
            style="width: 100%"
          >
            <el-icon><Check /></el-icon>
            确认调整
          </el-button>
        </el-card>
        
        <!-- 影响分析结果 -->
        <el-card shadow="never" v-if="impactResult">
          <template #header>
            <span>影响分析</span>
          </template>
          
          <el-alert
            title="调整将影响以下订单"
            type="warning"
            :closable="false"
            style="margin-bottom: 16px"
          />
          
          <!-- 受影响订单 -->
          <div style="margin-bottom: 16px">
            <div style="font-weight: bold; margin-bottom: 8px">受影响订单</div>
            <el-tag
              v-for="orderId in impactResult.affectedOrders"
              :key="orderId"
              style="margin-right: 8px; margin-bottom: 8px"
            >
              {{ orderId }}
            </el-tag>
          </div>
          
          <!-- 新交期 -->
          <div v-if="impactResult.newDeliveryDates">
            <div style="font-weight: bold; margin-bottom: 8px">新交期</div>
            <el-table :data="deliveryDateList" stripe size="small">
              <el-table-column prop="orderId" label="订单号" width="160" />
              <el-table-column prop="oldDate" label="原交期" width="120" />
              <el-table-column prop="newDate" label="新交期" width="120" />
              <el-table-column label="变化" width="100">
                <template #default="{ row }">
                  <el-tag type="warning">+{{ row.days }} 天</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Check } from '@element-plus/icons-vue'
import { getBatches, adjustSchedule } from '../../utils/api'

const route = useRoute()

const batches = ref([])
const selectedBatchNo = ref('')
const selectedBatch = ref(null)
const adjustType = ref('DELAY')
const adjustParams = ref({
  delayDays: 1,
  reason: '',
  targetLine: '',
  position: 'before'
})
const analyzing = ref(false)
const adjusting = ref(false)
const impactResult = ref(null)

// 交期列表
const deliveryDateList = computed(() => {
  if (!impactResult.value || !impactResult.value.newDeliveryDates) return []
  
  return Object.entries(impactResult.value.newDeliveryDates).map(([orderId, newDate]) => ({
    orderId,
    oldDate: '2026-04-05', // 模拟原交期
    newDate,
    days: adjustParams.value.delayDays || 1
  }))
})

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    '待下发': 'info',
    '已下发': 'primary',
    '生产中': 'warning',
    '已完成': 'success'
  }
  return types[status] || 'info'
}

// 批次变化
const handleBatchChange = (batchNo) => {
  selectedBatch.value = batches.value.find(b => b.batchNo === batchNo)
}

// 分析影响
const analyzeImpact = async () => {
  if (!selectedBatchNo.value) {
    ElMessage.warning('请选择批次')
    return
  }
  
  analyzing.value = true
  try {
    const result = await adjustSchedule({
      batchNo: selectedBatchNo.value,
      adjustType: adjustType.value,
      params: adjustParams.value
    })
    
    if (result.code === 'SUCCESS') {
      impactResult.value = result.data.impactAnalysis
      ElMessage.success('影响分析完成')
    }
  } catch (error) {
    ElMessage.error('分析失败')
  } finally {
    analyzing.value = false
  }
}

// 确认调整
const confirmAdjust = async () => {
  try {
    await ElMessageBox.confirm('确定要执行此调整吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    adjusting.value = true
    const result = await adjustSchedule({
      batchNo: selectedBatchNo.value,
      adjustType: adjustType.value,
      params: adjustParams.value
    })
    
    if (result.code === 'SUCCESS') {
      ElMessage.success('调整成功')
      impactResult.value = null
      loadData()
    }
  } catch (error) {
    // 用户取消
  } finally {
    adjusting.value = false
  }
}

// 加载数据
const loadData = async () => {
  const result = await getBatches({ pageSize: 100 })
  if (result.code === 'SUCCESS') {
    batches.value = result.data.list
    
    // 如果URL中有batchNo参数,自动选中
    if (route.query.batchNo) {
      selectedBatchNo.value = route.query.batchNo
      handleBatchChange(selectedBatchNo.value)
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.schedule-adjust {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}
</style>
