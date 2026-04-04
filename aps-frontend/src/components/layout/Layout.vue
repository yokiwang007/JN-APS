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

      <!-- 多标签页 -->
      <div class="layout-tabs">
        <TabsView />
      </div>

      <!-- 内容区 -->
      <el-main class="layout-main">
        <router-view :key="route.fullPath" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import TabsView from './TabsView.vue'
import { useLayoutStore } from '@/stores/layout'

const route = useRoute()
const layoutStore = useLayoutStore()
const sidebarWidth = computed(() => layoutStore.sidebarWidth)

// 监听路由变化,自动添加标签页
watch(
  () => route.path,
  (newPath) => {
    // 获取路由元信息
    const meta = route.meta || {}
    const title = meta.title || route.name || '未知页面'
    const icon = meta.icon || null

    // 添加标签页
    layoutStore.addTab({
      path: newPath,
      title: title,
      icon: icon
    })
  },
  { immediate: true }
)
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  position: relative;
  z-index: 20;
  flex-shrink: 0;
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

.layout-tabs {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.layout-main {
  position: relative;
  z-index: 1;
  min-width: 0;
  background: #f0f2f5;
  padding: 20px;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
