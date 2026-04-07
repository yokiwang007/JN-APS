/**
 * 统一响应格式工具函数
 */

/**
 * 成功响应
 * @param {*} data - 响应数据
 * @param {string} message - 响应消息
 * @returns {Object} 统一格式的成功响应
 */
function successResponse(data, message = '操作成功') {
  return {
    code: 'SUCCESS',
    message,
    data,
    timestamp: new Date().toISOString()
  };
}

/**
 * 错误响应
 * @param {string} message - 错误消息
 * @param {string} code - 错误代码
 * @returns {Object} 统一格式的错误响应
 */
function errorResponse(message, code = 'ERROR') {
  return {
    code,
    message,
    data: null,
    timestamp: new Date().toISOString()
  };
}

/**
 * 验证错误响应
 * @param {string} message - 错误消息
 * @returns {Object} 验证错误响应
 */
function validationErrorResponse(message) {
  return errorResponse(message, 'VALIDATION_ERROR');
}

/**
 * 认证错误响应
 * @param {string} message - 错误消息
 * @returns {Object} 认证错误响应
 */
function authErrorResponse(message = '未授权,请先登录') {
  return errorResponse(message, 'AUTH_ERROR');
}

/**
 * 未找到错误响应
 * @param {string} message - 错误消息
 * @returns {Object} 未找到错误响应
 */
function notFoundErrorResponse(message = '请求的资源不存在') {
  return errorResponse(message, 'NOT_FOUND');
}

/**
 * 冲突错误响应
 * @param {string} message - 错误消息
 * @returns {Object} 冲突错误响应
 */
function conflictErrorResponse(message = '数据冲突') {
  return errorResponse(message, 'CONFLICT');
}

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  authErrorResponse,
  notFoundErrorResponse,
  conflictErrorResponse
};
