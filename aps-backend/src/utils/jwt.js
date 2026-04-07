/**
 * JWT工具函数
 */

const jwt = require('jsonwebtoken');

/**
 * 生成JWT Token
 * @param {Object} payload - Token载荷
 * @param {string} expiresIn - 过期时间
 * @returns {string} JWT Token
 */
function generateToken(payload, expiresIn = process.env.JWT_EXPIRES_IN || '24h') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

/**
 * 验证JWT Token
 * @param {string} token - JWT Token
 * @returns {Object} 解码后的Token载荷
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token无效或已过期');
  }
}

/**
 * 刷新JWT Token
 * @param {string} token - 旧的JWT Token
 * @returns {string} 新的JWT Token
 */
function refreshToken(token) {
  const decoded = verifyToken(token);
  // 移除过期时间等信息
  const { iat, exp, ...payload } = decoded;
  return generateToken(payload);
}

module.exports = {
  generateToken,
  verifyToken,
  refreshToken
};
