<template>
  <div class="monitor-dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #409eff">
            <el-icon><VideoPlay /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.inProduction }}</div>
            <div class="stat-label">生产中批次</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #67c23a">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.completed }}</div>
            <div class="stat-label">今日完成</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #f56c6c">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.anomalies }}</div>
            <div class="stat-label">异常预警</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-icon" style="background: #e6a23c">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.avgDeviation }}%</div>
            <div class="stat-label">平均偏差</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <!-- 进度监控 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>生产进度监控</span>
              <el-button type="primary" link @click="refreshProgress">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          
          <el-table :data="progressData" max-height="400" stripe>
            <el-table-column prop="batchNo" label="批次号" width="160" />
            <el-table-column label="进度" width="200">
              <template #default="{ row }">
                <div>
                  <div style="font-size: 12px; margin-bottom: 4px">
                    计划: {{ row.plannedProgress }}% | 实际: {{ row.actualProgress }}%
                  </div>
                  <el-progress
                    :percentage="parseFloat(row.actualProgress)"
                    :color="getProgressColor(row.deviationRate)"
                  />
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="deviationRate" label="偏差" width="100">
              <template #default="{ row }">
                <el-tag :type="getDeviationType(row.deviationRate)">
                  {{ row.deviationRate }}%
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'NORMAL' ? 'success' : 'danger'">
                  {{ row.status === 'NORMAL' ? '正常' : '延迟' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <!-- 异常预警 -->
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>异常预警</span>
              <el-badge :value="anomalies.length" type="danger" />
            </div>
          </template>
          
          <el-timeline v-if="anomalies.length > 0">
            <el-timeline-item
              v-for="anomaly in anomalies"
              :key="anomaly.id"
              :type="getAnomalyType(anomaly.type)"
              :timestamp="anomaly.time"
            >
              <el-card shadow="hover">
                <div style="font-weight: bold; margin-bottom: 8px">
                  <el-icon><WarningFilled /></el-icon>
                  {{ anomaly.title }}
                </div>
                <div style="font-size: 12px; color: #909399">
                  {{ anomaly.description }}
                </div>
                <div style="margin-top: 8px">
                  <el-button type="primary" size="small" @click="handleAnomaly(anomaly)">
                    立即处理
                  </el-button>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
          
          <el-empty v-else description="暂无异常" />
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 产能分析 -->
    <el-card shadow="never" style="margin-top: 20px">
      <template #header>
        <span>产能负荷分析</span>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="6" v-for="line in capacityData" :key="line.lineId">
          <div class="capacity-item">
            <div class="capacity-name">{{ line.lineName }}</div>
            <el-progress
              :percentage="line.loadRate"
              :color="getCapacityColor(line.loadRate)"
              :stroke-width="20"
            />
            <div class="capacity-info">
              <span>负荷: {{ line.currentLoad }}/{{ line.standardCapacity }}</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { VideoPlay, CircleCheck, Warning, TrendCharts, Refresh, WarningFilled } from '@element-plus/icons-vue'
import { getProgress, getProductionLines } from '../../utils/api-unified'

const router = useRouter()

const stats = ref({
  inProduction: 8,
  completed: 12,
  anomalies: 3,
  avgDeviation: -5.2
})

const progressData = ref([])
const anomalies = ref([])
const capacityData = ref([])

// 获取进度颜色
const getProgressColor = (deviation) => {
  if (deviation >= -5) return '#67c23a'
  if (deviation >= -10) return '#e6a23c'
  return '#f56c6c'
}

// 获取偏差类型
const getDeviationType = (deviation) => {
  if (deviation >= -5) return 'success'
  if (deviation >= -10) return 'warning'
  return 'danger'
}

// 获取异常类型
const getAnomalyType = (type) => {
  const types = {
    '设备故障': 'danger',
    '进度滞后': 'warning',
    '物料短缺': 'warning'
  }
  return types[type] || 'info'
}

// 获取产能颜色
const getCapacityColor = (rate) => {
  if (rate <= 70) return '#67c23a'
  if (rate <= 90) return '#e6a23c'
  return '#f56c6c'
}

// 刷新进度
const refreshProgress = async () => {
  const result = await getProgress()
  if (result.code === 'SUCCESS') {
    progressData.value = result.data.batches
    ElMessage.success('刷新成功')
  }
}

// 处理异常
const handleAnomaly = (anomaly) => {
  router.push('/monitor/adjust')
}

// 加载数据
const loadData = async () => {
  // 加载进度数据
  const progressResult = await getProgress()
  if (progressResult.code === 'SUCCESS') {
    progressData.value = progressResult.data.batches
  }
  
  // 加载产能数据
  const capacityResult = await getProductionLines()
  if (capacityResult.code === 'SUCCESS') {
    capacityData.value = capacityResult.data.map(line => ({
      ...line,
      currentLoad: Math.floor(line.standardCapacity * (0.6 + Math.random() * 0.4)),
      loadRate: Math.floor((0.6 + Math.random() * 0.4) * 100)
    }))
  }
  
  // 模拟异常数据
  anomalies.value = [
    {
      id: 1,
      type: '设备故障',
      title: '封边机3故障停机',
      description: '影响批次: PC20260325015, PC20260325016',
      time: '10分钟前'
    },
    {
      id: 2,
      type: '进度滞后',
      title: '批次PC20260325008进度滞后',
      description: '实际进度45%, 计划进度60%, 滞后15%',
      time: '30分钟前'
    },
    {
      id: 3,
      type: '物料短缺',
      title: '18mm子午灰颗粒板库存不足',
      description: '当前库存: 20张, 需求: 35张',
      time: '1小时前'
    }
  ]
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.monitor-dashboard {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-icon .el-icon {
  font-size: 30px;
  color: #fff;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.capacity-item {
  text-align: center;
  padding: 20px;
}

.capacity-name {
  font-weight: bold;
  margin-bottom: 10px;
}

.capacity-info {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
