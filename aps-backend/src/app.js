require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection } = require('./database/connection');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const routesV2 = require('./routes-v2/index');

const app = express();

// 中间件
app.use(helmet()); // 安全头
app.use(cors()); // 跨域
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true })); // URL编码解析
app.use(morgan('combined')); // 日志
app.use(requestLogger); // 请求日志

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// V2 API路由
app.use(routesV2);

// 错误处理中间件(必须在所有路由之后)
app.use(errorHandler);

const PORT = process.env.PORT || 3002;

app.listen(PORT, async () => {
  console.log(`\n========================================`);
  console.log(`JN-APS Server V2 is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API Version: V2 (7阶段业务流程)`);
  console.log(`========================================\n`);

  // 测试数据库连接
  try {
    await testConnection();
    console.log('✓ Database connection successful\n');
  } catch (error) {
    console.warn('✗ Database connection warning:', error.message);
    console.warn('Server will continue without database connection\n');
  }

  console.log('API Documentation:');
  console.log(`  http://localhost:${PORT}/api/v2\n`);
});

module.exports = app;
