<template>
  <div class="header">
    <!-- 左侧区域 -->
    <div class="header-left">
      <!-- 收缩按钮 -->
      <el-icon 
        class="collapse-btn" 
        @click="toggleSidebar"
        :aria-label="isCollapsed ? '展开菜单' : '收缩菜单'"
      >
        <Fold v-if="!isCollapsed" />
        <Expand v-else />
      </el-icon>
      
      <!-- 面包屑 -->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <!-- 右侧操作区 -->
    <div class="header-right">
      <!-- 重置数据 -->
      <el-button type="primary" size="small" @click="handleReset">
        <el-icon><RefreshRight /></el-icon>
        重置数据
      </el-button>
      
      <!-- 用户信息 -->
      <el-dropdown>
        <span class="user-info">
          <el-avatar :size="32" icon="UserFilled" />
          <span class="user-name">计划员-王斌</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人设置</el-dropdown-item>
            <el-dropdown-item divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshRight, Fold, Expand } from '@element-plus/icons-vue'
import { resetData } from '../../utils/api'
import { useLayoutStore } from '@/stores/layout'

const route = useRoute()
const layoutStore = useLayoutStore()

const currentTitle = computed(() => route.meta.title || '首页')
const isCollapsed = computed(() => layoutStore.isCollapsed)

const toggleSidebar = () => {
  layoutStore.toggleSidebar()
}

const handleReset = async () => {
  try {
    await ElMessageBox.confirm('确定要重置所有数据吗？这将恢复初始演示数据。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const result = resetData()
    if (result.code === 'SUCCESS') {
      ElMessage.success('数据已重置')
      // 刷新页面
      window.location.reload()
    }
  } catch (error) {
    // 用户取消
  }
}
</script>

<style scoped>
.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #333;
  transition: color 0.3s;
}

.collapse-btn:hover {
  color: #1890ff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-name {
  font-size: 14px;
  color: #333;
}
</style>
