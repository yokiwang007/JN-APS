# JN-APS 后端服务

JN-APS系统后端服务,提供RESTful API接口和数据库支持。

## 技术栈

- Node.js + Express
- Sequelize ORM
- MySQL 8.0
- JWT认证
- Winston日志

## 项目结构

```
aps-backend/
├── src/
│   ├── config/           # 配置文件
│   ├── controllers/      # 控制器层
│   ├── services/         # 服务层
│   ├── models/           # 数据模型
│   ├── routes/           # 路由定义
│   ├── middleware/       # 中间件
│   ├── utils/            # 工具函数
│   └── database/         # 数据库相关
│       ├── migrations/   # 迁移文件
│       ├── seeders/      # 种子数据
│       ├── connection.js # 数据库连接
│       └── init.js       # 数据库初始化脚本
├── .env                # 环境变量
├── .env.example        # 环境变量示例
├── package.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置:

```bash
cp .env.example .env
```

主要配置项:
- `PORT`: 服务端口(默认3001)
- `DB_HOST`: 数据库主机
- `DB_PORT`: 数据库端口
- `DB_NAME`: 数据库名称
- `DB_USER`: 数据库用户名
- `DB_PASSWORD`: 数据库密码
- `JWT_SECRET`: JWT密钥

### 3. 初始化数据库

**方式一: 使用初始化脚本(推荐)**

```bash
npm run init-db
```

此脚本会:
- 创建数据库(如果不存在)
- 创建所有表结构
- 插入初始种子数据

**方式二: 手动创建数据库**

```bash
# 登录MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE aps_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户(可选)
CREATE USER 'aps_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON aps_db.* TO 'aps_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. 启动服务

**开发模式:**
```bash
npm run dev
```

**生产模式:**
```bash
npm start
```

### 5. 测试服务

健康检查:
```bash
curl http://localhost:3001/health
```

预期响应:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## API接口

### 认证接口

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新Token

### 订单接口

- `GET /api/orders` - 查询订单列表
- `GET /api/orders/:orderNo` - 查询订单详情
- `POST /api/orders` - 创建订单
- `PUT /api/orders/:orderNo` - 更新订单
- `DELETE /api/orders/:orderNo` - 删除订单
- `POST /api/orders/preprocess` - 订单预处理

### 批次接口

- `GET /api/batches` - 查询批次列表
- `GET /api/batches/:batchNo` - 查询批次详情
- `POST /api/batches/plan` - 批次规划
- `PUT /api/batches/:batchNo` - 更新批次
- `DELETE /api/batches/:batchNo` - 删除批次

### 排程接口

- `GET /api/schedules` - 查询排程列表
- `POST /api/schedules/optimize` - 排程优化
- `POST /api/schedules/issue` - 下发指令

### 监控接口

- `GET /api/monitor/progress` - 查询生产进度
- `GET /api/monitor/anomalies` - 查询异常预警

### 策略接口

- `GET /api/strategies` - 查询策略列表
- `POST /api/strategies` - 创建策略
- `PUT /api/strategies/:strategyId` - 更新策略
- `PUT /api/strategies/:strategyId/activate` - 激活策略
- `DELETE /api/strategies/:strategyId` - 删除策略

### 产能接口

- `GET /api/production-lines` - 查询产线列表
- `PUT /api/production-lines/:lineId` - 更新产线
- `GET /api/process-routes` - 查询工艺路线
- `PUT /api/process-routes/:routeId` - 更新工艺路线

## 数据模型

### 核心表

1. **users** - 用户表
2. **orders** - 订单表
3. **panels** - 板件表
4. **batches** - 批次表
5. **batch_orders** - 批次订单关联表
6. **schedules** - 排程表
7. **production_lines** - 产线表
8. **process_routes** - 工艺路线表
9. **strategies** - 策略表
10. **materials** - 物料表

## 认证机制

使用JWT进行认证:

1. 用户登录获取Token
2. 每次API请求在Header中携带Token: `Authorization: Bearer <token>`
3. Token有效期: 24小时

## 日志

日志文件位于 `logs/` 目录:
- `combined.log` - 所有日志
- `error.log` - 错误日志

## 开发说明

### 代码规范

项目使用ESLint和Prettier进行代码规范检查:

```bash
# 检查代码规范
npx eslint .

# 格式化代码
npx prettier --write .
```

### 数据库迁移

使用Sequelize CLI进行数据库迁移:

```bash
# 生成迁移文件
npx sequelize-cli migration:generate --name create-table

# 执行迁移
npx sequelize-cli db:migrate

# 回滚迁移
npx sequelize-cli db:migrate:undo
```

### 种子数据

```bash
# 执行种子数据
npx sequelize-cli db:seed:all

# 回滚种子数据
npx sequelize-cli db:seed:undo:all
```

## 部署

### 生产环境配置

1. 设置环境变量
2. 构建项目: `npm install --production`
3. 启动服务: `npm start`
4. 使用PM2管理进程: `pm2 start src/app.js --name aps-backend`

### Docker部署

(待实现)

## 故障排查

### 数据库连接失败

检查:
1. MySQL服务是否启动
2. 数据库用户名密码是否正确
3. 数据库是否已创建
4. 网络连接是否正常

### 端口被占用

修改 `.env` 文件中的 `PORT` 配置。

## 许可证

ISC
