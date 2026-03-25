<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarWidth" class="layout-aside">
      <Sidebar />
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航 -->
      <el-header height="60px" class="layout-header">
        <Header />
      </el-header>
      
      <!-- 内容区 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import { useLayoutStore } from '@/stores/layout'

const layoutStore = useLayoutStore()
const sidebarWidth = computed(() => layoutStore.sidebarWidth)
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background: #001529;
  overflow: hidden;
  transition: width 0.3s ease;
}

.layout-header {
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 20px;
  display: flex;
  align-items: center;
}

.layout-main {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
