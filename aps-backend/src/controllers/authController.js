/**
 * 认证控制器
 */

const authService = require('../services/authService');
const { successResponse } = require('../utils/response');
const logger = require('../utils/logger');

class AuthController {
  /**
   * 用户登录
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: '用户名和密码不能为空',
          data: null,
          timestamp: new Date().toISOString()
        });
      }

      logger.info(`Login request from user: ${username}`);

      const result = await authService.login(username, password);
      res.status(200).json(successResponse(result, '登录成功'));
    } catch (error) {
      logger.error('Login controller error:', error);
      next(error);
    }
  }

  /**
   * 刷新Token
   */
  async refreshToken(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Token不能为空',
          data: null,
          timestamp: new Date().toISOString()
        });
      }

      const result = await authService.refreshToken(token);
      res.status(200).json(successResponse(result, 'Token刷新成功'));
    } catch (error) {
      logger.error('Refresh token controller error:', error);
      next(error);
    }
  }
}

module.exports = new AuthController();
