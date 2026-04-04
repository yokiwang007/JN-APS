<template>
  <div>
    <h1>数据测试页面</h1>
    <el-button @click="testData">测试数据生成</el-button>
    <div v-if="testResult">
      <h2>测试结果</h2>
      <pre>{{ testResult }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { initializeExtendedData } from '@/utils/mock-extended.js'

const testResult = ref(null)

const testData = () => {
  try {
    console.log('🔄 开始测试数据生成...')
    const data = initializeExtendedData()
    console.log('✅ 数据生成成功')
    console.log('📦 数据结构:', Object.keys(data))

    testResult.value = {
      success: true,
      keys: Object.keys(data),
      counts: {
        erp_sales_orders: data.erp_sales_orders?.length || 0,
        cad_bom_parts: data.cad_bom_parts?.length || 0,
        aps_production_orders: data.aps_production_orders?.length || 0,
        sys_work_centers: data.sys_work_centers?.length || 0,
        aps_schedule_tasks: data.aps_schedule_tasks?.length || 0,
        aps_merge_batches: data.aps_merge_batches?.length || 0,
        aps_batch_details: data.aps_batch_details?.length || 0,
        cam_cutting_patterns: data.cam_cutting_patterns?.length || 0,
        mes_production_orders: data.mes_production_orders?.length || 0,
        mes_wip_tracking: data.mes_wip_tracking?.length || 0,
        mes_sorting_slots: data.mes_sorting_slots?.length || 0,
        mes_fulfillment_details: data.mes_fulfillment_details?.length || 0
      },
      sample: {
        sys_work_centers: data.sys_work_centers?.[0] || null,
        aps_schedule_tasks: data.aps_schedule_tasks?.[0] || null
      }
    }

    console.log('✅ 测试结果:', testResult.value)
  } catch (error) {
    console.error('❌ 数据生成失败:', error)
    testResult.value = {
      success: false,
      error: error.message,
      stack: error.stack
    }
  }
}
</script>

<style scoped>
pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
