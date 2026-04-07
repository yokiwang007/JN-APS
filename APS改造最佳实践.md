# APS系统双模式API改造最佳实践

## 📋 概述

本文档总结了标准产能设置模块从单模式（模拟数据）改造为双模式（真实API + 模拟数据）的最佳实践，为后续其他业务模块的改造提供参考。

---

## 🎯 改造目标

1. **双模式支持**：同时支持真实API模式和模拟数据模式
2. **无缝切换**：用户可以在两种模式间自由切换
3. **功能完整**：查询、新增、编辑、删除功能完整
4. **数据一致**：两种模式的数据结构保持一致
5. **代码复用**：前端业务代码无需关心底层实现

---

## 🔧 改造步骤

### 第一步：后端API实现

#### 1.1 Controller层添加CRUD方法

**文件位置**：`aps-backend/src/controllers/capacityController.js`

```javascript
/**
 * 创建产线
 */
async createProductionLine(req, res, next) {
  try {
    const line = await capacityService.createProductionLine(req.body);
    res.status(201).json(successResponse(line, '产线创建成功'));
  } catch (error) {
    logger.error('Create production line controller error:', error);
    next(error);
  }
}

/**
 * 更新产线
 */
async updateProductionLine(req, res, next) {
  try {
    const { lineId } = req.params;
    const line = await capacityService.updateProductionLine(lineId, req.body);
    res.status(200).json(successResponse(line, '产线更新成功'));
  } catch (error) {
    logger.error('Update production line controller error:', error);
    next(error);
  }
}

/**
 * 删除产线（软删除）
 */
async deleteProductionLine(req, res, next) {
  try {
    const { lineId } = req.params;
    await capacityService.deleteProductionLine(lineId);
    res.status(200).json(successResponse(null, '产线删除成功'));
  } catch (error) {
    logger.error('Delete production line controller error:', error);
    next(error);
  }
}
```

**关键点**：
- ✅ 使用统一的响应格式 `successResponse()`
- ✅ 状态码：创建用201，更新删除用200
- ✅ 完善的错误处理和日志记录
- ✅ 删除操作使用软删除，数据可恢复

#### 1.2 Service层实现业务逻辑

**文件位置**：`aps-backend/src/services/capacityService.js`

```javascript
/**
 * 创建产线
 */
async createProductionLine(data) {
  try {
    logger.info('Creating production line:', data);

    // 生成产线编号
    const lineId = data.lineId || this.generateLineId(data.lineType);

    // 创建产线
    const line = await ProductionLine.create({
      line_id: lineId,
      line_name: data.lineName,
      line_type: data.lineType,
      standard_capacity: data.standardCapacity,
      status: data.status || '正常',
      workshop: data.workshop,
      main_equipment: data.mainEquipments ? data.mainEquipments.join(',') : ''
    });

    logger.info(`Production line created successfully: ${lineId}`);
    return this.formatProductionLine(line);
  } catch (error) {
    logger.error('Create production line error:', error);
    throw error;
  }
}

/**
 * 生成产线编号
 */
generateLineId(lineType) {
  const prefixMap = {
    '开料线': 'SAW',
    '封边线': 'EDG',
    '钻孔线': 'DRILL',
    '包装线': 'PKG'
  };
  const prefix = prefixMap[lineType] || 'LINE';
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}${timestamp}`;
}

/**
 * 删除产线（软删除）
 */
async deleteProductionLine(lineId) {
  try {
    logger.info(`Deleting production line: ${lineId}`);

    const line = await ProductionLine.findOne({
      where: {
        line_id: lineId,
        deleted_at: null
      }
    });

    if (!line) {
      logger.warn(`Production line not found: ${lineId}`);
      throw new Error('产线不存在');
    }

    // 软删除
    await line.destroy();

    logger.info(`Production line deleted successfully: ${lineId}`);
    return true;
  } catch (error) {
    logger.error('Delete production line error:', error);
    throw error;
  }
}

/**
 * 格式化产线数据（关键！）
 */
formatProductionLine(line) {
  const plain = line.get({ plain: true });
  return {
    lineId: plain.line_id,
    lineName: plain.line_name,
    lineType: plain.line_type,
    standardCapacity: plain.standard_capacity,
    standardCapacityArea: null,
    status: plain.status,
    workshop: plain.workshop,
    mainEquipments: plain.main_equipment ? plain.main_equipment.split(',') : [],
    mainEquipment: plain.main_equipment,
    createdAt: plain.created_at,
    updatedAt: plain.updated_at
  };
}
```

**关键点**：
- ✅ 数据格式化：将数据库字段转换为前端期望的格式
- ✅ 字段映射：`main_equipment` 字符串 → `mainEquipments` 数组
- ✅ 自动编号：根据业务规则生成唯一编号
- ✅ 软删除：使用Sequelize的`destroy()`方法
- ✅ 数据兼容：同时提供字符串和数组两种格式

#### 1.3 路由配置

**文件位置**：`aps-backend/src/routes/capacityRoutes.js`

```javascript
// 查询产线列表
router.get('/production-lines', capacityController.getProductionLines);

// 创建产线
router.post('/production-lines', capacityController.createProductionLine);

// 更新产线
router.put('/production-lines/:lineId', capacityController.updateProductionLine);

// 删除产线
router.delete('/production-lines/:lineId', capacityController.deleteProductionLine);
```

**关键点**：
- ✅ RESTful风格：GET查询、POST创建、PUT更新、DELETE删除
- ✅ 路径一致：`/api/capacity/production-lines`
- ✅ 暂时移除认证：便于开发测试（生产环境需恢复）

---

### 第二步：模拟数据API实现

#### 2.1 添加CRUD方法

**文件位置**：`aps-frontend/src/utils/api.js`

```javascript
// 创建产线
export const createProductionLine = async (params) => {
  await delay()
  const data = getData()

  // 生成产线编号
  const lineId = params.lineId || `LINE${Date.now().toString().slice(-6)}`

  const newLine = {
    lineId,
    lineName: params.lineName,
    lineType: params.lineType,
    standardCapacity: params.standardCapacity,
    standardCapacityArea: params.standardCapacityArea || null,
    status: params.status || '正常',
    workshop: params.workshop,
    mainEquipments: params.mainEquipments || [],
    loadRate: 0
  }

  data.productionLines.push(newLine)
  saveData(data)

  return success(newLine)
}

// 更新产线
export const updateProductionLine = async (lineId, params) => {
  await delay()
  const data = getData()

  const index = data.productionLines.findIndex(l => l.lineId === lineId)
  if (index === -1) {
    return error('产线不存在')
  }

  data.productionLines[index] = {
    ...data.productionLines[index],
    ...params
  }

  saveData(data)
  return success(data.productionLines[index])
}

// 删除产线
export const deleteProductionLine = async (lineId) => {
  await delay()
  const data = getData()

  const index = data.productionLines.findIndex(l => l.lineId === lineId)
  if (index === -1) {
    return error('产线不存在')
  }

  data.productionLines.splice(index, 1)
  saveData(data)

  return success(null)
}
```

**关键点**：
- ✅ 数据结构一致：与真实API返回的数据格式完全一致
- ✅ 自动编号：生成唯一编号
- ✅ 数据持久化：使用localStorage保存
- ✅ 错误处理：检查数据是否存在

---

### 第三步：真实API客户端实现

#### 3.1 添加API方法

**文件位置**：`aps-frontend/src/utils/api-client.js`

```javascript
// 创建产线
export const createProductionLineApi = async (data) => {
  const response = await apiClient.post('/api/capacity/production-lines', data)
  return response
}

// 删除产线
export const deleteProductionLineApi = async (lineId) => {
  const response = await apiClient.delete(`/api/capacity/production-lines/${lineId}`)
  return response
}
```

**关键点**：
- ✅ 路径正确：`/api/capacity/production-lines`
- ✅ 方法对应：POST创建、DELETE删除
- ✅ 参数传递：正确传递请求参数

---

### 第四步：统一API服务

#### 4.1 添加模式切换逻辑

**文件位置**：`aps-frontend/src/utils/api-unified.js`

```javascript
export const createProductionLine = isMockMode() ? mockApi.createProductionLine : realApi.createProductionLineApi
export const updateProductionLine = isMockMode() ? mockApi.updateProductionLine : realApi.updateProductionLineApi
export const deleteProductionLine = isMockMode() ? mockApi.deleteProductionLine : realApi.deleteProductionLineApi
```

**关键点**：
- ✅ 模式判断：使用`isMockMode()`判断当前模式
- ✅ 自动切换：根据模式选择对应的API实现
- ✅ 导出统一：前端业务代码统一使用这些导出

---

### 第五步：配置文件修复

#### 5.1 修复API基础URL

**文件位置**：`aps-frontend/src/utils/config.js`

```javascript
// 修改前
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003'

// 修改后
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002'
```

#### 5.2 修复环境变量

**文件位置**：`aps-frontend/.env`

```bash
# 修改前
VITE_API_BASE_URL=http://localhost:3003

# 修改后
VITE_API_BASE_URL=http://localhost:3002
```

**关键点**：
- ✅ 端口一致：确保前后端端口配置一致
- ✅ 环境变量：正确配置API基础URL

---

### 第六步：前端UI实现

#### 6.1 添加操作按钮

**文件位置**：`aps-frontend/src/views/capacity/ProductionLineManage.vue`

```vue
<template #header>
  <div class="card-header">
    <span>标准产能设置</span>
    <div class="header-actions">
      <el-button type="success" size="small" @click="addLine">
        <el-icon><Plus /></el-icon>
        新增
      </el-button>
      <el-button type="primary" size="small" @click="refreshData">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>
  </div>
</template>

<el-table-column label="操作" width="200" fixed="right">
  <template #default="{ row }">
    <el-button type="primary" link @click="editLine(row)">
      <el-icon><Edit /></el-icon>
      编辑
    </el-button>
    <el-button type="danger" link @click="deleteLine(row)">
      <el-icon><Delete /></el-icon>
      删除
    </el-button>
  </template>
</el-table-column>
```

#### 6.2 对话框支持新增和编辑

```vue
<el-dialog
  v-model="editDialogVisible"
  :title="isEditMode ? '编辑标准产能' : '新增标准产能'"
  width="600px"
>
  <!-- 表单内容 -->
</el-dialog>
```

#### 6.3 JavaScript逻辑

```javascript
import { getProductionLines, createProductionLine, updateProductionLine, deleteProductionLine } from '../../utils/api-unified'

const isEditMode = ref(false) // 是否为编辑模式

// 新增产线
const addLine = () => {
  isEditMode.value = false
  editForm.value = {
    lineName: '',
    lineType: '开料线',
    standardCapacity: 500,
    standardCapacityArea: null,
    status: '正常',
    workshop: '',
    mainEquipments: []
  }
  editDialogVisible.value = true
}

// 编辑产线
const editLine = (line) => {
  isEditMode.value = true
  editForm.value = { ...line }
  editDialogVisible.value = true
}

// 保存产线
const saveLine = async () => {
  try {
    let result
    if (isEditMode.value) {
      result = await updateProductionLine(editForm.value.lineId, editForm.value)
    } else {
      result = await createProductionLine(editForm.value)
    }

    if (result.code === 'SUCCESS') {
      ElMessage.success(isEditMode.value ? '更新成功' : '创建成功')
      editDialogVisible.value = false
      refreshData()
    }
  } catch (error) {
    ElMessage.error(isEditMode.value ? '更新失败' : '创建失败')
  }
}

// 删除产线
const deleteLine = async (line) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除产线"${line.lineName}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const result = await deleteProductionLine(line.lineId)
    if (result.code === 'SUCCESS') {
      ElMessage.success('删除成功')
      refreshData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
```

**关键点**：
- ✅ 模式标识：使用`isEditMode`区分新增和编辑
- ✅ 统一接口：使用统一的API函数
- ✅ 用户确认：删除操作需要用户二次确认
- ✅ 错误处理：完善的异常捕获和提示
- ✅ 自动刷新：操作完成后自动刷新列表

---

## ⚠️ 常见问题和解决方案

### 问题1：API路径404错误

**症状**：`GET http://localhost:3003/api/capacity/production-lines 404 (Not Found)`

**原因**：
- 前端配置的端口与后端实际端口不一致
- API路径配置错误

**解决方案**：
```javascript
// 检查并修改配置文件
aps-frontend/src/utils/config.js
aps-frontend/.env

// 确保端口一致
API_BASE_URL = 'http://localhost:3002'  // 与后端端口一致
```

### 问题2：列表显示为空

**症状**：API返回成功，但前端列表为空

**原因**：
- 数据格式不匹配：后端返回`{total, list, page, pageSize}`，前端期望数组
- 字段名不一致：`mainEquipment` vs `mainEquipments`

**解决方案**：
```javascript
// 前端数据处理
const refreshData = async () => {
  loading.value = true
  try {
    const result = await getProductionLines()
    if (result.code === 'SUCCESS') {
      // 处理数据格式
      productionLines.value = result.data.list || result.data
    }
  } finally {
    loading.value = false
  }
}

// 后端数据格式化
formatProductionLine(line) {
  return {
    // ... 其他字段
    mainEquipments: plain.main_equipment ? plain.main_equipment.split(',') : [],
    mainEquipment: plain.main_equipment, // 同时提供两种格式
  }
}
```

### 问题3：模式切换不生效

**症状**：切换模式后仍使用原来的API

**原因**：
- 使用了错误的导入路径
- 没有使用统一API服务

**解决方案**：
```javascript
// ❌ 错误做法
import { getProductionLines } from '../../utils/api'  // 直接使用模拟API

// ✅ 正确做法
import { getProductionLines } from '../../utils/api-unified'  // 使用统一API
```

### 问题4：数据库连接失败

**症状**：`Access denied for user ''@'localhost'`

**原因**：
- 环境变量没有正确加载
- 数据库配置错误

**解决方案**：
```bash
# 手动设置环境变量启动
PORT=3002 DB_HOST=localhost DB_PORT=3306 DB_NAME=aps_db DB_USER=root DB_PASSWORD=jienor0803 NODE_ENV=development node src/app.js

# 或检查.env文件配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aps_db
DB_USER=root
DB_PASSWORD=jienor0803
```

---

## 📋 改造检查清单

### 后端部分
- [ ] Controller层添加CRUD方法
- [ ] Service层实现业务逻辑
- [ ] 数据格式化方法（formatXxx）
- [ ] 软删除实现
- [ ] 自动编号生成
- [ ] 路由配置
- [ ] 日志记录
- [ ] 错误处理

### 前端部分
- [ ] 模拟数据API实现
- [ ] 真实API客户端实现
- [ ] 统一API服务配置
- [ ] API基础URL配置
- [ ] 环境变量配置
- [ ] 前端UI更新（新增、删除按钮）
- [ ] 对话框支持新增和编辑
- [ ] 业务逻辑实现
- [ ] 用户确认对话框
- [ ] 错误处理和提示

### 测试部分
- [ ] 真实API模式测试
  - [ ] 查询功能
  - [ ] 新增功能
  - [ ] 编辑功能
  - [ ] 删除功能
- [ ] 模拟数据模式测试
  - [ ] 查询功能
  - [ ] 新增功能
  - [ ] 编辑功能
  - [ ] 删除功能
- [ ] 模式切换测试
- [ ] 数据格式验证
- [ ] 边界情况测试

---

## 🚀 快速开始模板

### 后端模板

```javascript
// Controller
async createXxx(req, res, next) {
  try {
    const item = await xxxService.createXxx(req.body);
    res.status(201).json(successResponse(item, '创建成功'));
  } catch (error) {
    logger.error('Create xxx error:', error);
    next(error);
  }
}

async updateXxx(req, res, next) {
  try {
    const { id } = req.params;
    const item = await xxxService.updateXxx(id, req.body);
    res.status(200).json(successResponse(item, '更新成功'));
  } catch (error) {
    logger.error('Update xxx error:', error);
    next(error);
  }
}

async deleteXxx(req, res, next) {
  try {
    const { id } = req.params;
    await xxxService.deleteXxx(id);
    res.status(200).json(successResponse(null, '删除成功'));
  } catch (error) {
    logger.error('Delete xxx error:', error);
    next(error);
  }
}

// Service
async createXxx(data) {
  const id = data.id || this.generateId();
  const item = await XxxModel.create({
    /* 字段映射 */
  });
  return this.formatXxx(item);
}

async deleteXxx(id) {
  const item = await XxxModel.findOne({ where: { id, deleted_at: null } });
  if (!item) throw new Error('记录不存在');
  await item.destroy();
  return true;
}

formatXxx(item) {
  const plain = item.get({ plain: true });
  return {
    /* 字段映射和格式化 */
  };
}
```

### 前端模板

```javascript
// api.js (模拟数据)
export const createXxx = async (params) => {
  await delay()
  const data = getData()
  const newItem = { /* 初始化数据 */ }
  data.xxxItems.push(newItem)
  saveData(data)
  return success(newItem)
}

export const deleteXxx = async (id) => {
  await delay()
  const data = getData()
  const index = data.xxxItems.findIndex(item => item.id === id)
  if (index === -1) return error('记录不存在')
  data.xxxItems.splice(index, 1)
  saveData(data)
  return success(null)
}

// api-client.js (真实API)
export const createXxxApi = async (data) => {
  const response = await apiClient.post('/api/xxx/items', data)
  return response
}

export const deleteXxxApi = async (id) => {
  const response = await apiClient.delete(`/api/xxx/items/${id}`)
  return response
}

// api-unified.js (统一服务)
export const createXxx = isMockMode() ? mockApi.createXxx : realApi.createXxxApi
export const deleteXxx = isMockMode() ? mockApi.deleteXxx : realApi.deleteXxxApi

// Vue组件
import { getXxxItems, createXxx, updateXxx, deleteXxx } from '../../utils/api-unified'

const isEditMode = ref(false)

const addItem = () => {
  isEditMode.value = false
  editForm.value = { /* 默认值 */ }
  editDialogVisible.value = true
}

const saveItem = async () => {
  try {
    let result
    if (isEditMode.value) {
      result = await updateXxx(editForm.value.id, editForm.value)
    } else {
      result = await createXxx(editForm.value)
    }
    if (result.code === 'SUCCESS') {
      ElMessage.success(isEditMode.value ? '更新成功' : '创建成功')
      editDialogVisible.value = false
      refreshData()
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const deleteItem = async (item) => {
  try {
    await ElMessageBox.confirm(`确定要删除"${item.name}"吗？`, '确认删除', {
      type: 'warning'
    })
    const result = await deleteXxx(item.id)
    if (result.code === 'SUCCESS') {
      ElMessage.success('删除成功')
      refreshData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
```

---

## 💡 重要经验教训（基于标准产能设置改造）

### 🚨 关键问题和解决方案

#### 1. 使用正确的数据库表

**问题**：
- 错误地使用了 `sys_work_center` 表（工作中心表）而不是 `production_lines` 表（产线表）
- 导致字段不匹配，数据无法正确保存

**解决方案**：
```bash
# 检查数据库表结构
mysql -h localhost -u root -p aps_db -e "SHOW TABLES LIKE '%line%';"

# 查看表结构
mysql -h localhost -u root -p aps_db -e "DESC production_lines;"
```

**检查清单**：
- ✅ 确认使用正确的数据库表
- ✅ 检查表结构是否包含所有必需字段
- ✅ 验证字段名称和类型是否正确
- ✅ 确认Model文件与数据库表结构一致

#### 2. 数据库字段缺失问题

**问题**：
- `production_lines` 表缺少 `standard_capacity_area` 字段（标准产能面积）
- 导致前端提交的产能面积数据无法保存

**解决方案**：
```sql
-- 添加缺失的字段
ALTER TABLE production_lines
ADD COLUMN standard_capacity_area DECIMAL(10,2)
COMMENT '标准产能面积(㎡)'
AFTER standard_capacity;
```

**检查清单**：
- ✅ 对比前端表单字段和数据库表结构
- ✅ 添加缺失的字段
- ✅ 更新Model文件定义
- ✅ 更新后端API以支持新字段

#### 3. Model定义更新

**问题**：
- 添加数据库字段后，Model文件没有同步更新
- 导致Sequelize无法识别新字段

**解决方案**：
```javascript
// 文件：aps-backend/src/models/ProductionLine.js
standard_capacity_area: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: true,
  comment: '标准产能面积(㎡)'
}
```

**检查清单**：
- ✅ 数据库字段添加后，立即更新Model文件
- ✅ 确保字段类型、长度、注释一致
- ✅ 重启后端服务使更改生效

#### 4. 字段名映射问题

**问题**：
- 前端使用 `standardCapacity`，数据库使用 `standard_capacity`
- 前端使用 `standardCapacityArea`，数据库使用 `standard_capacity_area`
- 前端使用 `mainEquipments`（数组），数据库使用 `main_equipment`（字符串）

**解决方案**：
```javascript
// 后端API返回时映射
const productionLine = {
  lineId: line.line_id,
  lineName: line.line_name,
  lineType: line.line_type,
  standardCapacity: line.standard_capacity,
  standardCapacityArea: line.standard_capacity_area,
  workshop: line.workshop,
  mainEquipments: line.main_equipment ? line.main_equipment.split(',') : [],
  // ...
}

// 接收前端数据时映射
const updateData = {
  line_name: data.lineName,
  line_type: data.lineType,
  standard_capacity: parseFloat(data.standardCapacity),
  standard_capacity_area: parseFloat(data.standardCapacityArea),
  workshop: data.workshop,
  main_equipment: Array.isArray(data.mainEquipments) 
    ? data.mainEquipments.join(',') 
    : data.mainEquipments
}
```

**检查清单**：
- ✅ 明确前后端字段命名规范（驼峰 vs 下划线）
- ✅ 数组与字符串的相互转换
- ✅ 数据类型转换（字符串转数字）
- ✅ 所有API方法（GET/POST/PUT/DELETE）都要处理字段映射

#### 5. V2版本API适配

**问题**：
- 系统使用V2版本API（支持7阶段业务流程和新表结构）
- V2 API路径为 `/api/v2/*`，不是 `/api/*`
- V2响应格式使用 `{ success: true }`，不是 `{ code: 'SUCCESS' }`

**解决方案**：
```javascript
// 配置文件：aps-frontend/src/utils/api-client.js
// 使用V2 API路径
export const getProductionLinesApi = async (params = {}) => {
  const response = await apiClient.get('/api/v2/production-lines', { params })
  return response
}

// 兼容V1和V2响应格式
if (result.code === 'SUCCESS' || result.success === true) {
  // 处理成功响应
}
```

**检查清单**：
- ✅ 确认使用正确的API版本（V1 vs V2）
- ✅ 检查API路径前缀（`/api/` vs `/api/v2/`）
- ✅ 兼容不同的响应格式
- ✅ 更新前端提示信息，避免误导

#### 6. 前端Store导入错误

**问题**：
- Store文件直接从 `utils/api` 导入，而不是从 `utils/api-unified` 导入
- 导致无法根据模式切换API

**解决方案**：
```javascript
// 错误：aps-frontend/src/stores/order.js
import { getOrders } from '../utils/api'

// 正确：
import { getOrders } from '../utils/api-unified'
```

**检查清单**：
- ✅ 检查所有Store文件的导入语句
- ✅ 确保使用 `api-unified` 而不是 `api`
- ✅ 搜索并修复所有直接导入 `api` 的文件

#### 7. 自动生成ID问题

**问题**：
- 前端新增产线时没有生成 `lineId`
- 后端创建时缺少必需的主键

**解决方案**：
```javascript
// 文件：aps-frontend/src/views/capacity/ProductionLineManage.vue
const addLine = () => {
  isEditMode.value = false
  editForm.value = {
    lineId: `LINE${Date.now().toString().slice(-6)}`, // 自动生成产线ID
    lineName: '',
    lineType: '开料线',
    standardCapacity: 500,
    // ...
  }
  editDialogVisible.value = true
}
```

**检查清单**：
- ✅ 新增表单必须包含主键字段
- ✅ 使用时间戳或其他方法生成唯一ID
- ✅ 确保ID格式符合数据库约束

---

## 🎯 总结

### 核心原则

1. **数据格式统一**：前后端数据格式必须保持一致
2. **模式自动切换**：使用统一API服务，业务代码无需关心底层实现
3. **软删除优先**：删除操作使用软删除，数据可恢复
4. **完善的错误处理**：所有操作都要有错误处理和用户提示
5. **用户体验优先**：提供确认对话框、加载状态、成功提示等

### 关键要点

- ✅ **API路径**：确保前后端API路径一致
- ✅ **端口配置**：确保API基础URL端口正确
- ✅ **数据映射**：数据库字段与前端字段的正确映射
- ✅ **数组处理**：字符串与数组的相互转换
- ✅ **模式判断**：使用`isMockMode()`判断当前模式
- ✅ **统一导入**：从`api-unified`导入API函数

### 避免的坑

### 避免的坑

#### 数据库相关
- ❌ **不要使用错误的数据库表**：仔细确认每个功能对应的正确表
- ❌ **不要忽略字段缺失**：对比前后端字段，及时添加缺失字段
- ❌ **不要忘记更新Model**：数据库字段变更后必须同步更新Model文件
- ❌ **不要忽略字段映射**：前后端字段名、类型、格式要正确映射

#### API相关
- ❌ **不要混淆API版本**：明确使用V1还是V2，路径和响应格式不同
- ❌ **不要硬编码API路径**：使用配置文件，便于维护
- ❌ **不要忽略响应格式**：V1和V2响应格式不同，要兼容处理
- ❌ **不要忽略错误提示信息**：更新提示信息，避免误导用户

#### 前端相关
- ❌ **不要直接从`api.js`导入**：要使用`api-unified.js`实现模式切换
- ❌ **不要忽略Store导入**：检查所有Store文件的导入语句
- ❌ **不要忘记生成主键**：新增表单必须包含主键字段
- ❌ **不要忽略数据格式化**：确保前后端数据格式一致
- ❌ **不要缺少用户确认**：删除操作需要二次确认
- ❌ **不要忽略错误处理**：所有操作都要有异常捕获

---

## 📞 技术支持

如果遇到问题，请参考：
1. 本文档的"常见问题和解决方案"章节
2. 标准产能设置的完整实现代码
3. 检查清单确保所有步骤都已完成

**改造完成后，请务必在两种模式下进行全面测试！**
