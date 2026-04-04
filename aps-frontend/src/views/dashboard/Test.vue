<template>
  <div class="test-page">
    <h1>测试页面</h1>
    <p>如果您能看到这个页面,说明路由工作正常!</p>
    <el-button type="primary" @click="handleClick">点击测试</el-button>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

const handleClick = () => {
  ElMessage.success('按钮点击成功!')
}
</script>

<style scoped>
.test-page {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
}
</style>
