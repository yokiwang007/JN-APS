/**
 * 错误处理中间件
 */

const logger = require('../utils/logger');

/**
 * 错误处理中间件
 * 统一处理所有错误
 */
function errorHandler(err, req, res, next) {
  logger.error('Error:', err);

  // 数据库唯一性冲突
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      code: 'CONFLICT',
      message: '数据已存在',
      data: null,
      timestamp: new Date().toISOString()
    });
  }

  // 数据库验证错误
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: err.errors[0]?.message || '参数验证失败',
      data: null,
      timestamp: new Date().toISOString()
    });
  }

  // 数据库外键约束错误
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: '数据关联失败,请检查关联数据是否存在',
      data: null,
      timestamp: new Date().toISOString()
    });
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 'AUTH_ERROR',
      message: 'Token无效',
      data: null,
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 'AUTH_ERROR',
      message: 'Token已过期',
      data: null,
      timestamp: new Date().toISOString()
    });
  }

  // 自定义错误
  if (err.message) {
    return res.status(400).json({
      code: 'ERROR',
      message: err.message,
      data: null,
      timestamp: new Date().toISOString()
    });
  }

  // 未知错误
  res.status(500).json({
    code: 'ERROR',
    message: '服务器内部错误',
    data: null,
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;
