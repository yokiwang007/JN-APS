/**
 * 认证服务
 */

const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { generateToken, verifyToken, refreshToken } = require('../utils/jwt');
const logger = require('../utils/logger');

class AuthService {
  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Object} 登录结果
   */
  async login(username, password) {
    try {
      logger.info(`User login attempt: ${username}`);

      // 查找用户
      const user = await User.findOne({
        where: {
          username,
          deleted_at: null
        }
      });

      if (!user) {
        logger.warn(`User not found: ${username}`);
        throw new Error('用户名或密码错误');
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        logger.warn(`Invalid password for user: ${username}`);
        throw new Error('用户名或密码错误');
      }

      // 检查用户状态
      if (user.status !== '正常') {
        logger.warn(`User account disabled: ${username}`);
        throw new Error('用户账号已被禁用');
      }

      // 生成JWT Token
      const token = generateToken({
        userId: user.user_id,
        role: user.role,
        username: user.username
      });

      logger.info(`User login successful: ${username}`);

      return {
        token,
        user: {
          userId: user.user_id,
          username: user.username,
          realName: user.real_name,
          role: user.role
        }
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * 刷新Token
   * @param {string} token - 旧的Token
   * @returns {Object} 新Token
   */
  async refreshToken(token) {
    try {
      const decoded = verifyToken(token);

      const user = await User.findOne({
        where: {
          user_id: decoded.userId,
          deleted_at: null
        }
      });

      if (!user || user.status !== '正常') {
        logger.warn(`Invalid user for token refresh: ${decoded.userId}`);
        throw new Error('用户不存在或已被禁用');
      }

      // 生成新Token
      const newToken = refreshToken(token);

      logger.info(`Token refreshed for user: ${user.username}`);

      return { token: newToken };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * 验证Token
   * @param {string} token - JWT Token
   * @returns {Object} 解码后的Token载荷
   */
  verifyToken(token) {
    try {
      return verifyToken(token);
    } catch (error) {
      logger.error('Token verification error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
