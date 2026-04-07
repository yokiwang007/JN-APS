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
      <!-- API模式切换 -->
      <el-dropdown @command="handleModeChange" trigger="click">
        <el-button :type="isMockMode ? 'info' : 'success'" size="small">
          <el-icon><Connection v-if="!isMockMode" /><DataLine v-else /></el-icon>
          {{ isMockMode ? '模拟数据模式' : '真实API模式' }}
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="mock" :disabled="isMockMode">
              <el-icon><DataLine /></el-icon>
              模拟数据模式
            </el-dropdown-item>
            <el-dropdown-item command="api" :disabled="!isMockMode">
              <el-icon><Connection /></el-icon>
              真实API模式
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 重置数据 -->
      <el-button type="primary" size="small" @click="handleReset" :disabled="!isMockMode">
        <el-icon><RefreshRight /></el-icon>
        重置数据
      </el-button>

      <!-- API状态指示 -->
      <div class="api-status" v-if="!isMockMode">
        <el-tag :type="apiStatus.type" size="small">
          {{ apiStatus.text }}
        </el-tag>
      </div>

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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { RefreshRight, Fold, Expand, Connection, DataLine, ArrowDown } from '@element-plus/icons-vue'
import { resetData } from '../../utils/api-unified'
import { setApiMode, isMockMode as checkMockMode } from '../../utils/config'
import { healthCheckApi as healthCheck } from '../../utils/api-client'
import { useLayoutStore } from '@/stores/layout'

const route = useRoute()
const layoutStore = useLayoutStore()

const currentTitle = computed(() => route.meta.title || '首页')
const isCollapsed = computed(() => layoutStore.isCollapsed)
const isMockMode = checkMockMode()

// API状态
const apiStatus = ref({
  type: 'info',
  text: '检测中...'
})

// 检查API连接状态
const checkApiStatus = async () => {
  if (isMockMode) {
    apiStatus.value = { type: 'info', text: '模拟数据' }
    return
  }

  try {
    await healthCheck()
    apiStatus.value = { type: 'success', text: 'API连接正常' }
  } catch (error) {
    apiStatus.value = { type: 'danger', text: 'API连接失败' }
    ElMessage.warning('后端API连接失败,请确保后端服务已启动')
  }
}

// 切换API模式
const handleModeChange = async (mode) => {
  if (mode === 'api') {
    try {
      await ElMessageBox.confirm(
        '切换到真实API模式将连接后端服务器,确保后端服务已启动。\n\n当前模式: 模拟数据\n目标模式: 真实API',
        '切换API模式',
        {
          confirmButtonText: '确定切换',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      // 先检查API连接
      try {
        await healthCheck()
        setApiMode('api')
      } catch (error) {
        ElMessageBox.alert(
          '无法连接到后端API服务器!\n\n请确保:\n1. 后端服务已启动:\n   cd aps-backend\n   PORT=3002 DB_HOST=localhost DB_PORT=3306 DB_NAME=aps_db DB_USER=root DB_PASSWORD=jienor0803 NODE_ENV=development node src/app.js\n\n2. API地址配置正确: http://localhost:3002\n3. 数据库连接正常',
          '连接失败',
          {
            type: 'error',
            confirmButtonText: '我知道了'
          }
        )
        return
      }
    } catch (error) {
      // 用户取消
    }
  } else {
    try {
      await ElMessageBox.confirm(
        '切换到模拟数据模式将使用本地存储数据,不会连接后端服务器。\n\n当前模式: 真实API\n目标模式: 模拟数据',
        '切换API模式',
        {
          confirmButtonText: '确定切换',
          cancelButtonText: '取消',
          type: 'info'
        }
      )
      setApiMode('mock')
    } catch (error) {
      // 用户取消
    }
  }
}

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

// 组件挂载时检查API状态
onMounted(() => {
  checkApiStatus()
  // 定期检查API状态(每30秒)
  setInterval(checkApiStatus, 30000)
})
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

.api-status {
  display: flex;
  align-items: center;
}
</style>
