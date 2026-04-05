import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/layout/Layout.vue'

/**
 * Layout 必须作为路由父组件，由根 router-view 渲染；子页面在 Layout 内 router-view 渲染。
 * 若把 Layout 写死在 App.vue 里，仅内部挂 router-view，会出现地址变化但页面不切换的问题。
 */
const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'test-data',
        name: 'TestData',
        component: () => import('../views/TestData.vue'),
        meta: { title: '数据测试' }
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/Dashboard.vue'),
        meta: { title: '综合看板', icon: 'DataBoard' }
      },
      {
        path: 'coarse-schedule/tasks',
        name: 'CoarseTasks',
        component: () => import('../views/coarse-schedule/CoarseTasks.vue'),
        meta: { title: '待排程任务', icon: 'Clock' }
      },
      {
        path: 'coarse-schedule/list',
        name: 'CoarseList',
        component: () => import('../views/coarse-schedule/CoarseList.vue'),
        meta: { title: '排程任务管理', icon: 'List' }
      },
      {
        path: 'coarse-schedule/gantt',
        name: 'CoarseGantt',
        component: () => import('../views/coarse-schedule/CoarseGantt.vue'),
        meta: { title: '排程甘特图', icon: 'TrendCharts' }
      },
      {
        path: 'order/list',
        name: 'OrderList',
        component: () => import('../views/order/OrderList.vue'),
        meta: { title: '订单列表', icon: 'Tickets' }
      },
      {
        path: 'order/detail/:id',
        name: 'OrderDetail',
        component: () => import('../views/order/OrderDetail.vue'),
        meta: { title: '订单详情', icon: 'Document' }
      },
      {
        path: 'order/split',
        name: 'OrderSplit',
        component: () => import('../views/order/OrderSplit.vue'),
        meta: { title: '订单拆解', icon: 'Scissor' }
      },
      {
        path: 'order/split-rules',
        name: 'SplitRules',
        component: () => import('../views/order/SplitRules.vue'),
        meta: { title: '拆单规则', icon: 'Notebook' }
      },
      {
        path: 'order/preprocess-result',
        name: 'PreprocessResult',
        component: () => import('../views/order/PreprocessResult.vue'),
        meta: { title: '预处理结果', icon: 'DocumentChecked' }
      },
      {
        path: 'order/preprocess-rules',
        name: 'PreprocessRules',
        component: () => import('../views/order/PreprocessRules.vue'),
        meta: { title: '预处理规则', icon: 'Setting' }
      },
      {
        path: 'batch/plan',
        name: 'BatchPlan',
        component: () => import('../views/batch/BatchPlan.vue'),
        meta: { title: '批次规划', icon: 'Grid' }
      },
      {
        path: 'batch/merge-rules',
        name: 'MergeRules',
        component: () => import('../views/batch/MergeRules.vue'),
        meta: { title: '揉单规则配置', icon: 'Operation' }
      },
      {
        path: 'batch/list',
        name: 'BatchList',
        component: () => import('../views/batch/BatchList.vue'),
        meta: { title: '批次列表', icon: 'Document' }
      },
      {
        path: 'batch/detail/:id',
        name: 'BatchDetail',
        component: () => import('../views/batch/BatchDetail.vue'),
        meta: { title: '批次详情', icon: 'Document' }
      },
      {
        path: 'schedule/batches',
        name: 'ScheduleBatches',
        component: () => import('../views/schedule/ScheduleBatches.vue'),
        meta: { title: '待排程批次', icon: 'Files' }
      },
      {
        path: 'schedule/optimization',
        name: 'CuttingOptimization',
        component: () => import('../views/schedule/CuttingOptimization.vue'),
        meta: { title: '开料优化', icon: 'MagicStick' }
      },
      {
        path: 'schedule/optimize',
        name: 'ScheduleOptimize',
        component: () => import('../views/schedule/ScheduleOptimize.vue'),
        meta: { title: '排程优化', icon: 'MagicStick' }
      },
      {
        path: 'schedule/list',
        name: 'ScheduleList',
        component: () => import('../views/schedule/ScheduleList.vue'),
        meta: { title: '排程列表', icon: 'List' }
      },
      {
        path: 'schedule/instruction/:id',
        name: 'ProductionInstruction',
        component: () => import('../views/schedule/ProductionInstruction.vue'),
        meta: { title: '生产指令', icon: 'Document' }
      },
      {
        path: 'schedule/delivery/:id',
        name: 'MaterialDelivery',
        component: () => import('../views/schedule/MaterialDelivery.vue'),
        meta: { title: '物料配送单', icon: 'Document' }
      },
      {
        path: 'monitor/dashboard',
        name: 'MonitorDashboard',
        component: () => import('../views/monitor/MonitorDashboard.vue'),
        meta: { title: '监控看板', icon: 'View' }
      },
      {
        path: 'monitor/adjust',
        name: 'ScheduleAdjust',
        component: () => import('../views/monitor/ScheduleAdjust.vue'),
        meta: { title: '排程调整', icon: 'Edit' }
      },
      {
        path: 'monitor/capacity',
        name: 'CapacityAnalysis',
        component: () => import('../views/monitor/CapacityAnalysis.vue'),
        meta: { title: '产能分析', icon: 'DataAnalysis' }
      },
      {
        path: 'strategy/list',
        name: 'StrategyList',
        component: () => import('../views/strategy/StrategyList.vue'),
        meta: { title: '策略列表', icon: 'Tools' }
      },
      {
        path: 'strategy/edit/:id?',
        name: 'StrategyEdit',
        component: () => import('../views/strategy/StrategyEdit.vue'),
        meta: { title: '策略编辑', icon: 'Edit' }
      },
      {
        path: 'strategy/detail/:id',
        name: 'StrategyDetail',
        component: () => import('../views/strategy/StrategyDetail.vue'),
        meta: { title: '策略详情', icon: 'Document' }
      },
      {
        path: 'capacity/production-line',
        name: 'ProductionLineManage',
        component: () => import('../views/capacity/ProductionLineManage.vue'),
        meta: { title: '标准产能设置', icon: 'Odometer' }
      },
      {
        path: 'capacity/process-route',
        name: 'ProcessRouteManage',
        component: () => import('../views/capacity/ProcessRouteManage.vue'),
        meta: { title: '生产周期设置', icon: 'Connection' }
      },
      {
        path: 'capacity/work-calendar',
        name: 'WorkCalendarManage',
        component: () => import('../views/capacity/WorkCalendarManage.vue'),
        meta: { title: '工作日历', icon: 'Calendar' }
      },
      {
        path: 'capacity/equipment',
        name: 'EquipmentConfig',
        component: () => import('../views/capacity/EquipmentConfig.vue'),
        meta: { title: '设备配置', icon: 'Setting' }
      },
      {
        path: 'production/orders',
        name: 'ProductionOrders',
        component: () => import('../views/production/ProductionOrders.vue'),
        meta: { title: '生产工单', icon: 'DocumentCopy' }
      },
      {
        path: 'production/tracking',
        name: 'WipTracking',
        component: () => import('../views/production/WipTracking.vue'),
        meta: { title: '在制品追踪', icon: 'Monitor' }
      },
      {
        path: 'fulfillment/dashboard',
        name: 'FulfillmentDashboard',
        component: () => import('../views/fulfillment/FulfillmentDashboard.vue'),
        meta: { title: '齐套看板', icon: 'PieChart' }
      },
      {
        path: 'fulfillment/slots',
        name: 'FulfillmentSlots',
        component: () => import('../views/fulfillment/FulfillmentSlots.vue'),
        meta: { title: '齐套货位管理', icon: 'Box' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const leaf = to.matched[to.matched.length - 1]
  const title = leaf?.meta?.title
  if (title) {
    document.title = `${title} - 计划排产系统`
  }
  next()
})

export default router
