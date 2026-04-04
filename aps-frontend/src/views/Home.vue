<template>
  <div style="padding: 20px;">
    <h1>Hello World!</h1>
    <p>如果您能看到这个页面,说明Vue应用正常运行!</p>
    <el-button type="primary" @click="handleClick">点击测试</el-button>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'

const handleClick = () => {
  ElMessage.success('测试成功!')
}
</script>
