<template>
  <div class="schedule-optimize">
    <el-row :gutter="20">
      <!-- 左侧：批次选择 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>选择批次</span>
              <el-tag type="info">已选 {{ selectedBatches.length }} 个</el-tag>
            </div>
          </template>
          
          <!-- 搜索 -->
          <el-input
            v-model="searchKeyword"
            placeholder="搜索批次号"
            clearable
            style="margin-bottom: 16px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <!-- 批次列表 -->
          <el-table
            :data="filteredBatches"
            @selection-change="handleSelectionChange"
            max-height="400"
            stripe
          >
            <el-table-column type="selection" width="55" />
            <el-table-column prop="batchNo" label="批次号" width="160" />
            <el-table-column prop="color" label="花色" width="100" />
            <el-table-column prop="panelCount" label="板件数" width="80" />
            <el-table-column prop="utilizationRate" label="利用率" width="100">
              <template #default="{ row }">
                {{ row.utilizationRate }}%
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 统计信息 -->
          <div v-if="selectedBatches.length > 0" style="margin-top: 16px">
            <el-divider>统计信息</el-divider>
            <el-descriptions :column="2" size="small">
              <el-descriptions-item label="总批次">{{ selectedBatches.length }}</el-descriptions-item>
              <el-descriptions-item label="总板件">{{ totalPanels }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧：优化结果 -->
      <el-col :span="12">
        <!-- 优化操作 -->
        <el-card shadow="never" style="margin-bottom: 20px">
          <el-button
            type="primary"
            size="large"
            :disabled="selectedBatches.length === 0"
            :loading="optimizing"
            @click="handleOptimize"
            style="width: 100%; margin-bottom: 16px"
          >
            <el-icon><VideoPlay /></el-icon>
            开始优化
          </el-button>
          
          <el-button
            type="success"
            size="large"
            :disabled="!optimizeResult"
            :loading="issuing"
            @click="handleIssue"
            style="width: 100%"
          >
            <el-icon><Upload /></el-icon>
            下发指令
          </el-button>
        </el-card>
        
        <!-- 优化结果 -->
        <el-card shadow="never" v-if="optimizeResult">
          <template #header>
            <span>优化结果</span>
          </template>
          
          <el-descriptions :column="2" border style="margin-bottom: 16px">
            <el-descriptions-item label="排程数量">{{ optimizeResult.scheduleCount }}</el-descriptions-item>
            <el-descriptions-item label="优化状态">
              <el-tag type="success">完成</el-tag>
            </el-descriptions-item>
          </el-descriptions>
          
          <!-- 排程甘特图 -->
          <div style="margin-bottom: 16px">
            <div style="font-weight: bold; margin-bottom: 8px">排程时间线</div>
            <el-timeline>
              <el-timeline-item
                v-for="schedule in optimizeResult.schedules"
                :key="schedule.batchNo"
                :timestamp="`${schedule.planStartDate} ~ ${schedule.planEndDate}`"
              >
                <el-card shadow="hover">
                  <div style="font-weight: bold">{{ schedule.batchNo }}</div>
                  <div style="margin-top: 8px">
                    <el-tag
                      v-for="process in schedule.processes"
                      :key="process.processName"
                      style="margin-right: 8px"
                      size="small"
                    >
                      {{ process.processName }}
                    </el-tag>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
          
          <!-- 批次排程列表 -->
          <el-table :data="optimizeResult.schedules" stripe>
            <el-table-column prop="batchNo" label="批次号" width="160" />
            <el-table-column prop="planStartDate" label="开始日期" width="120" />
            <el-table-column prop="planEndDate" label="结束日期" width="120" />
            <el-table-column label="工序" width="200">
              <template #default="{ row }">
                <el-tag
                  v-for="p in row.processes"
                  :key="p.processName"
                  size="small"
                  style="margin-right: 4px"
                >
                  {{ p.processName }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        
        <!-- 下发结果 -->
        <el-card shadow="never" v-if="issueResult" style="margin-top: 20px">
          <template #header>
            <span>下发结果</span>
          </template>
          
          <el-result
            v-if="issueResult.successCount > 0"
            icon="success"
            title="下发成功"
            :sub-title="`成功下发 ${issueResult.successCount} 个批次的生产指令`"
          />
          
          <el-descriptions :column="2" border style="margin-top: 16px">
            <el-descriptions-item label="成功数量">
              <el-tag type="success">{{ issueResult.successCount }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="失败数量">
              <el-tag type="danger">{{ issueResult.failedCount }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, VideoPlay, Upload } from '@element-plus/icons-vue'
import { getBatches, optimizeSchedules, issueInstructions } from '../../utils/api'

const searchKeyword = ref('')
const selectedBatches = ref([])
const batches = ref([])
const optimizing = ref(false)
const issuing = ref(false)
const optimizeResult = ref(null)
const issueResult = ref(null)

// 筛选后的批次
const filteredBatches = computed(() => {
  if (!searchKeyword.value) {
    return batches.value.filter(b => b.status === '待下发')
  }
  const keyword = searchKeyword.value.toLowerCase()
  return batches.value.filter(b =>
    b.status === '待下发' &&
    b.batchNo.toLowerCase().includes(keyword)
  )
})

// 总板件数
const totalPanels = computed(() => {
  return selectedBatches.value.reduce((sum, b) => sum + b.panelCount, 0)
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

// 选择变化
const handleSelectionChange = (selection) => {
  selectedBatches.value = selection
}

// 执行优化
const handleOptimize = async () => {
  if (selectedBatches.value.length === 0) {
    ElMessage.warning('请选择批次')
    return
  }
  
  optimizing.value = true
  try {
    const batchNos = selectedBatches.value.map(b => b.batchNo)
    const result = await optimizeSchedules({ batchNos })
    
    if (result.code === 'SUCCESS') {
      optimizeResult.value = result.data
      ElMessage.success('排程优化完成')
    }
  } catch (error) {
    ElMessage.error('优化失败')
  } finally {
    optimizing.value = false
  }
}

// 下发指令
const handleIssue = async () => {
  if (!optimizeResult.value) {
    ElMessage.warning('请先执行优化')
    return
  }
  
  issuing.value = true
  try {
    const batchNos = optimizeResult.value.schedules.map(s => s.batchNo)
    const result = await issueInstructions({ batchNos })
    
    if (result.code === 'SUCCESS') {
      issueResult.value = result.data
      ElMessage.success('指令下发成功')
      
      // 刷新批次列表
      loadData()
    }
  } catch (error) {
    ElMessage.error('下发失败')
  } finally {
    issuing.value = false
  }
}

// 加载数据
const loadData = async () => {
  const result = await getBatches({ status: '待下发', pageSize: 100 })
  if (result.code === 'SUCCESS') {
    batches.value = result.data.list
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.schedule-optimize {
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
