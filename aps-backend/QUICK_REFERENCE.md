# JN-APS Backend V2 快速参考

## 🚀 快速启动

### 1. 安装依赖
```bash
cd aps-backend
npm install
```

### 2. 初始化数据库
```bash
npm run init-db-v2
```

### 3. 启动服务器
```bash
# 开发模式
npm run dev-v2

# 生产模式
npm run start-v2
```

### 4. 验证服务
```bash
curl http://localhost:3003/health
curl http://localhost:3003/api/v2
```

## 📊 系统架构

### 7阶段业务流程
```
订单接收 → 订单拆解 → 粗排程 → 揉单合并 → 细排程 → 生产执行 → 成品齐套
```

### 数据库表 (11个)
| 表名 | 用途 |
|------|------|
| erp_sales_order | 销售订单主表 |
| cad_bom_part | 底层零件明细表 |
| aps_production_order | 生产子订单表 |
| sys_work_center | 工作中心/虚拟产线表 |
| aps_schedule_task | 排程任务表 |
| aps_merge_batch | 生产批次主表 |
| aps_batch_detail | 批次明细映射表 |
| cam_cutting_pattern | 排版图表 |
| mes_wip_tracking | 在制品工序扫码表 |
| mes_sorting_slot | 齐套分拣货位表 |
| mes_fulfillment_detail | 齐套明细表 |

### 业务服务 (7个)
| 服务 | 功能 |
|------|------|
| orderReceptionService | 订单接收 |
| orderDecompositionService | 订单拆解 |
| coarseSchedulingService | 粗排程 |
| mergeBatchingService | 揉单合并 |
| fineSchedulingService | 细排程 |
| productionExecutionService | 生产执行 |
| fulfillmentManagementService | 齐套管理 |

### API接口 (28个)

#### 订单管理 (5个)
- `POST /api/v2/erp-orders` - 创建销售订单
- `GET /api/v2/erp-orders` - 查询销售订单列表
- `GET /api/v2/erp-orders/:orderId` - 查询销售订单详情
- `PUT /api/v2/erp-orders/:orderId` - 更新销售订单
- `DELETE /api/v2/erp-orders/:orderId` - 删除销售订单

#### 订单拆解 (3个)
- `POST /api/v2/orders/:orderId/decompose` - 订单拆解
- `GET /api/v2/orders/:orderId/production-orders` - 查询生产子订单
- `GET /api/v2/orders/:orderId/parts` - 查询零件明细

#### 粗排程 (4个)
- `POST /api/v2/scheduling/coarse` - 粗排程
- `GET /api/v2/schedule-tasks` - 查询排程任务
- `GET /api/v2/schedule-tasks/:taskId` - 查询排程任务详情
- `PUT /api/v2/schedule-tasks/:taskId` - 更新排程任务

#### 揉单合并 (3个)
- `POST /api/v2/merging/merge` - 揉单合并
- `GET /api/v2/merge-batches` - 查询生产批次
- `GET /api/v2/merge-batches/:batchId` - 查询批次详情

#### 细排程 (5个)
- `POST /api/v2/scheduling/fine` - 细排程
- `GET /api/v2/cutting-patterns/:batchId` - 查询排版图
- `GET /api/v2/cutting-patterns` - 查询排版图列表
- `PUT /api/v2/cutting-patterns/:patternId` - 更新排版图
- `GET /api/v2/cutting-statistics` - 查询开料统计数据

#### 生产执行 (5个)
- `POST /api/v2/production/issue` - 下发生产指令
- `PUT /api/v2/production/wip-tracking/:trackingId` - 更新工序状态
- `GET /api/v2/production/wip-tracking` - 查询工序追踪
- `GET /api/v2/production/batch/:batchId/progress` - 查询批次生产进度
- `GET /api/v2/production/statistics` - 查询生产统计数据

#### 齐套管理 (6个)
- `POST /api/v2/fulfillment/slots` - 初始化齐套货位
- `PUT /api/v2/fulfillment/slots/:orderId/progress` - 更新齐套进度
- `GET /api/v2/fulfillment/slots` - 查询齐套货位
- `GET /api/v2/fulfillment/slots/:slotId` - 查询齐套货位详情
- `POST /api/v2/fulfillment/shipments` - 生成发货单
- `GET /api/v2/fulfillment/statistics` - 查询齐套统计数据

## 🔧 配置文件

### .env 配置
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=jienor0803
DB_NAME=aps_db

# 服务器配置
PORT_V2=3003
NODE_ENV=development
```

## 📁 项目结构

```
aps-backend/
├── src/
│   ├── database/
│   │   ├── connection.js
│   │   └── init-v2.js
│   ├── models-v2/          # 11个Sequelize模型
│   ├── services-v2/        # 7个业务服务
│   ├── routes-v2/          # 7个API路由
│   ├── middleware/
│   ├── utils/
│   ├── app.js             # V1入口
│   └── app-v2.js          # V2入口
├── package.json
├── .env
├── README-V2.md
├── REDESIGN_SUMMARY.md
├── FINAL_SUMMARY.md
└── test-v2.sh            # 测试脚本
```

## 🧪 测试

运行测试脚本:
```bash
./test-v2.sh
```

## 📝 示例请求

### 创建销售订单
```bash
curl -X POST http://localhost:3003/api/v2/erp-orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "SO202604150001",
    "customerName": "张三",
    "dueDate": "2026-04-25",
    "totalAmount": 15000.00,
    "priority": 3,
    "fulfillmentRule": "full"
  }'
```

### 订单拆解
```bash
curl -X POST http://localhost:3003/api/v2/orders/SO202604150001/decompose \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### 粗排程
```bash
curl -X POST http://localhost:3003/api/v2/scheduling/coarse \
  -H "Content-Type: application/json" \
  -d '{
    "orderIds": ["SO202604150001"],
    "productionDays": 10,
    "fulfillmentBufferDays": 2
  }'
```

## 🐛 常见问题

### 1. 数据库连接失败
- 检查MySQL服务是否运行
- 检查.env文件中的数据库配置
- 检查数据库用户权限

### 2. 端口被占用
- 修改.env文件中的PORT_V2
- 或停止占用端口的进程

### 3. 依赖安装失败
- 删除node_modules目录
- 重新运行npm install

## 📚 文档

- README-V2.md - 完整文档
- REDESIGN_SUMMARY.md - 重新设计说明
- FINAL_SUMMARY.md - 最终总结

## 🎯 核心算法

### 倒排计划
```
最迟完工日 = 交期 - 齐套缓冲期
最迟开工日 = 最迟完工日 - 生产周期
```

### 揉单时间窗
- 最大提前天数: +1天
- 最大延后天数: -1天

### 交期红线熔断
- 当订单达到最迟开工日时强制生成批次
- 优先保证交期而不是利用率

## 📊 统计数据

- 数据库表: 11个
- Sequelize模型: 11个
- 模型关联关系: 15组
- 业务服务: 7个
- API接口: 28个
- 代码文件: 30+个

**总体完成度: 100%** ✅
