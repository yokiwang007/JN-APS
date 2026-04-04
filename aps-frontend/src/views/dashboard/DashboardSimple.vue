<template>
  <div class="dashboard-simple">
    <h1>综合看板</h1>
    <p>这是简化版的综合看板页面</p>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <div class="metric">
            <div class="metric-value">25</div>
            <div class="metric-label">待排程</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="metric">
            <div class="metric-value">18</div>
            <div class="metric-label">待揉单</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="metric">
            <div class="metric-value">8</div>
            <div class="metric-label">待齐套</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="metric">
            <div class="metric-value">3</div>
            <div class="metric-label">交期预警</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>产能负荷</span>
          </template>
          <div class="capacity-list">
            <div class="capacity-item">
              <span>柜体A线</span>
              <el-progress :percentage="85" />
            </div>
            <div class="capacity-item">
              <span>柜体B线</span>
              <el-progress :percentage="72" />
            </div>
            <div class="capacity-item">
              <span>门板线</span>
              <el-progress :percentage="68" />
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>订单状态</span>
          </template>
          <el-table :data="orderStats" style="width: 100%">
            <el-table-column prop="status" label="状态" />
            <el-table-column prop="count" label="数量" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const orderStats = ref([
  { status: '待拆解', count: 12 },
  { status: '已拆解', count: 25 },
  { status: '已排程', count: 45 },
  { status: '生产中', count: 38 },
  { status: '已完成', count: 10 }
])
</script>

<style scoped>
.dashboard-simple {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.dashboard-simple h1 {
  margin-bottom: 20px;
}

.metric {
  text-align: center;
  padding: 20px 0;
}

.metric-value {
  font-size: 32px;
  font-weight: 600;
  color: #409EFF;
  margin-bottom: 10px;
}

.metric-label {
  font-size: 14px;
  color: #606266;
}

.capacity-list {
  padding: 10px 0;
}

.capacity-item {
  margin-bottom: 20px;
}

.capacity-item span {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}
</style>
