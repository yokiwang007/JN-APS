# generateBatches 函数错误修复报告

## 📊 问题发现时间
2026-04-04

## ❌ 问题描述

### 错误信息
```
Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'forEach')
    at generateBatches (mock.js:224:10)
    at initializeExtendedData (mock-extended.js:732:23)
    at initializeData (CoarseTasks.vue:240:16)
```

### 问题说明
调用 `generateBatches` 函数时,传入的参数不正确,导致函数内部的 `forEach` 操作失败。

---

## 🔍 问题原因分析

### 根本原因

#### 1. 函数签名不匹配
`mock.js` 中的 `generateBatches` 函数签名:
```javascript
export const generateBatches = (orders, panels, count = 50) => {
  // 函数实现
}
```

**期望参数**:
- `orders`: 订单数组 (使用 `orderNo` 字段)
- `panels`: 板件数组 (使用 `orderNo` 字段)
- `count`: 批次数量 (可选,默认50)

#### 2. 调用方式错误

**修复前的调用**:
```javascript
const baseBatches = generateBatches(50)
```

**问题**:
- 只传入了 1 个参数 (50)
- 缺少必需的 `orders` 和 `panels` 参数
- 导致函数内部 `panels.forEach` 失败

#### 3. 数据格式不匹配

**旧数据格式** (mock.js):
```javascript
{
  orderNo: 'ORD001',
  customerName: '张三',
  // ...
}
```

**新数据格式** (mock-extended.js):
```javascript
{
  order_id: 'ORD001',
  customer_name: '张三',
  // ...
}
```

**问题**:
- `generateBatches` 函数使用 `orderNo` 字段
- 新数据使用 `order_id` 字段
- 数据格式不兼容

---

## ✅ 解决方案

### 修复方法

使用旧格式的数据生成批次,因为 `generateBatches` 函数期望旧格式。

**修复后的代码**:
```javascript
// 6. 生成现有批次数据(用于生成合并批次)
// 使用旧格式的数据生成批次,因为generateBatches函数期望旧格式
const oldOrders = generateOrders(100)
const oldPanels = generatePanels(oldOrders)
const baseBatches = generateBatches(oldOrders, oldPanels, 50)
console.log('✓ 生成基础批次数据:', baseBatches.length, '条')
```

### 修复说明

1. **生成旧格式数据**:
   - 使用 `generateOrders(100)` 生成100个旧格式的订单
   - 使用 `generatePanels(oldOrders)` 生成对应的板件数据

2. **调用正确的函数**:
   - 传入 `oldOrders` (旧格式订单)
   - 传入 `oldPanels` (旧格式板件)
   - 传入 `50` (批次数量)

3. **数据隔离**:
   - 旧格式数据仅用于生成批次
   - 新格式数据用于其他业务逻辑
   - 两种格式互不干扰

---

## 🎯 修复验证

### 修复前 ❌
```javascript
const baseBatches = generateBatches(50)
// 错误: TypeError: Cannot read properties of undefined (reading 'forEach')
```

### 修复后 ✅
```javascript
const oldOrders = generateOrders(100)
const oldPanels = generatePanels(oldOrders)
const baseBatches = generateBatches(oldOrders, oldPanels, 50)
// 成功: 生成50条批次数据
```

### 验证清单
- [x] 待排程任务页面正常加载
- [x] 控制台无错误信息
- [x] 控制台显示: "✓ 生成基础批次数据: 50 条"
- [x] 批次数据正确生成
- [x] 后续数据生成正常

---

## 📊 数据流说明

### 数据生成流程

```
1. 生成销售订单 (新格式)
   ↓
   erpSalesOrders (100条)

2. 生成BOM零件 (新格式)
   ↓
   cadBomParts (800条)

3. 生成生产子订单 (新格式)
   ↓
   apsProductionOrders (300条)

4. 生成工作中心
   ↓
   sysWorkCenters (4条)

5. 生成排程任务
   ↓
   apsScheduleTasks (200条)

6. 生成基础批次 (旧格式)
   ↓
   oldOrders (100条, 旧格式)
   oldPanels (800条, 旧格式)
   baseBatches (50条)

7. 生成生产批次
   ↓
   apsMergeBatches (50条)

8. 生成批次明细
   ↓
   apsBatchDetails (1500条)

... (后续数据生成)
```

### 数据格式对比

| 数据表 | 格式 | 字段命名 | 用途 |
|--------|------|----------|------|
| erp_sales_orders | 新格式 | order_id, customer_name | 业务数据 |
| cad_bom_parts | 新格式 | part_id, order_id | 业务数据 |
| baseBatches | 旧格式 | batchNo, orderNo | 批次生成中间数据 |
| aps_merge_batches | 新格式 | batch_id, batch_no | 最终批次数据 |

---

## 📝 注意事项

1. **数据隔离**: 旧格式数据仅用于批次生成,不影响其他业务逻辑
2. **格式转换**: 批次数据最终会转换为新格式,存储在 `aps_merge_batches` 中
3. **性能考虑**: 生成旧格式数据会增加少量内存使用,但影响不大
4. **长期方案**: 可以考虑重写 `generateBatches` 函数以支持新格式

---

## 🔧 长期优化建议

### 方案1: 重写 generateBatches 函数
修改 `mock.js` 中的 `generateBatches` 函数,使其支持新格式的数据。

**优点**:
- 统一数据格式
- 减少数据转换
- 提高代码一致性

**缺点**:
- 需要修改现有代码
- 可能影响其他使用该函数的地方

### 方案2: 创建适配器函数
创建一个适配器函数,将新格式数据转换为旧格式。

**优点**:
- 不修改现有代码
- 灵活性高
- 易于维护

**缺点**:
- 增加代码复杂度
- 有性能开销

### 方案3: 保持现状
继续使用旧格式数据生成批次。

**优点**:
- 无需修改代码
- 稳定可靠

**缺点**:
- 数据格式不统一
- 维护成本较高

---

## ✅ 验证结论

**问题状态**: ✅ 已解决

**修复方法**: 使用旧格式数据生成批次

**验证结果**:
- ✅ 错误已消除
- ✅ 数据正确生成
- ✅ 页面正常加载
- ✅ 功能正常工作

**数据统计**:
- 基础批次: 50条
- 生产批次: 50条
- 批次明细: 1500条

---

**修复时间**: 2026-04-04
**修复状态**: ✅ 已解决
**验证结果**: ✅ 全部通过

🎯
