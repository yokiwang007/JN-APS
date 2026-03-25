import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/order/list'
  },
  // 订单预处理路由
  {
    path: '/order/list',
    name: 'OrderList',
    component: () => import('../views/order/OrderList.vue'),
    meta: { title: '订单列表' }
  },
  {
    path: '/order/detail/:id',
    name: 'OrderDetail',
    component: () => import('../views/order/OrderDetail.vue'),
    meta: { title: '订单详情' }
  },
  {
    path: '/order/preprocess-result',
    name: 'PreprocessResult',
    component: () => import('../views/order/PreprocessResult.vue'),
    meta: { title: '预处理结果' }
  },
  // 批次规划路由
  {
    path: '/batch/plan',
    name: 'BatchPlan',
    component: () => import('../views/batch/BatchPlan.vue'),
    meta: { title: '批次规划' }
  },
  {
    path: '/batch/list',
    name: 'BatchList',
    component: () => import('../views/batch/BatchList.vue'),
    meta: { title: '批次列表' }
  },
  {
    path: '/batch/detail/:id',
    name: 'BatchDetail',
    component: () => import('../views/batch/BatchDetail.vue'),
    meta: { title: '批次详情' }
  },
  // 排程优化路由
  {
    path: '/schedule/optimize',
    name: 'ScheduleOptimize',
    component: () => import('../views/schedule/ScheduleOptimize.vue'),
    meta: { title: '排程优化' }
  },
  {
    path: '/schedule/list',
    name: 'ScheduleList',
    component: () => import('../views/schedule/ScheduleList.vue'),
    meta: { title: '排程列表' }
  },
  {
    path: '/schedule/instruction/:id',
    name: 'ProductionInstruction',
    component: () => import('../views/schedule/ProductionInstruction.vue'),
    meta: { title: '生产指令' }
  },
  {
    path: '/schedule/delivery/:id',
    name: 'MaterialDelivery',
    component: () => import('../views/schedule/MaterialDelivery.vue'),
    meta: { title: '物料配送单' }
  },
  // 监控调整路由
  {
    path: '/monitor/dashboard',
    name: 'MonitorDashboard',
    component: () => import('../views/monitor/MonitorDashboard.vue'),
    meta: { title: '监控看板' }
  },
  {
    path: '/monitor/adjust',
    name: 'ScheduleAdjust',
    component: () => import('../views/monitor/ScheduleAdjust.vue'),
    meta: { title: '排程调整' }
  },
  {
    path: '/monitor/capacity',
    name: 'CapacityAnalysis',
    component: () => import('../views/monitor/CapacityAnalysis.vue'),
    meta: { title: '产能分析' }
  },
  // 策略配置路由
  {
    path: '/strategy/list',
    name: 'StrategyList',
    component: () => import('../views/strategy/StrategyList.vue'),
    meta: { title: '策略列表' }
  },
  {
    path: '/strategy/edit/:id?',
    name: 'StrategyEdit',
    component: () => import('../views/strategy/StrategyEdit.vue'),
    meta: { title: '策略编辑' }
  },
  {
    path: '/strategy/detail/:id',
    name: 'StrategyDetail',
    component: () => import('../views/strategy/StrategyDetail.vue'),
    meta: { title: '策略详情' }
  },
  // 产能管理路由
  {
    path: '/capacity/production-line',
    name: 'ProductionLineManage',
    component: () => import('../views/capacity/ProductionLineManage.vue'),
    meta: { title: '产线管理' }
  },
  {
    path: '/capacity/process-route',
    name: 'ProcessRouteManage',
    component: () => import('../views/capacity/ProcessRouteManage.vue'),
    meta: { title: '工艺路线' }
  },
  {
    path: '/capacity/work-calendar',
    name: 'WorkCalendarManage',
    component: () => import('../views/capacity/WorkCalendarManage.vue'),
    meta: { title: '工作日历' }
  },
  {
    path: '/capacity/equipment',
    name: 'EquipmentConfig',
    component: () => import('../views/capacity/EquipmentConfig.vue'),
    meta: { title: '设备配置' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 计划排产系统`
  }
  next()
})

export default router
