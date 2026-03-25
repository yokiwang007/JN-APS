<template>
  <div class="capacity-analysis">
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>产线负荷分析</span>
          </template>
          
          <div v-for="line in productionLines" :key="line.lineId" class="line-item">
            <div class="line-header">
              <span class="line-name">{{ line.lineName }}</span>
              <el-tag :type="getStatusType(line.status)" size="small">{{ line.status }}</el-tag>
            </div>
            <el-progress
              :percentage="line.loadRate"
              :color="getLoadColor"
              :stroke-width="20"
            />
            <div class="line-info">
              <span>当前负荷: {{ line.currentLoad }} 件/天</span>
              <span>标准产能: {{ line.standardCapacity }} 件/天</span>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <span>产能利用率趋势</span>
          </template>
          
          <div class="chart-placeholder">
            <el-icon style="font-size: 80px; color: #dcdfe6"><TrendCharts /></el-icon>
            <div style="margin-top: 16px; color: #909399">
              产能利用率趋势图
            </div>
            <div style="margin-top: 8px; color: #c0c4cc; font-size: 12px">
              (可集成ECharts展示详细图表)
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card shadow="never" style="margin-top: 20px">
      <template #header>
        <span>产能瓶颈分析</span>
      </template>
      
      <el-table :data="bottlenecks" stripe>
        <el-table-column prop="lineName" label="产线" width="150" />
        <el-table-column prop="issue" label="问题" width="200" />
        <el-table-column prop="impact" label="影响" width="150" />
        <el-table-column prop="suggestion" label="建议" />
        <el-table-column label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="row.priority === '高' ? 'danger' : 'warning'">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TrendCharts } from '@element-plus/icons-vue'
import { getProductionLines } from '../../utils/api'

const stats = ref([
  { label: '平均负荷率', value: '78%', color: '#409eff' },
  { label: '瓶颈产线', value: '2条', color: '#f56c6c' },
  { label: '空闲产线', value: '1条', color: '#67c23a' },
  { label: '产能利用率', value: '85%', color: '#e6a23c' }
])

const productionLines = ref([])
const bottlenecks = ref([
  { lineName: '封边线B', issue: '负荷率过高', impact: '影响交期', suggestion: '增加人力或转移部分批次', priority: '高' },
  { lineName: '钻孔线', issue: '设备老化', impact: '效率下降', suggestion: '安排设备维护', priority: '中' }
])

const getStatusType = (status) => {
  const types = {
    '正常': 'success',
    '维护中': 'warning',
    '故障': 'danger'
  }
  return types[status] || 'info'
}

const getLoadColor = (percentage) => {
  if (percentage < 70) return '#67c23a'
  if (percentage < 90) return '#e6a23c'
  return '#f56c6c'
}

const loadData = async () => {
  const result = await getProductionLines()
  if (result.code === 'SUCCESS') {
    productionLines.value = result.data.map(line => ({
      ...line,
      currentLoad: Math.floor(line.standardCapacity * (0.6 + Math.random() * 0.4)),
      loadRate: Math.floor((0.6 + Math.random() * 0.4) * 100)
    }))
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.capacity-analysis {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
}

.line-item {
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.line-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.line-name {
  font-weight: bold;
  font-size: 16px;
}

.line-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.chart-placeholder {
  text-align: center;
  padding: 60px;
  background: #f5f7fa;
  border-radius: 8px;
}
</style>
