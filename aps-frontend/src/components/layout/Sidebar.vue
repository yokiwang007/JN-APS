<template>
  <div class="sidebar">
    <div class="sidebar-logo">
      <img src="@/logo/jienor.png" alt="Logo" class="logo-image" />
      <transition name="fade">
        <h1 v-show="!isCollapsed">杰诺家居云-APS</h1>
      </transition>
    </div>

    <!--
      不使用 el-menu-item 绑 @click：Element Plus 的 menu-item 用 render 写死 li 的 onClick，
      不会合并父组件传入的监听器，导致 navigate 永远不执行。
      改用 RouterLink，路由一定可用；样式贴近原深色侧栏。
    -->
    <nav class="side-nav" :class="{ 'side-nav--collapsed': isCollapsed }">
      <!-- 综合看板 -->
      <RouterLink to="/dashboard" class="nav-item" active-class="nav-item--active">
        <el-icon class="nav-icon"><DataBoard /></el-icon>
        <span v-show="!isCollapsed" class="nav-text">综合看板</span>
      </RouterLink>

      <!-- 订单管理 -->
      <div class="nav-section">
        <div
          v-show="!isCollapsed"
          class="nav-section-header"
          :class="{ 'nav-section-header--collapsed': !sectionStates.order }"
          @click="toggleSection('order')"
        >
          <span class="nav-section-title">订单管理</span>
          <el-icon class="nav-section-icon"><ArrowDown /></el-icon>
        </div>
        <transition name="section-collapse">
          <div v-show="sectionStates.order" class="nav-section-content">
            <RouterLink to="/order/list" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><Tickets /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">订单列表</span>
            </RouterLink>
            <RouterLink to="/order/split" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><Scissor /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">订单拆解</span>
            </RouterLink>
            <RouterLink to="/order/split-rules" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><Notebook /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">拆单规则</span>
            </RouterLink>
            <RouterLink to="/order/preprocess-result" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><DocumentChecked /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">预处理结果</span>
            </RouterLink>
            <RouterLink to="/order/preprocess-rules" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><Setting /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">预处理规则</span>
            </RouterLink>
          </div>
        </transition>
      </div>

      <!-- 粗排程 -->
      <div class="nav-section">
        <div
          v-show="!isCollapsed"
          class="nav-section-header"
          :class="{ 'nav-section-header--collapsed': !sectionStates.coarseSchedule }"
          @click="toggleSection('coarseSchedule')"
        >
          <span class="nav-section-title">粗排程</span>
          <el-icon class="nav-section-icon"><ArrowDown /></el-icon>
        </div>
        <transition name="section-collapse">
          <div v-show="sectionStates.coarseSchedule" class="nav-section-content">
            <RouterLink to="/coarse-schedule/tasks" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><Clock /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">待排程任务</span>
            </RouterLink>
            <RouterLink to="/coarse-schedule/list" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><List /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">排程任务管理</span>
            </RouterLink>
            <RouterLink to="/coarse-schedule/gantt" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><TrendCharts /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">排程甘特图</span>
            </RouterLink>
          </div>
        </transition>
      </div>

      <!-- 批次规划 -->
      <div class="nav-section">
        <div
          v-show="!isCollapsed"
          class="nav-section-header"
          :class="{ 'nav-section-header--collapsed': !sectionStates.batch }"
          @click="toggleSection('batch')"
        >
          <span class="nav-section-title">批次规划</span>
          <el-icon class="nav-section-icon"><ArrowDown /></el-icon>
        </div>
        <transition name="section-collapse">
          <div v-show="sectionStates.batch" class="nav-section-content">
            <RouterLink to="/batch/merge-rules" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><Operation /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">揉单规则配置</span>
            </RouterLink>
            <RouterLink to="/batch/plan" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><Grid /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">批次规划</span>
            </RouterLink>
          </div>
        </transition>
      </div>

      <!-- 细排程 -->
      <div class="nav-section">
        <div
          v-show="!isCollapsed"
          class="nav-section-header"
          :class="{ 'nav-section-header--collapsed': !sectionStates.schedule }"
          @click="toggleSection('schedule')"
        >
          <span class="nav-section-title">细排程</span>
          <el-icon class="nav-section-icon"><ArrowDown /></el-icon>
        </div>
        <transition name="section-collapse">
          <div v-show="sectionStates.schedule" class="nav-section-content">
            <RouterLink to="/schedule/batches" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><Files /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">待排程批次</span>
            </RouterLink>
            <RouterLink to="/schedule/optimization" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><MagicStick /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">开料优化</span>
            </RouterLink>
          </div>
        </transition>
      </div>

      <!-- 生产执行 -->
      <div class="nav-section">
        <div
          v-show="!isCollapsed"
          class="nav-section-header"
          :class="{ 'nav-section-header--collapsed': !sectionStates.production }"
          @click="toggleSection('production')"
        >
          <span class="nav-section-title">生产执行</span>
          <el-icon class="nav-section-icon"><ArrowDown /></el-icon>
        </div>
        <transition name="section-collapse">
          <div v-show="sectionStates.production" class="nav-section-content">
            <RouterLink to="/production/orders" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><DocumentCopy /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">生产工单</span>
            </RouterLink>
            <RouterLink to="/production/tracking" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><Monitor /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">在制品追踪</span>
            </RouterLink>
          </div>
        </transition>
      </div>

      <!-- 齐套管理 -->
      <div class="nav-section">
        <div
          v-show="!isCollapsed"
          class="nav-section-header"
          :class="{ 'nav-section-header--collapsed': !sectionStates.fulfillment }"
          @click="toggleSection('fulfillment')"
        >
          <span class="nav-section-title">齐套管理</span>
          <el-icon class="nav-section-icon"><ArrowDown /></el-icon>
        </div>
        <transition name="section-collapse">
          <div v-show="sectionStates.fulfillment" class="nav-section-content">
            <RouterLink to="/fulfillment/dashboard" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><PieChart /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">齐套看板</span>
            </RouterLink>
            <RouterLink to="/fulfillment/slots" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><Box /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">齐套货位管理</span>
            </RouterLink>
          </div>
        </transition>
      </div>

      <!-- 监控调整 -->
      <div class="nav-section">
        <div
          v-show="!isCollapsed"
          class="nav-section-header"
          :class="{ 'nav-section-header--collapsed': !sectionStates.monitor }"
          @click="toggleSection('monitor')"
        >
          <span class="nav-section-title">监控调整</span>
          <el-icon class="nav-section-icon"><ArrowDown /></el-icon>
        </div>
        <transition name="section-collapse">
          <div v-show="sectionStates.monitor" class="nav-section-content">
            <RouterLink to="/monitor/dashboard" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><View /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">监控看板</span>
            </RouterLink>
            <RouterLink to="/monitor/adjust" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><Edit /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">排程调整</span>
            </RouterLink>
            <RouterLink to="/monitor/capacity" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><DataAnalysis /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">产能分析</span>
            </RouterLink>
          </div>
        </transition>
      </div>

      <!-- 策略配置 -->
      <div class="nav-section">
        <div
          v-show="!isCollapsed"
          class="nav-section-header"
          :class="{ 'nav-section-header--collapsed': !sectionStates.strategy }"
          @click="toggleSection('strategy')"
        >
          <span class="nav-section-title">策略配置</span>
          <el-icon class="nav-section-icon"><ArrowDown /></el-icon>
        </div>
        <transition name="section-collapse">
          <div v-show="sectionStates.strategy" class="nav-section-content">
            <RouterLink to="/strategy/list" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><Tools /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">策略列表</span>
            </RouterLink>
          </div>
        </transition>
      </div>

      <!-- 产能管理 -->
      <div class="nav-section">
        <div
          v-show="!isCollapsed"
          class="nav-section-header"
          :class="{ 'nav-section-header--collapsed': !sectionStates.capacity }"
          @click="toggleSection('capacity')"
        >
          <span class="nav-section-title">产能管理</span>
          <el-icon class="nav-section-icon"><ArrowDown /></el-icon>
        </div>
        <transition name="section-collapse">
          <div v-show="sectionStates.capacity" class="nav-section-content">
            <RouterLink to="/capacity/production-line" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><Odometer /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">标准产能设置</span>
            </RouterLink>
            <RouterLink to="/capacity/process-route" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><Connection /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">生产周期设置</span>
            </RouterLink>
            <RouterLink to="/capacity/work-calendar" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><Calendar /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">工作日历</span>
            </RouterLink>
            <RouterLink to="/capacity/equipment" class="nav-item nav-item--sub" active-class="nav-item--active">
              <el-icon class="nav-icon"><Setting /></el-icon>
              <span v-show="!isCollapsed" class="nav-text">设备配置</span>
            </RouterLink>
          </div>
        </transition>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import {
  DataBoard,
  Tickets,
  Scissor,
  Notebook,
  DocumentChecked,
  Setting,
  Grid,
  Operation,
  Clock,
  List,
  TrendCharts,
  MagicStick,
  Files,
  DocumentCopy,
  Monitor,
  PieChart,
  Box,
  View,
  Edit,
  DataAnalysis,
  Tools,
  Odometer,
  Connection,
  Calendar,
  ArrowDown
} from '@element-plus/icons-vue'
import { useLayoutStore } from '@/stores/layout'

const layoutStore = useLayoutStore()
const isCollapsed = computed(() => layoutStore.isCollapsed)

// 分组展开/收缩状态
const sectionStates = reactive({
  order: true,           // 订单管理默认展开
  coarseSchedule: false, // 粗排程默认收缩
  batch: false,          // 批次规划默认收缩
  schedule: false,       // 细排程默认收缩
  production: false,     // 生产执行默认收缩
  fulfillment: false,    // 齐套管理默认收缩
  monitor: false,        // 监控调整默认收缩
  strategy: false,       // 策略配置默认收缩
  capacity: false        // 产能管理默认收缩
})

// 切换分组展开/收缩状态
const toggleSection = (sectionKey) => {
  sectionStates[sectionKey] = !sectionStates[sectionKey]
}
</script>

<style scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #002140 0%, #001529 100%);
}

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #002140;
  padding: 0 16px;
  gap: 12px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.side-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 0 20px;
  background-color: #001529;
}

/* 自定义滚动条样式 */
.side-nav::-webkit-scrollbar {
  width: 6px;
}

.side-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.side-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.side-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.side-nav--collapsed .nav-item {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.nav-section {
  margin-top: 8px;
}

.nav-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 12px 20px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  border-radius: 6px;
  margin: 0 12px;
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border-left: 3px solid transparent;
}

.nav-section-header:hover {
  background: rgba(255, 255, 255, 0.08);
  border-left-color: rgba(24, 144, 255, 0.5);
  transform: translateX(2px);
}

.nav-section-header--collapsed .nav-section-icon {
  transform: rotate(-90deg);
}

.nav-section-title {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  position: relative;
  padding-left: 12px;
}

.nav-section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: rgba(24, 144, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(24, 144, 255, 0.6);
}

.nav-section-header:hover .nav-section-title {
  color: rgba(255, 255, 255, 0.95);
}

.nav-section-header:hover .nav-section-title::before {
  background: #1890ff;
  box-shadow: 0 0 8px rgba(24, 144, 255, 0.8);
}

.nav-section-icon {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
  transition: all 0.3s ease;
}

.nav-section-header:hover .nav-section-icon {
  color: rgba(255, 255, 255, 0.85);
}

.nav-section-content {
  overflow: hidden;
  padding: 4px 0;
}

/* 折叠动画 */
.section-collapse-enter-active,
.section-collapse-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  opacity: 1;
}

.section-collapse-enter-from,
.section-collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 48px;
  padding: 0 20px;
  margin: 2px 12px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: #1890ff;
  border-radius: 0 2px 2px 0;
  transition: height 0.2s ease;
}

.nav-item--active::before {
  height: 60%;
}

.nav-item--sub {
  height: 40px;
  padding-left: 32px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  transform: translateX(2px);
}

.nav-item--active {
  background: linear-gradient(90deg, rgba(24, 144, 255, 0.2) 0%, rgba(24, 144, 255, 0.1) 100%) !important;
  color: #fff !important;
  font-weight: 500;
}

.nav-icon {
  font-size: 18px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
}

.nav-text {
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
