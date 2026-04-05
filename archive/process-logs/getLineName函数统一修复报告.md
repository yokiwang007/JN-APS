# getLineName 函数统一修复报告

## 📊 问题发现时间
2026-04-04

## ❌ 问题描述

### 错误信息
```
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'find')
    at Proxy.getLineName (ProductionOrders.vue:352:38)
    at ProductionOrders.vue:77:37
```

### 问题说明
多个页面中的 `getLineName` 函数尝试对 `undefined` 调用 `find` 方法,导致错误。

---

## 🔍 问题原因分析

### 根本原因

多个页面都存在相同的问题:
1. `productionLines.value` 可能是 `undefined`
2. `getLineName` 函数缺少安全检查
3. 数据加载时没有提供默认值

### 受影响的页面

1. ✅ schedule/ScheduleBatches.vue (已修复)
2. ✅ production/ProductionOrders.vue (已修复)
3. ✅ batch/BatchPlanOptimized.vue (已修复)
4. ✅ coarse-schedule/CoarseGantt.vue (已修复)
5. ✅ coarse-schedule/CoarseList.vue (已修复)

---

## ✅ 解决方案

### 统一修复模式

#### 修复1: getLineName 函数

**修复前**:
```javascript
const getLineName = (lineId) => {
  const line = productionLines.value.find(l => l.line_id === lineId)
  return line ? line.line_name : lineId
}
```

**修复后**:
```javascript
const getLineName = (lineId) => {
  if (!productionLines.value || !Array.isArray(productionLines.value)) {
    return lineId || '未知产线'
  }
  const line = productionLines.value.find(l => l.line_id === lineId)
  return line ? line.line_name : lineId
}
```

**修复说明**:
- 检查 `productionLines.value` 是否存在
- 检查是否为数组
- 提供默认返回值

#### 修复2: getLineType 函数 (CoarseList.vue)

**修复前**:
```javascript
const getLineType = (lineId) => {
  const line = productionLines.value.find(l => l.line_id === lineId)
  const map = { /* ... */ }
  return map[line?.line_type] || '未知'
}
```

**修复后**:
```javascript
const getLineType = (lineId) => {
  if (!productionLines.value || !Array.isArray(productionLines.value)) {
    return '未知'
  }
  const line = productionLines.value.find(l => l.line_id === lineId)
  const map = { /* ... */ }
  return map[line?.line_type] || '未知'
}
```

#### 修复3: 数据加载函数

**修复前**:
```javascript
const loadData = () => {
  const data = initializeExtendedData()
  productionLines.value = data.sys_workCenters
  // ...
}
```

**修复后**:
```javascript
const loadData = () => {
  console.log('🔄 开始加载数据...')
  const data = initializeExtendedData()
  console.log('📦 数据结构:', Object.keys(data))

  productionLines.value = data.sys_work_centers || []
  console.log('✅ 产线数据已加载:', productionLines.value.length, '条')

  // 其他数据也添加默认值
  allBatches.value = (data.aps_merge_batches || []).map(...)
  // ...
}
```

---

## 📊 修复清单

| 页面 | getLineName | getLineType | loadData | 状态 |
|------|-------------|-------------|----------|------|
| ScheduleBatches.vue | ✅ | - | ✅ | 已修复 |
| ProductionOrders.vue | ✅ | - | ✅ | 已修复 |
| BatchPlanOptimized.vue | ✅ | - | - | 已修复 |
| CoarseGantt.vue | ✅ | - | ✅ | 已修复 |
| CoarseList.vue | ✅ | ✅ | - | 已修复 |

---

## 🎯 修复验证

### 验证方法
1. 访问每个受影响的页面
2. 检查控制台是否有错误
3. 检查产线名称是否正确显示
4. 检查数据是否正常加载

### 预期结果
- ✅ 所有页面正常加载
- ✅ 控制台无错误信息
- ✅ 产线名称正确显示
- ✅ 数据正常显示

---

## 📝 注意事项

1. **统一修复模式**: 所有页面使用相同的修复模式
2. **安全检查**: 所有工具函数都添加了安全检查
3. **默认值**: 所有数据访问都提供了默认值
4. **调试信息**: 关键页面添加了调试日志

---

## 🔧 长期优化建议

### 1. 创建通用工具函数
将 `getLineName` 等常用函数抽取到公共工具文件:

```javascript
// utils/common.js
export const createGetLineName = (productionLines) => {
  return (lineId) => {
    if (!productionLines.value || !Array.isArray(productionLines.value)) {
      return lineId || '未知产线'
    }
    const line = productionLines.value.find(l => l.line_id === lineId)
    return line ? line.line_name : lineId
  }
}
```

### 2. 使用 Composable
创建可复用的 Composable:

```javascript
// composables/useProductionLines.js
import { ref } from 'vue'
import { initializeExtendedData } from '@/utils/mock-extended.js'

export const useProductionLines = () => {
  const productionLines = ref([])

  const loadProductionLines = () => {
    const data = initializeExtendedData()
    productionLines.value = data.sys_work_centers || []
  }

  const getLineName = (lineId) => {
    if (!productionLines.value || !Array.isArray(productionLines.value)) {
      return lineId || '未知产线'
    }
    const line = productionLines.value.find(l => l.line_id === lineId)
    return line ? line.line_name : lineId
  }

  return {
    productionLines,
    loadProductionLines,
    getLineName
  }
}
```

### 3. 使用 TypeScript
使用 TypeScript 可以在编译时捕获这类错误:

```typescript
interface ProductionLine {
  line_id: string
  line_name: string
}

const getLineName = (lineId: string, productionLines: ProductionLine[]): string => {
  if (!productionLines || !Array.isArray(productionLines)) {
    return lineId || '未知产线'
  }
  const line = productionLines.find(l => l.line_id === lineId)
  return line ? line.line_name : lineId
}
```

---

## ✅ 验证结论

**问题状态**: ✅ 已全部解决

**修复方法**:
- 统一修复 `getLineName` 函数
- 添加安全检查
- 添加默认值
- 添加调试信息

**修复页面**: 5个

**验证结果**:
- ✅ ScheduleBatches.vue - 正常
- ✅ ProductionOrders.vue - 正常
- ✅ BatchPlanOptimized.vue - 正常
- ✅ CoarseGantt.vue - 正常
- ✅ CoarseList.vue - 正常

---

**修复时间**: 2026-04-04
**修复状态**: ✅ 已全部解决
**验证结果**: ✅ 全部通过

🎯
