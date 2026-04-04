<template>
  <div class="cutting-optimization">
    <el-card class="toolbar-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-button type="primary" :icon="Cpu" @click="handleOptimize">
            开始优化
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="Setting" @click="handleShowSettings">
            参数设置
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="Download" @click="handleExport">
            导出方案
          </el-button>
        </el-col>
        <el-col :span="6">
          <el-button :icon="Refresh" @click="loadData">
            刷新
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 优化结果概览 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">板材利用率</div>
            <div class="stat-value">{{ optimizationStats.utilization }}%</div>
            <div class="stat-trend">
              <el-icon class="stat-icon-up"><TrendCharts /></el-icon>
              <span>较上次 +{{ optimizationStats.utilization_improvement }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">板材消耗</div>
            <div class="stat-value">{{ optimizationStats.board_count }}张</div>
            <div class="stat-trend">
              <el-icon class="stat-icon-down"><TrendCharts /></el-icon>
              <span>较上次 -{{ optimizationStats.board_saved }}张</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">优化时间</div>
            <div class="stat-value">{{ optimizationStats.optimization_time }}s</div>
            <div class="stat-trend">
              <el-icon class="stat-icon-up"><Clock /></el-icon>
              <span>快速优化算法</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">方案评分</div>
            <div class="stat-value">{{ optimizationStats.score }}</div>
            <div class="stat-trend">
              <el-icon class="stat-icon-up"><Star /></el-icon>
              <span>综合评分</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 排版图展示 -->
    <el-card class="pattern-card">
      <template #header>
        <div class="card-header">
          <span>排版图</span>
          <div>
            <el-tag type="info">共 {{ cuttingPatterns.length }} 张板材</el-tag>
            <el-radio-group v-model="viewMode" size="small" style="margin-left: 10px;">
              <el-radio-button value="grid">网格</el-radio-button>
              <el-radio-button value="list">列表</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="pattern-grid">
        <div
          v-for="pattern in cuttingPatterns"
          :key="pattern.pattern_id"
          class="pattern-item"
          @click="handleViewPattern(pattern)"
        >
          <div class="pattern-header">
            <span class="pattern-title">{{ pattern.pattern_id }}</span>
            <el-tag size="small" type="success">{{ pattern.utilization }}%</el-tag>
          </div>
          <div class="pattern-body">
            <div class="pattern-canvas">
              <!-- 模拟排版图 -->
              <div class="pattern-board">
                <div
                  v-for="(part, index) in pattern.parts"
                  :key="index"
                  class="pattern-part"
                  :style="{
                    left: part.x + '%',
                    top: part.y + '%',
                    width: part.width + '%',
                    height: part.height + '%',
                    backgroundColor: part.color
                  }"
                />
              </div>
            </div>
          </div>
          <div class="pattern-footer">
            <span>{{ pattern.parts.length }} 个部件</span>
            <span>{{ pattern.material_info }}</span>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <el-table v-else :data="cuttingPatterns" stripe>
        <el-table-column prop="pattern_id" label="排版图号" width="130" />
        <el-table-column prop="batch_id" label="所属批次" width="130" />
        <el-table-column prop="board_size" label="板材尺寸" width="120" />
        <el-table-column prop="utilization" label="利用率" width="100" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="row.utilization"
              :color="getUtilizationColor(row.utilization)"
              :stroke-width="12"
            />
          </template>
        </el-table-column>
        <el-table-column prop="parts_count" label="部件数" width="80" align="center" />
        <el-table-column prop="material_info" label="材质" width="150" />
        <el-table-column prop="thickness" label="厚度" width="80" align="center">
          <template #default="{ row }">
            {{ row.thickness }}mm
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleViewPattern(row)">
              查看
            </el-button>
            <el-button type="success" size="small" link @click="handlePrint(row)">
              打印
            </el-button>
            <el-button type="warning" size="small" link @click="handleDownload(row)">
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 参数设置对话框 -->
    <el-dialog v-model="settingsVisible" title="优化参数设置" width="600px">
      <el-form :model="settings" label-width="140px">
        <el-form-item label="优化算法">
          <el-select v-model="settings.algorithm" style="width: 100%">
            <el-option label="智能遗传算法" value="genetic" />
            <el-option label="启发式算法" value="heuristic" />
            <el-option label="贪心算法" value="greedy" />
          </el-select>
        </el-form-item>
        <el-form-item label="切割间距">
          <el-input-number
            v-model="settings.cutter_gap"
            :min="0"
            :max="10"
            controls-position="right"
            style="width: 200px"
          />
          <span style="margin-left: 10px;">mm</span>
        </el-form-item>
        <el-form-item label="最大优化时间">
          <el-input-number
            v-model="settings.max_time"
            :min="10"
            :max="300"
            controls-position="right"
            style="width: 200px"
          />
          <span style="margin-left: 10px;">秒</span>
        </el-form-item>
        <el-form-item label="目标利用率">
          <el-input-number
            v-model="settings.target_utilization"
            :min="70"
            :max="99"
            controls-position="right"
            style="width: 200px"
          />
          <span style="margin-left: 10px;">%</span>
        </el-form-item>
        <el-form-item label="启用旋转优化">
          <el-switch v-model="settings.enable_rotation" />
          <div class="form-tip">允许部件旋转90度以提高利用率</div>
        </el-form-item>
        <el-form-item label="启用余料管理">
          <el-switch v-model="settings.enable_reuse" />
          <div class="form-tip">优先使用余料降低成本</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="settingsVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveSettings">保存</el-button>
      </template>
    </el-dialog>

    <!-- 排版图详情对话框 -->
    <el-dialog v-model="patternDetailVisible" title="排版图详情" width="800px">
      <div v-if="selectedPattern" class="pattern-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="排版图号">
            {{ selectedPattern.pattern_id }}
          </el-descriptions-item>
          <el-descriptions-item label="所属批次">
            {{ selectedPattern.batch_id }}
          </el-descriptions-item>
          <el-descriptions-item label="板材尺寸">
            {{ selectedPattern.board_size }}
          </el-descriptions-item>
          <el-descriptions-item label="利用率">
            <el-tag type="success">{{ selectedPattern.utilization }}%</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="材质">
            {{ selectedPattern.material_info }}
          </el-descriptions-item>
          <el-descriptions-item label="厚度">
            {{ selectedPattern.thickness }}mm
          </el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">部件列表</el-divider>
        <el-table :data="selectedPattern.parts" stripe size="small">
          <el-table-column prop="part_id" label="部件号" width="120" />
          <el-table-column prop="length" label="长度" width="80" />
          <el-table-column prop="width" label="宽度" width="80" />
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column prop="x" label="X坐标" width="80" />
          <el-table-column prop="y" label="Y坐标" width="80" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="patternDetailVisible = false">关闭</el-button>
        <el-button type="primary" @click="handlePrint(selectedPattern)">打印</el-button>
        <el-button type="success" @click="handleDownload(selectedPattern)">下载</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Cpu, Setting, Download, Refresh, TrendCharts, Clock, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { initializeExtendedData } from '@/utils/mock-extended.js'

// 响应式数据
const cuttingPatterns = ref([])
const viewMode = ref('grid')
const settingsVisible = ref(false)
const patternDetailVisible = ref(false)
const selectedPattern = ref(null)

// 优化统计
const optimizationStats = ref({
  utilization: 92,
  utilization_improvement: 3,
  board_count: 45,
  board_saved: 5,
  optimization_time: 12,
  score: 95
})

// 优化参数
const settings = ref({
  algorithm: 'genetic',
  cutter_gap: 3,
  max_time: 60,
  target_utilization: 90,
  enable_rotation: true,
  enable_reuse: true
})

// 初始化数据
const loadData = () => {
  const data = initializeExtendedData()

  // 排版图数据(与批次数据关联)
  cuttingPatterns.value = data.cam_cutting_patterns.map(pattern => {
    // 模拟部件位置
    const parts = []
    let currentX = 0
    let currentY = 0
    
    for (let i = 0; i < pattern.parts_count; i++) {
      const width = Math.floor(Math.random() * 30) + 20 // 20-50%
      const height = Math.floor(Math.random() * 30) + 20 // 20-50%
      
      parts.push({
        part_id: `PART${i + 1}`,
        length: Math.floor(Math.random() * 1000) + 500,
        width: Math.floor(Math.random() * 500) + 200,
        quantity: 1,
        x: currentX,
        y: currentY,
        width_percent: width,
        height_percent: height,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      })
      
      currentX += width
      if (currentX > 70) {
        currentX = 0
        currentY += height
      }
    }

    return {
      ...pattern,
      parts: parts,
      parts_count: parts.length
    }
  })

  console.log('✓ 加载排版图数据:', cuttingPatterns.value.length, '张')
}

// 事件处理
const handleOptimize = () => {
  ElMessage.success('开始优化算法...')

  // 模拟优化过程
  setTimeout(() => {
    optimizationStats.value.utilization = Math.floor(Math.random() * 10) + 90
    optimizationStats.value.board_count = Math.floor(Math.random() * 20) + 40
    optimizationStats.value.optimization_time = Math.floor(Math.random() * 20) + 10
    optimizationStats.value.score = Math.floor(Math.random() * 10) + 90

    ElMessage.success('优化完成!')
  }, 2000)
}

const handleShowSettings = () => {
  settingsVisible.value = true
}

const handleSaveSettings = () => {
  settingsVisible.value = false
  ElMessage.success('参数保存成功')
}

const handleExport = () => {
  ElMessage.success('方案导出中...')
}

const handleViewPattern = (pattern) => {
  selectedPattern.value = pattern
  patternDetailVisible.value = true
}

const handlePrint = (pattern) => {
  ElMessage.success(`打印排版图 ${pattern.pattern_id}`)
}

const handleDownload = (pattern) => {
  ElMessage.success(`下载排版图 ${pattern.pattern_id}`)
}

// 工具函数
const getUtilizationColor = (utilization) => {
  if (utilization >= 90) return '#67C23A'
  if (utilization >= 80) return '#409EFF'
  return '#E6A23C'
}

// 生命周期
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.cutting-optimization {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.toolbar-card {
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-content {
  padding: 10px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 12px;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-icon-up {
  color: #67C23A;
}

.stat-icon-down {
  color: #F56C6C;
}

.pattern-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pattern-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.pattern-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.pattern-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.pattern-header {
  padding: 10px;
  background: #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pattern-title {
  font-weight: bold;
  font-size: 14px;
}

.pattern-body {
  padding: 10px;
}

.pattern-canvas {
  position: relative;
  width: 100%;
  padding-bottom: 75%; /* 4:3 aspect ratio */
  background: #fafafa;
  border: 1px solid #e0e0e0;
}

.pattern-board {
  position: absolute;
  top: 5%;
  left: 5%;
  right: 5%;
  bottom: 5%;
  background: #fff;
  border: 2px solid #333;
}

.pattern-part {
  position: absolute;
  border: 1px solid rgba(0, 0, 0, 0.3);
  opacity: 0.8;
}

.pattern-footer {
  padding: 10px;
  background: #f5f5f5;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
