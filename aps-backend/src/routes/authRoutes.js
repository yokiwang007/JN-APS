/**
 * 认证路由
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// 用户登录
router.post('/login', authController.login);

// 刷新Token
router.post('/refresh', authController.refreshToken);

module.exports = router;
