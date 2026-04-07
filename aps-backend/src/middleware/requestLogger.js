/**
 * 请求日志中间件
 */

const logger = require('../utils/logger');

/**
 * 请求日志中间件
 * 记录所有API请求
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  // 记录请求信息
  logger.http(`${req.method} ${req.path} - ${req.ip}`);

  // 记录响应时间
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });

  next();
}

module.exports = requestLogger;
