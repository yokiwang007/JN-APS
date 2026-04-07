/**
 * 数据库初始化脚本 V2.0
 * 基于优化需求文档的11个表结构
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

    // 1. 销售订单主表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS erp_sales_order (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        order_id VARCHAR(32) NOT NULL UNIQUE,
        customer_name VARCHAR(100) NOT NULL,
        due_date DATE NOT NULL,
        total_amount DECIMAL(15,2),
        priority INT NOT NULL DEFAULT 3,
        fulfillment_rule VARCHAR(20) NOT NULL DEFAULT 'full',
        status VARCHAR(20) NOT NULL DEFAULT '待拆解',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_status (status),
        INDEX idx_due_date (due_date),
        INDEX idx_priority (priority)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='销售订单主表'
    `);

    // 2. 底层零件明细表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cad_bom_part (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        part_id VARCHAR(50) NOT NULL UNIQUE,
        order_id VARCHAR(32) NOT NULL,
        part_type VARCHAR(50) NOT NULL,
        length DECIMAL(10,2) NOT NULL,
        width DECIMAL(10,2) NOT NULL,
        thickness INT NOT NULL,
        material VARCHAR(50) NOT NULL,
        color VARCHAR(50) NOT NULL,
        edge_banding VARCHAR(100),
        barcode VARCHAR(100),
        area DECIMAL(10,4),
        process_route VARCHAR(100),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_order_id (order_id),
        INDEX idx_process_route (process_route),
        INDEX idx_material (material),
        INDEX idx_color (color)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='底层零件明细表'
    `);

    // 3. 生产子订单表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS aps_production_order (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        production_order_id VARCHAR(32) NOT NULL UNIQUE,
        order_id VARCHAR(32) NOT NULL,
        process_route VARCHAR(100) NOT NULL,
        total_part_count INT NOT NULL,
        material VARCHAR(50) NOT NULL,
        thickness INT NOT NULL,
        color VARCHAR(50) NOT NULL,
        edge_banding VARCHAR(100),
        planned_date DATE,
        line_id VARCHAR(32),
        status VARCHAR(20) NOT NULL DEFAULT '待排程',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_order_id (order_id),
        INDEX idx_status (status),
        INDEX idx_planned_date (planned_date),
        INDEX idx_line_id (line_id),
        INDEX idx_process_route (process_route)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生产子订单表'
    `);

    // 4. 工作中心/虚拟产线表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sys_work_center (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        line_id VARCHAR(32) NOT NULL UNIQUE,
        line_name VARCHAR(50) NOT NULL,
        line_type VARCHAR(50) NOT NULL,
        daily_capacity INT NOT NULL,
        daily_capacity_area DECIMAL(10,2),
        work_center_ids VARCHAR(200),
        status VARCHAR(20) NOT NULL DEFAULT '正常',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_status (status),
        INDEX idx_line_type (line_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作中心/虚拟产线表'
    `);

    // 5. 排程任务表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS aps_schedule_task (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        task_id VARCHAR(32) NOT NULL UNIQUE,
        production_order_id VARCHAR(32) NOT NULL,
        planned_start_date DATE NOT NULL,
        planned_end_date DATE NOT NULL,
        line_id VARCHAR(32) NOT NULL,
        priority INT NOT NULL,
        schedule_status VARCHAR(20) NOT NULL DEFAULT '已排定',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_production_order_id (production_order_id),
        INDEX idx_line_id (line_id),
        INDEX idx_planned_start_date (planned_start_date),
        INDEX idx_schedule_status (schedule_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排程任务表'
    `);

    // 6. 生产批次主表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS aps_merge_batch (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        batch_id VARCHAR(32) NOT NULL UNIQUE,
        line_id VARCHAR(32) NOT NULL,
        production_date DATE NOT NULL,
        material VARCHAR(50) NOT NULL,
        thickness INT NOT NULL,
        color VARCHAR(50) NOT NULL,
        total_part_count INT NOT NULL,
        merge_rule VARCHAR(50) NOT NULL,
        utilization_rate DECIMAL(5,2),
        optimize_status VARCHAR(20) NOT NULL DEFAULT '待优化',
        status VARCHAR(20) NOT NULL DEFAULT '待排程',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_line_id (line_id),
        INDEX idx_production_date (production_date),
        INDEX idx_status (status),
        INDEX idx_optimize_status (optimize_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生产批次主表'
    `);

    // 7. 批次明细映射表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS aps_batch_detail (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        batch_id VARCHAR(32) NOT NULL,
        production_order_id VARCHAR(32) NOT NULL,
        part_id VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_batch_id (batch_id),
        INDEX idx_production_order_id (production_order_id),
        INDEX idx_part_id (part_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='批次明细映射表'
    `);

    // 8. 排版图表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cam_cutting_pattern (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        pattern_id VARCHAR(50) NOT NULL UNIQUE,
        batch_id VARCHAR(32) NOT NULL,
        required_board_count INT NOT NULL,
        board_specification VARCHAR(50),
        utilization_rate DECIMAL(5,2),
        waste_rate DECIMAL(5,2),
        image_path VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_batch_id (batch_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排版图表'
    `);

    // 9. 在制品工序扫码表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS mes_wip_tracking (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        tracking_id VARCHAR(50) NOT NULL UNIQUE,
        part_id VARCHAR(50) NOT NULL,
        batch_id VARCHAR(32),
        current_process VARCHAR(50) NOT NULL,
        operation_time TIMESTAMP NOT NULL,
        operator VARCHAR(50),
        equipment_id VARCHAR(50),
        status VARCHAR(20) NOT NULL DEFAULT '进行中',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_part_id (part_id),
        INDEX idx_batch_id (batch_id),
        INDEX idx_current_process (current_process),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='在制品工序扫码表'
    `);

    // 10. 齐套分拣货位表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS mes_sorting_slot (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        slot_id VARCHAR(32) NOT NULL UNIQUE,
        order_id VARCHAR(32) NOT NULL,
        total_parts INT NOT NULL,
        completed_parts INT NOT NULL DEFAULT 0,
        completion_progress VARCHAR(20),
        completion_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
        estimated_completion_date DATE,
        waiting_days INT NOT NULL DEFAULT 0,
        sort_status VARCHAR(20) NOT NULL DEFAULT '待齐套',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        INDEX idx_order_id (order_id),
        INDEX idx_sort_status (sort_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='齐套分拣货位表'
    `);

    // 11. 齐套明细表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS mes_fulfillment_detail (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        slot_id VARCHAR(32) NOT NULL,
        production_order_id VARCHAR(32) NOT NULL,
        completed_parts INT NOT NULL,
        completion_date TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slot_id (slot_id),
        INDEX idx_production_order_id (production_order_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='齐套明细表'
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
  // 插入工作中心数据
  await connection.query(`
    INSERT INTO sys_work_center (line_id, line_name, line_type, daily_capacity, daily_capacity_area, work_center_ids, status) VALUES
    ('LINE001', '柜体A线', '标准柜体线', 500, 150.0, 'WC001,WC002,WC003', '正常'),
    ('LINE002', '柜体B线', '标准柜体线', 450, 135.0, 'WC004,WC005,WC006', '正常'),
    ('LINE003', '门板线', '吸塑门板线', 300, 90.0, 'WC007,WC008', '正常'),
    ('LINE004', '背板线', '背板线', 600, 180.0, 'WC009,WC010', '正常'),
    ('LINE005', '吸塑线', '吸塑线', 200, 60.0, 'WC011', '正常'),
    ('LINE006', '包装线', '包装线', 800, 240.0, 'WC012,WC013', '正常')
    ON DUPLICATE KEY UPDATE line_id=line_id
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
