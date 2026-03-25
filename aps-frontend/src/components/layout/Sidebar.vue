<template>
  <div class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <img src="@/logo/jienor.png" alt="Logo" class="logo-image" />
      <transition name="fade">
        <h1 v-show="!isCollapsed">杰诺家居云-APS</h1>
      </transition>
    </div>
    
    <!-- 菜单 -->
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      background-color="#001529"
      text-color="#fff"
      active-text-color="#1890ff"
      :collapse="isCollapsed"
      router
    >
      <!-- 订单预处理 -->
      <el-sub-menu index="order">
        <template #title>
          <el-icon><Document /></el-icon>
          <span>订单预处理</span>
        </template>
        <el-menu-item index="/order/list">订单列表</el-menu-item>
        <el-menu-item index="/order/preprocess-result">预处理结果</el-menu-item>
      </el-sub-menu>
      
      <!-- 批次规划 -->
      <el-sub-menu index="batch">
        <template #title>
          <el-icon><Grid /></el-icon>
          <span>批次规划</span>
        </template>
        <el-menu-item index="/batch/plan">批次规划</el-menu-item>
        <el-menu-item index="/batch/list">批次列表</el-menu-item>
      </el-sub-menu>
      
      <!-- 排程优化 -->
      <el-sub-menu index="schedule">
        <template #title>
          <el-icon><Calendar /></el-icon>
          <span>排程优化</span>
        </template>
        <el-menu-item index="/schedule/optimize">排程优化</el-menu-item>
        <el-menu-item index="/schedule/list">排程列表</el-menu-item>
      </el-sub-menu>
      
      <!-- 监控调整 -->
      <el-sub-menu index="monitor">
        <template #title>
          <el-icon><Monitor /></el-icon>
          <span>监控调整</span>
        </template>
        <el-menu-item index="/monitor/dashboard">监控看板</el-menu-item>
        <el-menu-item index="/monitor/adjust">排程调整</el-menu-item>
        <el-menu-item index="/monitor/capacity">产能分析</el-menu-item>
      </el-sub-menu>
      
      <!-- 策略配置 -->
      <el-sub-menu index="strategy">
        <template #title>
          <el-icon><Setting /></el-icon>
          <span>策略配置</span>
        </template>
        <el-menu-item index="/strategy/list">策略列表</el-menu-item>
      </el-sub-menu>
      
      <!-- 产能管理 -->
      <el-sub-menu index="capacity">
        <template #title>
          <el-icon><Operation /></el-icon>
          <span>产能管理</span>
        </template>
        <el-menu-item index="/capacity/production-line">产线管理</el-menu-item>
        <el-menu-item index="/capacity/process-route">工艺路线</el-menu-item>
        <el-menu-item index="/capacity/work-calendar">工作日历</el-menu-item>
        <el-menu-item index="/capacity/equipment">设备配置</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Document, Grid, Calendar, Monitor, Setting, Operation } from '@element-plus/icons-vue'
import { useLayoutStore } from '@/stores/layout'

const route = useRoute()
const layoutStore = useLayoutStore()
const activeMenu = computed(() => route.path)
const isCollapsed = computed(() => layoutStore.isCollapsed)
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #002140;
  padding: 0 12px;
  gap: 12px;
}

.logo-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
  flex-shrink: 0;
}

.sidebar-logo h1 {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-menu {
  border: none;
  flex: 1;
  overflow-y: auto;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
