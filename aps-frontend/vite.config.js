import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    // 提高警告阈值
    chunkSizeWarningLimit: 1000,
    // 代码分割策略
    rollupOptions: {
      output: {
        // 手动分包 - 使用函数形式
        manualChunks: (id) => {
          // Vue 核心库
          if (id.includes('node_modules/vue/') || id.includes('node_modules/vue-router/') || id.includes('node_modules/pinia/')) {
            return 'vue-vendor'
          }
          // Element Plus UI 库
          if (id.includes('node_modules/element-plus/') || id.includes('node_modules/@element-plus/')) {
            return 'element-plus'
          }
          // ECharts 图表库
          if (id.includes('node_modules/echarts/')) {
            return 'echarts'
          }
          // Axios HTTP 库
          if (id.includes('node_modules/axios/')) {
            return 'axios'
          }
        },
        // 分块文件名格式
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除 console
        drop_debugger: true
      }
    }
  }
})
