import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    isCollapsed: false,
    // 多标签页配置
    tabs: [],
    activeTab: ''
  }),

  getters: {
    sidebarWidth: (state) => state.isCollapsed ? '64px' : '220px'
  },

  actions: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed
    },
    setCollapsed(collapsed) {
      this.isCollapsed = collapsed
    },

    // 添加标签页
    addTab(tab) {
      // 检查是否已存在该标签页
      const existingTab = this.tabs.find(t => t.path === tab.path)
      if (!existingTab) {
        this.tabs.push(tab)
      }
      // 设置为激活状态
      this.activeTab = tab.path
    },

    // 移除标签页
    removeTab(path) {
      const index = this.tabs.findIndex(t => t.path === path)
      if (index > -1) {
        this.tabs.splice(index, 1)
        // 如果移除的是当前激活的标签页,激活前一个标签页
        if (this.activeTab === path) {
          if (this.tabs.length > 0) {
            this.activeTab = this.tabs[Math.max(0, index - 1)].path
          } else {
            this.activeTab = ''
          }
        }
      }
    },

    // 关闭其他标签页
    closeOtherTabs(path) {
      this.tabs = this.tabs.filter(t => t.path === path)
      this.activeTab = path
    },

    // 关闭所有标签页
    closeAllTabs() {
      this.tabs = []
      this.activeTab = ''
    },

    // 关闭左侧标签页
    closeLeftTabs(path) {
      const index = this.tabs.findIndex(t => t.path === path)
      if (index > -1) {
        this.tabs = this.tabs.slice(index)
      }
    },

    // 关闭右侧标签页
    closeRightTabs(path) {
      const index = this.tabs.findIndex(t => t.path === path)
      if (index > -1) {
        this.tabs = this.tabs.slice(0, index + 1)
      }
    },

    // 激活标签页
    setActiveTab(path) {
      this.activeTab = path
    }
  }
})
