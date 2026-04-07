# 数据库创建和初始化总结

## 执行时间
2026-04-05

## 数据库信息
- **数据库名**: aps_db
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci
- **主机**: localhost
- **端口**: 3306

## 表结构

### 1. users (用户表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| user_id | VARCHAR(32) | 用户ID(唯一) |
| username | VARCHAR(50) | 用户名(唯一) |
| password | VARCHAR(255) | 密码(加密) |
| real_name | VARCHAR(50) | 真实姓名 |
| role | VARCHAR(20) | 角色(ADMIN/PLANNER/USER) |
| status | VARCHAR(20) | 状态(正常/禁用) |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | 删除时间(软删除) |

### 2. orders (订单表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| order_no | VARCHAR(32) | 订单号(唯一) |
| customer_name | VARCHAR(100) | 客户名称 |
| product_type | VARCHAR(50) | 产品类型 |
| delivery_date | DATE | 交付日期 |
| status | VARCHAR(20) | 状态(待审核/待排产/已排产/生产中/已完成) |
| priority | VARCHAR(10) | 优先级(普通/紧急/特急) |
| special_process | VARCHAR(500) | 特殊工艺 |
| remark | VARCHAR(500) | 备注 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | 删除时间(软删除) |

### 3. panels (板件表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| panel_no | VARCHAR(50) | 板件号(唯一) |
| order_no | VARCHAR(32) | 所属订单号(外键) |
| batch_no | VARCHAR(32) | 所属批次号(外键) |
| panel_type | VARCHAR(20) | 部件类型(柜体板/门板/背板/装饰条) |
| length | INT | 长度(毫米) |
| width | INT | 宽度(毫米) |
| thickness | INT | 厚度(毫米) |
| color | VARCHAR(50) | 花色 |
| material | VARCHAR(50) | 材质 |
| edge_requirement | VARCHAR(100) | 封边要求 |
| process_route | VARCHAR(200) | 工艺路线 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | 删除时间(软删除) |

### 4. batches (批次表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| batch_no | VARCHAR(32) | 批次号(唯一) |
| color | VARCHAR(50) | 花色 |
| thickness | INT | 厚度 |
| material | VARCHAR(50) | 材质 |
| plan_start_date | DATE | 计划开始日期 |
| plan_end_date | DATE | 计划结束日期 |
| production_line | VARCHAR(50) | 产线 |
| utilization_rate | DECIMAL(5,2) | 利用率 |
| status | VARCHAR(20) | 状态 |
| panel_count | INT | 板件数量 |
| optimize_image_path | VARCHAR(255) | 优化图路径 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | 删除时间(软删除) |

### 5. batch_orders (批次订单关联表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| batch_no | VARCHAR(32) | 批次号(外键) |
| order_no | VARCHAR(32) | 订单号(外键) |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 6. schedules (排程表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| schedule_id | VARCHAR(50) | 排程ID(唯一) |
| batch_no | VARCHAR(32) | 批次号(外键) |
| process_name | VARCHAR(50) | 工序名称 |
| start_time | DATETIME | 开始时间 |
| end_time | DATETIME | 结束时间 |
| equipment_name | VARCHAR(50) | 设备名称 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | 删除时间(软删除) |

### 7. production_lines (产线表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| line_id | VARCHAR(32) | 产线ID(唯一) |
| line_name | VARCHAR(50) | 产线名称 |
| line_type | VARCHAR(20) | 产线类型(开料线/封边线/钻孔线/包装线) |
| standard_capacity | DECIMAL(10,2) | 标准产能 |
| status | VARCHAR(20) | 状态(正常/维护/停机) |
| workshop | VARCHAR(50) | 车间 |
| main_equipment | VARCHAR(200) | 主要设备 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | 删除时间(软删除) |

### 8. process_routes (工艺路线表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| route_id | VARCHAR(32) | 路线ID(唯一) |
| panel_type | VARCHAR(50) | 板件类型 |
| process_sequence | VARCHAR(200) | 工序序列 |
| standard_time | INT | 标准工时(分钟) |
| required_equipment | VARCHAR(200) | 所需设备 |
| process_requirement | VARCHAR(500) | 工艺要求 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | 删除时间(软删除) |

### 9. strategies (策略表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| strategy_id | VARCHAR(32) | 策略ID(唯一) |
| strategy_name | VARCHAR(50) | 策略名称 |
| description | VARCHAR(500) | 描述 |
| priority_weights | VARCHAR(500) | 优先级权重 |
| constraints | VARCHAR(500) | 约束条件 |
| enabled | BOOLEAN | 是否启用 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | 删除时间(软删除) |

### 10. materials (物料表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| material_no | VARCHAR(32) | 物料编号(唯一) |
| material_name | VARCHAR(100) | 物料名称 |
| material_type | VARCHAR(20) | 物料类型(板材/封边带/五金) |
| specification | VARCHAR(100) | 规格 |
| stock_quantity | DECIMAL(10,2) | 库存数量 |
| safety_stock | DECIMAL(10,2) | 安全库存 |
| warehouse | VARCHAR(50) | 仓库 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| deleted_at | TIMESTAMP | 删除时间(软删除) |

## 种子数据

### 用户数据 (1条)
| 用户ID | 用户名 | 真实姓名 | 角色 | 密码 |
|--------|--------|----------|------|------|
| USR001 | admin | 系统管理员 | ADMIN | admin123 |

### 产线数据 (6条)
1. PL001 - 电子锯线1 (开料线) - 一车间
2. PL002 - 电子锯线2 (开料线) - 一车间
3. PL003 - 封边线A (封边线) - 二车间
4. PL004 - 封边线B (封边线) - 二车间
5. PL005 - 钻孔线 (钻孔线) - 三车间
6. PL006 - 包装线 (包装线) - 四车间

### 工艺路线数据 (4条)
1. PR001 - 柜体板 - 开料,封边,钻孔,质检
2. PR002 - 门板 - 开料,铣型,封边,质检
3. PR003 - 背板 - 开料,封边,质检
4. PR004 - 装饰条 - 开料,镂铣,质检

### 策略数据 (3条)
1. STR001 - 成本优先 (未启用)
2. STR002 - 交期优先 (已启用)
3. STR003 - 产能均衡 (未启用)

### 物料数据 (5条)
1. MAT001 - 18mm子午灰颗粒板 (原料仓)
2. MAT002 - 18mm黑胡桃颗粒板 (原料仓)
3. MAT003 - 9mm背板 (原料仓)
4. MAT004 - 1mm子午灰ABS封边带 (辅料仓)
5. MAT005 - 三合一连接件 (五金仓)

## 测试数据

### 订单数据 (2条)
1. ORD20240101001 - 测试客户 - 衣柜 - 待审核
2. ORD20240101002 - 测试客户2 - 橱柜 - 待审核

### 板件数据 (2条)
1. BJORD20240101001001 - 柜体板 - 子午灰
2. BJORD20240101002001 - 门板 - 黑胡桃

## 索引

### 主要索引
- users: idx_role, idx_status
- orders: idx_status, idx_delivery_date, idx_priority
- panels: idx_order_no, idx_batch_no, idx_color, idx_thickness
- batches: idx_status, idx_production_line, idx_plan_start_date
- batch_orders: uk_batch_order (唯一), idx_batch_no, idx_order_no
- schedules: idx_batch_no, idx_start_time
- production_lines: idx_status, idx_line_type
- process_routes: idx_panel_type
- strategies: idx_enabled
- materials: idx_material_type, idx_warehouse

## 关联关系

### 一对多
- Order → Panel (一个订单包含多个板件)
- Batch → Panel (一个批次包含多个板件)
- Batch → Schedule (一个批次包含多个排程)

### 多对多
- Batch ↔ Order (通过batch_orders表关联)

## API测试结果

✅ 所有API测试通过
- ✓ 健康检查
- ✓ 用户登录
- ✓ 创建订单
- ✓ 获取订单列表
- ✓ 获取订单详情
- ✓ 更新订单
- ✓ Token刷新

## 数据库初始化命令

```bash
cd aps-backend
npm run init-db
```

## 后端服务启动命令

```bash
cd aps-backend
npm run dev  # 开发模式
npm start    # 生产模式
```

## API测试命令

```bash
cd aps-backend
node test-api.js
```

## 注意事项

1. 所有表都支持软删除(deleted_at字段)
2. 所有时间字段自动使用CURRENT_TIMESTAMP
3. 使用utf8mb4字符集支持emoji和特殊字符
4. 数据库连接密码存储在.env文件中
5. 服务运行在端口3002
6. JWT Token有效期24小时
