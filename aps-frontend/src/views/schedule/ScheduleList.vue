<template>
  <div class="schedule-list">
    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="批次号">
          <el-input v-model="searchForm.batchNo" placeholder="请输入批次号" clearable style="width: 200px" />
        </el-form-item>
        
        <el-form-item label="产线">
          <el-select v-model="searchForm.productionLine" placeholder="请选择" clearable style="width: 150px">
            <el-option label="电子锯线1" value="电子锯线1" />
            <el-option label="电子锯线2" value="电子锯线2" />
            <el-option label="封边线A" value="封边线A" />
            <el-option label="封边线B" value="封边线B" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 甘特图区域 -->
    <el-card shadow="never" style="margin-bottom: 20px">
      <template #header>
        <span>排程甘特图</span>
      </template>
      
      <div class="gantt-chart">
        <div class="gantt-header">
          <div class="gantt-label">批次</div>
          <div class="gantt-timeline">
            <div v-for="day in timelineDays" :key="day" class="gantt-day">
              {{ day }}
            </div>
          </div>
        </div>
        
        <div class="gantt-body">
          <div v-for="schedule in schedules" :key="schedule.batchNo" class="gantt-row">
            <div class="gantt-label">{{ schedule.batchNo }}</div>
            <div class="gantt-bar-container">
              <div
                class="gantt-bar"
                :style="getBarStyle(schedule)"
                @click="viewDetail(schedule.batchNo)"
              >
                <span>{{ schedule.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    
    <!-- 排程列表 -->
    <el-card shadow="never">
      <template #header>
        <span>排程列表</span>
      </template>
      
      <el-table :data="schedules" stripe>
        <el-table-column prop="batchNo" label="批次号" width="180" />
        
        <el-table-column prop="planStartDate" label="计划开始" width="120" />
        
        <el-table-column prop="planEndDate" label="计划结束" width="120" />
        
        <el-table-column prop="productionLine" label="产线" width="120" />
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="进度" width="200">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress || Math.floor(Math.random() * 100)"
              :color="getProgressColor"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row.batchNo)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button type="warning" link @click="adjustSchedule(row.batchNo)">
              <el-icon><Edit /></el-icon>
              调整
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Refresh, View, Edit } from '@element-plus/icons-vue'
import { getBatches } from '../../utils/api-unified'

const router = useRouter()

const searchForm = ref({
  batchNo: '',
  productionLine: ''
})

const schedules = ref([])

// 时间线日期
const timelineDays = computed(() => {
  const days = []
  const today = new Date()
  for (let i = 0; i < 10; i++) {
    const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
    days.push(`${date.getMonth() + 1}/${date.getDate()}`)
  }
  return days
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

// 获取进度颜色
const getProgressColor = (percentage) => {
  if (percentage < 50) return '#409eff'
  if (percentage < 80) return '#e6a23c'
  return '#67c23a'
}

// 获取甘特图条样式
const getBarStyle = (schedule) => {
  const startOffset = Math.floor(Math.random() * 5)
  const width = Math.floor(Math.random() * 3 + 2)
  
  return {
    left: `${startOffset * 10}%`,
    width: `${width * 10}%`,
    backgroundColor: schedule.status === '生产中' ? '#e6a23c' : 
                     schedule.status === '已完成' ? '#67c23a' : '#409eff'
  }
}

// 搜索
const handleSearch = () => {
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    batchNo: '',
    productionLine: ''
  }
  loadData()
}

// 查看详情
const viewDetail = (batchNo) => {
  router.push(`/batch/detail/${batchNo}`)
}

// 调整排程
const adjustSchedule = (batchNo) => {
  router.push({ path: '/monitor/adjust', query: { batchNo } })
}

// 加载数据
const loadData = async () => {
  const result = await getBatches({ pageSize: 50 })
  if (result.code === 'SUCCESS') {
    schedules.value = result.data.list.filter(b => 
      b.status === '已下发' || b.status === '生产中' || b.status === '已完成'
    )
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.schedule-list {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.search-area {
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.gantt-chart {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.gantt-header {
  display: flex;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.gantt-label {
  width: 180px;
  padding: 12px;
  font-weight: bold;
  border-right: 1px solid #ebeef5;
}

.gantt-timeline {
  flex: 1;
  display: flex;
}

.gantt-day {
  flex: 1;
  padding: 12px 8px;
  text-align: center;
  font-size: 12px;
  border-right: 1px solid #ebeef5;
}

.gantt-body {
  max-height: 400px;
  overflow-y: auto;
}

.gantt-row {
  display: flex;
  border-bottom: 1px solid #ebeef5;
}

.gantt-bar-container {
  flex: 1;
  position: relative;
  height: 40px;
  display: flex;
  align-items: center;
}

.gantt-bar {
  position: absolute;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.gantt-bar:hover {
  opacity: 0.8;
  transform: scaleY(1.1);
}
</style>
