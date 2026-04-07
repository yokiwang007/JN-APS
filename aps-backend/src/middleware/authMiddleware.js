/**
 * 认证中间件
 */

const { verifyToken } = require('../utils/jwt');
const { authErrorResponse } = require('../utils/response');

/**
 * 认证中间件
 * 验证JWT Token
 */
function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json(authErrorResponse('未授权,请先登录'));
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json(authErrorResponse('Token无效或已过期'));
  }
}

/**
 * 可选认证中间件
 * 如果有Token则验证,没有则跳过
 */
function optionalAuthMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    // Token无效时不阻止请求继续
    next();
  }
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
