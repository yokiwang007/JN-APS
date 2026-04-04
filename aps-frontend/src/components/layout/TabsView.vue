<template>
  <div class="tabs-view">
    <div class="tabs-scroll">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        class="tab-item"
        :class="{ 'tab-item--active': activeTab === tab.path }"
        @click="handleTabClick(tab.path)"
      >
        <el-icon v-if="tab.icon && getIconComponent(tab.icon)" class="tab-icon">
          <component :is="getIconComponent(tab.icon)" />
        </el-icon>
        <span class="tab-title">{{ tab.title }}</span>
        <el-icon
          class="tab-close"
          @click.stop="handleTabClose(tab.path, $event)"
        >
          <Close />
        </el-icon>
      </div>
    </div>

    <div class="tabs-actions">
      <el-dropdown @command="handleCommand">
        <el-icon class="tabs-action-icon">
          <ArrowDown />
        </el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="closeOthers">关闭其他</el-dropdown-item>
            <el-dropdown-item command="closeAll">关闭所有</el-dropdown-item>
            <el-dropdown-item command="closeLeft" divided>关闭左侧</el-dropdown-item>
            <el-dropdown-item command="closeRight">关闭右侧</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import {
  Close,
  ArrowDown,
  DataBoard,
  Clock,
  List,
  TrendCharts,
  Tickets,
  Document,
  Scissor,
  Notebook,
  DocumentChecked,
  Setting,
  Grid,
  Operation,
  Files,
  MagicStick,
  View,
  Edit,
  DataAnalysis,
  Tools,
  Odometer,
  Connection,
  Calendar,
  DocumentCopy,
  Monitor,
  PieChart,
  Box
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const layoutStore = useLayoutStore()

const tabs = computed(() => layoutStore.tabs)
const activeTab = computed(() => layoutStore.activeTab)

// 图标映射
const iconMap = {
  DataBoard,
  Clock,
  List,
  TrendCharts,
  Tickets,
  Document,
  Scissor,
  Notebook,
  DocumentChecked,
  Setting,
  Grid,
  Operation,
  Files,
  MagicStick,
  View,
  Edit,
  DataAnalysis,
  Tools,
  Odometer,
  Connection,
  Calendar,
  DocumentCopy,
  Monitor,
  PieChart,
  Box
}

// 获取图标组件
const getIconComponent = (iconName) => {
  return iconMap[iconName] || null
}

// 点击标签页
const handleTabClick = (path) => {
  layoutStore.setActiveTab(path)
  router.push(path)
}

// 关闭标签页
const handleTabClose = (path, event) => {
  event.stopPropagation()
  layoutStore.removeTab(path)
  // 如果关闭的是当前路由,跳转到激活的标签页
  if (route.path === path && activeTab.value) {
    router.push(activeTab.value)
  }
}

// 下拉菜单命令
const handleCommand = (command) => {
  const currentPath = activeTab.value
  switch (command) {
    case 'closeOthers':
      layoutStore.closeOtherTabs(currentPath)
      break
    case 'closeAll':
      layoutStore.closeAllTabs()
      router.push('/dashboard')
      break
    case 'closeLeft':
      layoutStore.closeLeftTabs(currentPath)
      break
    case 'closeRight':
      layoutStore.closeRightTabs(currentPath)
      break
  }
}
</script>

<style scoped>
.tabs-view {
  display: flex;
  align-items: center;
  height: 40px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.tabs-scroll {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs-scroll::-webkit-scrollbar {
  display: none;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 32px;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  user-select: none;
  font-size: 13px;
  color: #666;
  border: 1px solid transparent;
}

.tab-item:hover {
  background: #e8e8e8;
  color: #333;
}

.tab-item--active {
  background: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.tab-item--active:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}

.tab-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-close {
  font-size: 12px;
  padding: 2px;
  border-radius: 2px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

.tab-item--active .tab-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tabs-actions {
  flex-shrink: 0;
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid #e8e8e8;
}

.tabs-action-icon {
  font-size: 16px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s ease;
}

.tabs-action-icon:hover {
  color: #1890ff;
}
</style>
