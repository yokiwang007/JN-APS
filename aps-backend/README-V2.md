# JN-APS 后端系统 V2

## 概述

V2版本是基于优化需求文档重新设计的JN-APS后端系统,完全支持7阶段业务流程。

## 核心特性

- ✅ 完整的7阶段业务流程支持
- ✅ 11个数据库表,符合优化需求文档
- ✅ 11个Sequelize模型,支持软删除
- ✅ 15组完整的模型关联关系
- ✅ 7个业务服务,覆盖所有业务场景
- ✅ 28个API接口,支持完整的CRUD操作
- ✅ 倒排计划算法
- ✅ 揉单合并功能
- ✅ 开料优化集成
- ✅ 齐套管理功能

## 业务流程

```
阶段1: 订单接收 (erp_sales_order)
  ↓
阶段2: 订单拆解 (cad_bom_part + aps_production_order)
  ↓
阶段3: 粗排程 (aps_schedule_task)
  ↓
阶段4: 揉单合并 (aps_merge_batch + aps_batch_detail)
  ↓
阶段5: 细排程 (cam_cutting_pattern)
  ↓
阶段6: 生产执行 (mes_wip_tracking)
  ↓
阶段7: 成品齐套 (mes_sorting_slot + mes_fulfillment_detail)
```

## 数据库表结构

| 序号 | 表名 | 中文名称 | 阶段 |
|------|------|----------|------|
| 1 | erp_sales_order | 销售订单主表 | 订单接收 |
| 2 | cad_bom_part | 底层零件明细表 | 订单拆解 |
| 3 | aps_production_order | 生产子订单表 | 订单拆解 |
| 4 | sys_work_center | 工作中心/虚拟产线表 | 粗排程 |
| 5 | aps_schedule_task | 排程任务表 | 粗排程 |
| 6 | aps_merge_batch | 生产批次主表 | 揉单合并 |
| 7 | aps_batch_detail | 批次明细映射表 | 揉单合并 |
| 8 | cam_cutting_pattern | 排版图表 | 细排程 |
| 9 | mes_wip_tracking | 在制品工序扫码表 | 生产执行 |
| 10 | mes_sorting_slot | 齐套分拣货位表 | 成品齐套 |
| 11 | mes_fulfillment_detail | 齐套明细表 | 成品齐套 |

## 快速开始

### 1. 安装依赖

```bash
cd aps-backend
npm install
```

### 2. 配置环境变量

确保`.env`文件包含以下配置:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=jienor0803
DB_NAME=aps_db
PORT_V2=3003
NODE_ENV=development
```

### 3. 初始化数据库

```bash
npm run init-db-v2
```

### 4. 启动服务器

```bash
# 生产模式
npm run start-v2

# 开发模式(支持热重载)
npm run dev-v2
```

### 5. 验证服务

访问以下URL验证服务是否正常运行:

```bash
# 健康检查
curl http://localhost:3003/health

# API文档
curl http://localhost:3003/api/v2
```

## API接口文档

### 订单管理API

#### 创建销售订单

```http
POST /api/v2/erp-orders
Content-Type: application/json

{
  "orderId": "SO202604150001",
  "customerName": "张三",
  "dueDate": "2026-04-25",
  "totalAmount": 15000.00,
  "priority": 3,
  "fulfillmentRule": "full"
}
```

#### 查询销售订单列表

```http
GET /api/v2/erp-orders?status=待拆解&page=1&pageSize=20
```

#### 查询销售订单详情

```http
GET /api/v2/erp-orders/:orderId
```

#### 更新销售订单

```http
PUT /api/v2/erp-orders/:orderId
Content-Type: application/json

{
  "customerName": "李四",
  "dueDate": "2026-04-26"
}
```

#### 删除销售订单

```http
DELETE /api/v2/erp-orders/:orderId
```

### 订单拆解API

#### 订单拆解

```http
POST /api/v2/orders/:orderId/decompose
Content-Type: application/json

{
  "parts": [
    {
      "partId": "PART001",
      "partType": "柜体板",
      "length": 1200,
      "width": 600,
      "thickness": 18,
      "material": "颗粒板",
      "color": "白色",
      "edgeBanding": "2mm封边"
    }
  ]
}
```

#### 查询生产子订单

```http
GET /api/v2/orders/:orderId/production-orders
```

#### 查询零件明细

```http
GET /api/v2/orders/:orderId/parts
```

### 粗排程API

#### 粗排程

```http
POST /api/v2/scheduling/coarse
Content-Type: application/json

{
  "orderIds": ["SO202604150001"],
  "productionDays": 10,
  "fulfillmentBufferDays": 2
}
```

#### 查询排程任务

```http
GET /api/v2/schedule-tasks?status=已排定&lineId=LINE001
```

#### 查询排程任务详情

```http
GET /api/v2/schedule-tasks/:taskId
```

#### 更新排程任务

```http
PUT /api/v2/schedule-tasks/:taskId
Content-Type: application/json

{
  "plannedStartDate": "2026-04-20",
  "lineId": "LINE002"
}
```

### 揉单合并API

#### 揉单合并

```http
POST /api/v2/merging/merge
Content-Type: application/json

{
  "lineId": "LINE001",
  "productionDate": "2026-04-20",
  "mergeRule": "板材利用率优先",
  "timeWindowDays": 1
}
```

#### 查询生产批次

```http
GET /api/v2/merge-batches?status=待排程&lineId=LINE001
```

#### 查询批次详情

```http
GET /api/v2/merge-batches/:batchId
```

### 细排程API

#### 细排程

```http
POST /api/v2/scheduling/fine
Content-Type: application/json

{
  "batchId": "B20260420-LINE001-001",
  "boardSpecification": "1220x2440mm 18mm"
}
```

#### 查询排版图

```http
GET /api/v2/cutting-patterns/:batchId
```

#### 查询排版图列表

```http
GET /api/v2/cutting-patterns?minUtilizationRate=90
```

#### 更新排版图

```http
PUT /api/v2/cutting-patterns/:patternId
Content-Type: application/json

{
  "utilizationRate": 92.5,
  "wasteRate": 7.5
}
```

#### 查询开料统计数据

```http
GET /api/v2/cutting-statistics?startDate=2026-04-01&endDate=2026-04-30
```

### 生产执行API

#### 下发生产指令

```http
POST /api/v2/production/issue
Content-Type: application/json

{
  "batchId": "B20260420-LINE001-001"
}
```

#### 更新工序状态

```http
PUT /api/v2/production/wip-tracking/:trackingId
Content-Type: application/json

{
  "currentProcess": "已封边",
  "operator": "张三",
  "equipmentId": "EQ001"
}
```

#### 查询工序追踪

```http
GET /api/v2/production/wip-tracking?batchId=B20260420-LINE001-001&status=进行中
```

#### 查询批次生产进度

```http
GET /api/v2/production/batch/:batchId/progress
```

#### 查询生产统计数据

```http
GET /api/v2/production/statistics?startDate=2026-04-01&endDate=2026-04-30
```

### 齐套管理API

#### 初始化齐套货位

```http
POST /api/v2/fulfillment/slots
Content-Type: application/json

{
  "orderId": "SO202604150001",
  "totalParts": 100,
  "estimatedCompletionDate": "2026-04-25"
}
```

#### 更新齐套进度

```http
PUT /api/v2/fulfillment/slots/:orderId/progress
```

#### 查询齐套货位

```http
GET /api/v2/fulfillment/slots?status=部分齐套&minCompletionRate=50
```

#### 查询齐套货位详情

```http
GET /api/v2/fulfillment/slots/:slotId
```

#### 生成发货单

```http
POST /api/v2/fulfillment/shipments
Content-Type: application/json

{
  "slotId": "SLOTSO202604150001"
}
```

#### 查询齐套统计数据

```http
GET /api/v2/fulfillment/statistics?startDate=2026-04-01&endDate=2026-04-30
```

## 项目结构

```
aps-backend/
├── src/
│   ├── database/
│   │   ├── connection.js          # 数据库连接
│   │   ├── init.js                # V1数据库初始化
│   │   └── init-v2.js             # V2数据库初始化
│   ├── models-v2/                 # V2模型目录
│   │   ├── ErpSalesOrder.js
│   │   ├── CadBomPart.js
│   │   ├── ApsProductionOrder.js
│   │   ├── SysWorkCenter.js
│   │   ├── ApsScheduleTask.js
│   │   ├── ApsMergeBatch.js
│   │   ├── ApsBatchDetail.js
│   │   ├── CamCuttingPattern.js
│   │   ├── MesWipTracking.js
│   │   ├── MesSortingSlot.js
│   │   ├── MesFulfillmentDetail.js
│   │   └── index.js               # 模型索引和关联
│   ├── services-v2/               # V2服务目录
│   │   ├── orderReceptionService.js      # 阶段1: 订单接收服务
│   │   ├── orderDecompositionService.js  # 阶段2: 订单拆解服务
│   │   ├── coarseSchedulingService.js    # 阶段3: 粗排程服务
│   │   ├── mergeBatchingService.js       # 阶段4: 揉单合并服务
│   │   ├── fineSchedulingService.js      # 阶段5: 细排程服务
│   │   ├── productionExecutionService.js # 阶段6: 生产执行服务
│   │   ├── fulfillmentManagementService.js # 阶段7: 齐套管理服务
│   │   └── index.js               # 服务索引
│   ├── routes-v2/                 # V2路由目录
│   │   ├── orderRoutes.js
│   │   ├── decompositionRoutes.js
│   │   ├── coarseSchedulingRoutes.js
│   │   ├── mergeBatchingRoutes.js
│   │   ├── fineSchedulingRoutes.js
│   │   ├── productionExecutionRoutes.js
│   │   ├── fulfillmentManagementRoutes.js
│   │   └── index.js               # 路由索引
│   ├── middleware/                # 中间件
│   ├── utils/                     # 工具函数
│   ├── app.js                     # V1应用入口
│   └── app-v2.js                  # V2应用入口
├── package.json
├── .env
└── README-V2.md                   # V2文档
```

## 核心算法

### 1. 倒排计划算法

```javascript
// 最迟完工日 = 交期 - 齐套缓冲期
const latestFinishDate = new Date(dueDate);
latestFinishDate.setDate(dueDate.getDate() - fulfillmentBufferDays);

// 最迟开工日 = 最迟完工日 - 生产周期
const latestStartDate = new Date(latestFinishDate);
latestStartDate.setDate(latestFinishDate.getDate() - productionCycle);
```

### 2. 揉单时间窗规则

- 最大提前天数: +1天
- 最大延后天数: -1天
- 防止严重的时间偏差

### 3. 交期红线熔断策略

当订单达到最迟开工日时强制生成批次,优先保证交期而不是利用率。

### 4. 齐套窗口容忍

同一订单的不同子订单允许在时间窗口内完工,全齐套订单必须所有子订单完成后才发货。

## 技术栈

- Node.js
- Express.js
- Sequelize ORM
- MySQL 8.0
- Winston (日志)
- Morgan (HTTP日志)
- Helmet (安全)
- CORS (跨域)

## 端口配置

- V1服务器: 3001 (默认)
- V2服务器: 3003 (默认)

可在`.env`文件中配置`PORT_V2`修改V2服务器端口。

## 注意事项

1. V1和V2版本可以同时运行,使用不同的端口
2. V2版本使用`models-v2`目录下的模型
3. V2版本使用`services-v2`目录下的服务
4. V2版本使用`routes-v2`目录下的路由
5. V2版本使用`app-v2.js`作为应用入口

## 开发建议

1. 使用`npm run dev-v2`启动开发模式,支持热重载
2. 使用Winston日志记录关键操作
3. 所有数据库操作使用事务保证数据一致性
4. 所有API接口都有错误处理和日志记录
5. 所有模型都使用paranoid模式支持软删除

## 后续优化

1. 添加单元测试和集成测试
2. 添加API文档(Swagger/OpenAPI)
3. 添加性能监控和告警
4. 添加缓存机制(Redis)
5. 添加消息队列(RabbitMQ/Kafka)
6. 优化排程算法
7. 添加机器学习预测功能

## 许可证

ISC
