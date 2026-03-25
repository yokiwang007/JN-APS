import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    isCollapsed: false
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
    }
  }
})
