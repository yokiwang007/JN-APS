<template>
  <div class="production-instruction">
    <el-page-header @back="goBack" content="生产指令" style="margin-bottom: 20px" />
    
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>指令信息</span>
          <el-tag type="success">已下发</el-tag>
        </div>
      </template>
      
      <el-descriptions :column="3" border>
        <el-descriptions-item label="指令编号">INS{{ Date.now() }}</el-descriptions-item>
        <el-descriptions-item label="批次号">{{ batchNo }}</el-descriptions-item>
        <el-descriptions-item label="下发时间">{{ new Date().toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="MES指令ID">MES{{ Date.now() }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag type="success">已接收</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行状态">
          <el-tag type="warning">生产中</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
    
    <!-- 板件指令列表 -->
    <el-card shadow="never" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>板件指令列表</span>
          <el-button type="primary" size="small" @click="exportInstructions">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </template>
      
      <el-table :data="panelInstructions" stripe max-height="500">
        <el-table-column prop="panelNo" label="板件号" width="200" />
        <el-table-column prop="orderNo" label="订单号" width="160" />
        <el-table-column prop="panelType" label="部件类型" width="100" />
        <el-table-column label="尺寸" width="150">
          <template #default="{ row }">
            {{ row.length }} × {{ row.width }} mm
          </template>
        </el-table-column>
        <el-table-column label="工艺路径" width="200">
          <template #default="{ row }">
            {{ row.processRoute.join(' → ') }}
          </template>
        </el-table-column>
        <el-table-column label="加工参数">
          <template #default>
            <el-tag size="small">标准参数</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="设备" width="120">
          <template #default>
            <el-tag size="small" type="info">自动分配</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    
    <!-- 工序详情 -->
    <el-card shadow="never" style="margin-top: 20px">
      <template #header>
        <span>工序执行详情</span>
      </template>
      
      <el-steps :active="2" align-center>
        <el-step title="开料" description="已完成" status="success" />
        <el-step title="封边" description="进行中" status="process" />
        <el-step title="钻孔" description="待执行" />
        <el-step title="质检" description="待执行" />
      </el-steps>
      
      <el-divider />
      
      <el-timeline style="margin-top: 20px">
        <el-timeline-item timestamp="2小时前" type="success">
          <el-card shadow="hover">
            <div style="font-weight: bold">开料工序完成</div>
            <div style="font-size: 12px; color: #909399; margin-top: 8px">
              设备: 电子锯1 | 操作员: 张三 | 完成数量: 120件
            </div>
          </el-card>
        </el-timeline-item>
        
        <el-timeline-item timestamp="进行中" type="primary">
          <el-card shadow="hover">
            <div style="font-weight: bold">封边工序进行中</div>
            <div style="font-size: 12px; color: #909399; margin-top: 8px">
              设备: 封边机1 | 操作员: 李四 | 当前进度: 45%
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { getBatchDetail } from '../../utils/api'

const route = useRoute()
const router = useRouter()

const batchNo = ref('')
const panelInstructions = ref([])

// 返回
const goBack = () => {
  router.back()
}

// 导出指令
const exportInstructions = () => {
  ElMessage.success('导出功能开发中')
}

// 加载数据
const loadData = async () => {
  batchNo.value = route.params.id
  
  // 获取批次详情
  const result = await getBatchDetail(batchNo.value)
  if (result.code === 'SUCCESS') {
    panelInstructions.value = result.data.panels || []
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.production-instruction {
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
