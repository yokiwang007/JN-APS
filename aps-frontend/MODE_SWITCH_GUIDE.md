# JN-APS 前端模式切换说明

## 概述

JN-APS前端支持两种运行模式:
1. **模拟数据模式** - 使用localStorage存储模拟数据,无需后端服务
2. **真实API模式** - 连接真实的后端API服务器,使用MySQL数据库

## 如何切换模式

### 方法1: 通过页面顶部按钮切换

1. 打开前端页面 http://localhost:5173/
2. 在页面顶部找到"模拟数据模式"按钮
3. 点击按钮,选择想要切换的模式:
   - 模拟数据模式 - 使用本地存储数据
   - 真实API模式 - 连接后端API服务器
4. 确认后页面会自动刷新,应用新模式

### 方法2: 通过浏览器控制台切换

打开浏览器控制台(F12),执行以下命令:

```javascript
// 切换到模拟数据模式
localStorage.setItem('api_mode', 'mock')
location.reload()

// 切换到真实API模式
localStorage.setItem('api_mode', 'api')
location.reload()

// 查看当前模式
localStorage.getItem('api_mode')
```

## 两种模式的区别

### 模拟数据模式

**特点:**
- 使用localStorage存储数据
- 无需后端服务
- 数据保存在浏览器本地
- 适合演示和测试

**使用场景:**
- 前端开发和调试
- 功能演示
- 无后端环境时的测试

**数据存储:**
- 存储位置: 浏览器localStorage
- 存储键名: `aps_mock_data`
- 数据持久化: 是(直到清除浏览器缓存)

**重置数据:**
- 点击页面顶部的"重置数据"按钮
- 或在控制台执行: `localStorage.removeItem('aps_mock_data')`

### 真实API模式

**特点:**
- 连接真实的后端API服务器
- 使用MySQL数据库存储数据
- 支持多用户并发访问
- 数据持久化到数据库

**使用场景:**
- 完整系统测试
- 生产环境部署
- 多用户协作

**前提条件:**
- 后端服务已启动 (npm run dev-v2)
- 数据库已初始化 (npm run init-db-v2)
- API地址配置正确 (.env文件中的VITE_API_BASE_URL)

**API配置:**
在 `aps-frontend/.env` 文件中配置:
```env
VITE_API_BASE_URL=http://localhost:3003
```

## 当前状态判断

### 查看页面顶部

- **模拟数据模式**: 显示蓝色"模拟数据模式"按钮
- **真实API模式**: 显示绿色"真实API模式"按钮,并显示API连接状态

### API连接状态

在真实API模式下,页面顶部会显示API连接状态:
- ✅ **API连接正常** - 绿色标签,表示后端服务正常运行
- ❌ **API连接失败** - 红色标签,表示无法连接后端服务

## 故障排查

### 真实API模式连接失败

如果切换到真实API模式后显示"API连接失败",请检查:

1. **后端服务是否启动**
   ```bash
   cd aps-backend
   npm run dev-v2
   ```

2. **数据库是否初始化**
   ```bash
   cd aps-backend
   npm run init-db-v2
   ```

3. **API地址是否正确**
   - 检查 `aps-frontend/.env` 文件
   - 确认 `VITE_API_BASE_URL` 配置正确
   - 默认值: `http://localhost:3003`

4. **端口是否被占用**
   ```bash
   # 检查3003端口是否被占用
   lsof -i :3003
   ```

5. **跨域问题**
   - 确保后端配置了CORS
   - 检查后端 `src/app-v2.js` 中的CORS配置

### 模拟数据模式数据丢失

如果模拟数据模式下的数据丢失,可能是因为:
- 清除了浏览器缓存
- 使用了隐身模式
- 浏览器设置了自动清除数据

**解决方法:**
- 点击"重置数据"按钮恢复初始数据
- 切换到真实API模式使用数据库存储

## 技术实现

### 模式切换原理

```javascript
// 检查当前模式
const isMockMode = localStorage.getItem('api_mode') === 'mock'

// 自动选择API服务
const apiService = isMockMode ? mockApi : realApi

// 统一的API调用
const data = await apiService.getOrders()
```

### API服务文件

- `src/utils/config.js` - 模式配置和工具函数
- `src/utils/api.js` - 模拟数据API
- `src/utils/api-client.js` - 真实API客户端
- `src/utils/api-unified.js` - 统一API服务

## 最佳实践

1. **开发阶段**: 使用模拟数据模式,快速迭代开发
2. **测试阶段**: 切换到真实API模式,测试完整的业务流程
3. **生产部署**: 使用真实API模式,确保数据持久化
4. **演示展示**: 使用模拟数据模式,方便展示功能

## 注意事项

1. 切换模式会刷新页面,未保存的数据会丢失
2. 两种模式的数据是独立的,不会互相影响
3. 真实API模式需要后端服务支持
4. 模拟数据模式的数据存储在浏览器本地,清除缓存会丢失数据

## 快速命令

```bash
# 启动前端(默认模拟数据模式)
cd aps-frontend
npm run dev

# 启动后端(用于真实API模式)
cd aps-backend
npm run dev-v2

# 初始化数据库
cd aps-backend
npm run init-db-v2

# 前端访问地址
http://localhost:5173/

# 后端API地址
http://localhost:3003/api/v2
```

## 支持

如有问题,请查看:
- 前端文档: `aps-frontend/README.md`
- 后端文档: `aps-backend/README-V2.md`
- API文档: http://localhost:3003/api/v2
