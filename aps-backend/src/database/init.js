/**
 * 数据库初始化脚本
 * 用于创建数据库和表结构
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    console.log('Connected to MySQL server');

    // 创建数据库
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Database ${process.env.DB_NAME} created or already exists`);

    // 使用数据库
    await connection.query(`USE \`${process.env.DB_NAME}\``);

    // 创建用户表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id VARCHAR(32) NOT NULL UNIQUE,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        real_name VARCHAR(50) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'USER',
        status VARCHAR(20) NOT NULL DEFAULT '正常',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_role (role),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表'
    `);

    // 创建订单表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        order_no VARCHAR(32) NOT NULL UNIQUE,
        customer_name VARCHAR(100) NOT NULL,
        product_type VARCHAR(50) NOT NULL,
        delivery_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT '待审核',
        priority VARCHAR(10) NOT NULL DEFAULT '普通',
        special_process VARCHAR(500),
        remark VARCHAR(500),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_status (status),
        INDEX idx_delivery_date (delivery_date),
        INDEX idx_priority (priority)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表'
    `);

    // 创建板件表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS panels (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        panel_no VARCHAR(50) NOT NULL UNIQUE,
        order_no VARCHAR(32) NOT NULL,
        batch_no VARCHAR(32),
        panel_type VARCHAR(20) NOT NULL,
        length INT NOT NULL,
        width INT NOT NULL,
        thickness INT NOT NULL,
        color VARCHAR(50) NOT NULL,
        material VARCHAR(50) NOT NULL,
        edge_requirement VARCHAR(100) NOT NULL,
        process_route VARCHAR(200) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_order_no (order_no),
        INDEX idx_batch_no (batch_no),
        INDEX idx_color (color),
        INDEX idx_thickness (thickness),
        FOREIGN KEY (order_no) REFERENCES orders(order_no) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='板件表'
    `);

    // 创建批次表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS batches (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        batch_no VARCHAR(32) NOT NULL UNIQUE,
        color VARCHAR(50) NOT NULL,
        thickness INT NOT NULL,
        material VARCHAR(50) NOT NULL,
        plan_start_date DATE NOT NULL,
        plan_end_date DATE NOT NULL,
        production_line VARCHAR(50) NOT NULL,
        utilization_rate DECIMAL(5,2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT '待下发',
        panel_count INT NOT NULL,
        optimize_image_path VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_status (status),
        INDEX idx_production_line (production_line),
        INDEX idx_plan_start_date (plan_start_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='批次表'
    `);

    // 创建批次订单关联表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS batch_orders (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        batch_no VARCHAR(32) NOT NULL,
        order_no VARCHAR(32) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_batch_order (batch_no, order_no),
        INDEX idx_batch_no (batch_no),
        INDEX idx_order_no (order_no),
        FOREIGN KEY (batch_no) REFERENCES batches(batch_no) ON DELETE CASCADE,
        FOREIGN KEY (order_no) REFERENCES orders(order_no) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='批次订单关联表'
    `);

    // 创建排程表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schedules (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        schedule_id VARCHAR(50) NOT NULL UNIQUE,
        batch_no VARCHAR(32) NOT NULL,
        process_name VARCHAR(50) NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        equipment_name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_batch_no (batch_no),
        INDEX idx_start_time (start_time),
        FOREIGN KEY (batch_no) REFERENCES batches(batch_no) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排程表'
    `);

    // 创建产线表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS production_lines (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        line_id VARCHAR(32) NOT NULL UNIQUE,
        line_name VARCHAR(50) NOT NULL,
        line_type VARCHAR(20) NOT NULL,
        standard_capacity DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT '正常',
        workshop VARCHAR(50) NOT NULL,
        main_equipment VARCHAR(200) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_status (status),
        INDEX idx_line_type (line_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产线表'
    `);

    // 创建工艺路线表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS process_routes (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        route_id VARCHAR(32) NOT NULL UNIQUE,
        panel_type VARCHAR(50) NOT NULL,
        process_sequence VARCHAR(200) NOT NULL,
        standard_time INT NOT NULL,
        required_equipment VARCHAR(200) NOT NULL,
        process_requirement VARCHAR(500),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_panel_type (panel_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工艺路线表'
    `);

    // 创建策略表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS strategies (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        strategy_id VARCHAR(32) NOT NULL UNIQUE,
        strategy_name VARCHAR(50) NOT NULL,
        description VARCHAR(500) NOT NULL,
        priority_weights VARCHAR(500) NOT NULL,
        constraints VARCHAR(500) NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_enabled (enabled)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='策略表'
    `);

    // 创建物料表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        material_no VARCHAR(32) NOT NULL UNIQUE,
        material_name VARCHAR(100) NOT NULL,
        material_type VARCHAR(20) NOT NULL,
        specification VARCHAR(100) NOT NULL,
        stock_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
        safety_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
        warehouse VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_material_type (material_type),
        INDEX idx_warehouse (warehouse)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='物料表'
    `);

    console.log('All tables created successfully');

    // 插入种子数据
    await seedData(connection);

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

async function seedData(connection) {
  const bcrypt = require('bcryptjs');

  // 插入用户数据
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await connection.query(`
    INSERT INTO users (user_id, username, password, real_name, role, status) VALUES
    ('USR001', 'admin', ?, '系统管理员', 'ADMIN', '正常')
    ON DUPLICATE KEY UPDATE user_id=user_id
  `, [hashedPassword]);

  // 插入产线数据
  await connection.query(`
    INSERT INTO production_lines (line_id, line_name, line_type, standard_capacity, status, workshop, main_equipment) VALUES
    ('PL001', '电子锯线1', '开料线', 500.00, '正常', '一车间', '电子锯1,电子锯2'),
    ('PL002', '电子锯线2', '开料线', 450.00, '正常', '一车间', '电子锯3,电子锯4'),
    ('PL003', '封边线A', '封边线', 600.00, '正常', '二车间', '封边机1,封边机2'),
    ('PL004', '封边线B', '封边线', 550.00, '正常', '二车间', '封边机3,封边机4'),
    ('PL005', '钻孔线', '钻孔线', 700.00, '正常', '三车间', '六面钻1,六面钻2'),
    ('PL006', '包装线', '包装线', 800.00, '正常', '四车间', '包装机1,包装机2')
    ON DUPLICATE KEY UPDATE line_id=line_id
  `);

  // 插入工艺路线数据
  await connection.query(`
    INSERT INTO process_routes (route_id, panel_type, process_sequence, standard_time, required_equipment, process_requirement) VALUES
    ('PR001', '柜体板', '开料,封边,钻孔,质检', 15, '电子锯,封边机,六面钻', '需要五轴加工中心'),
    ('PR002', '门板', '开料,铣型,封边,质检', 20, '电子锯,铣型机,封边机', '需要拉米诺连接'),
    ('PR003', '背板', '开料,封边,质检', 10, '电子锯,封边机', ''),
    ('PR004', '装饰条', '开料,镂铣,质检', 25, '电子锯,镂铣机', '需要异形加工')
    ON DUPLICATE KEY UPDATE route_id=route_id
  `);

  // 插入策略数据
  await connection.query(`
    INSERT INTO strategies (strategy_id, strategy_name, description, priority_weights, constraints, enabled) VALUES
    ('STR001', '成本优先', '优先考虑板材利用率与换模成本,降低生产成本', '板材利用率:0.5,换模成本:0.3,交期满足率:0.2', '板材利用率≥85%,产能利用率≤95%', FALSE),
    ('STR002', '交期优先', '优先保证订单交期,确保按时交付', '交期满足率:0.5,板材利用率:0.3,换模成本:0.2', '板材利用率≥80%,交期延迟≤1天', TRUE),
    ('STR003', '产能均衡', '平衡各产线负荷,避免产能闲置或超负荷', '产能均衡:0.4,板材利用率:0.3,交期满足率:0.3', '产线负荷偏差≤20%', FALSE)
    ON DUPLICATE KEY UPDATE strategy_id=strategy_id
  `);

  // 插入物料数据
  await connection.query(`
    INSERT INTO materials (material_no, material_name, material_type, specification, stock_quantity, safety_stock, warehouse) VALUES
    ('MAT001', '18mm子午灰颗粒板', '板材', '2440×1220×18mm', 200.00, 50.00, '原料仓'),
    ('MAT002', '18mm黑胡桃颗粒板', '板材', '2440×1220×18mm', 150.00, 40.00, '原料仓'),
    ('MAT003', '9mm背板', '板材', '2440×1220×9mm', 300.00, 80.00, '原料仓'),
    ('MAT004', '1mm子午灰ABS封边带', '封边带', '22×1mm', 5000.00, 1000.00, '辅料仓'),
    ('MAT005', '三合一连接件', '五金', 'Φ8×50mm', 10000.00, 2000.00, '五金仓')
    ON DUPLICATE KEY UPDATE material_no=material_no
  `);

  console.log('Seed data inserted successfully');
}

// 如果直接运行此脚本
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase };
