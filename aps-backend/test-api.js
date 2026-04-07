#!/usr/bin/env node

/**
 * API测试脚本
 * 用于测试后端API接口
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3002';
let authToken = '';

// 健康检查
async function testHealth() {
  console.log('=== 测试健康检查 ===');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✓ 健康检查通过:', response.data);
  } catch (error) {
    console.log('✗ 健康检查失败:', error.response?.data || error.message);
  }
}

// 测试登录
async function testLogin() {
  console.log('\n=== 测试登录接口 ===');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    console.log('✓ 登录成功');
    console.log('  用户:', response.data.data.user);
    console.log('  Token:', response.data.data.token.substring(0, 50) + '...');
    authToken = response.data.data.token;
  } catch (error) {
    console.log('✗ 登录失败:', error.response?.data?.message || error.message);
  }
}

// 测试创建订单
async function testCreateOrder() {
  console.log('\n=== 测试创建订单 ===');
  try {
    const response = await axios.post(`${BASE_URL}/api/orders`, {
      orderNo: 'ORD20240101002',
      customerName: '测试客户2',
      productType: '橱柜',
      deliveryDate: '2024-02-15',
      priority: '普通',
      remark: '测试订单2',
      panels: [
        {
          panelType: '门板',
          length: 600,
          width: 400,
          thickness: 18,
          color: '黑胡桃',
          material: '颗粒板',
          edgeRequirement: '1mm封边',
          processRoute: '开料,封边,钻孔'
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✓ 订单创建成功');
    console.log('  订单号:', response.data.data.orderNo);
    console.log('  客户:', response.data.data.customerName);
    console.log('  板件数:', response.data.data.panels.length);
  } catch (error) {
    console.log('✗ 创建订单失败:', error.response?.data?.message || error.message);
  }
}

// 测试获取订单列表
async function testGetOrders() {
  console.log('\n=== 测试获取订单列表 ===');
  try {
    const response = await axios.get(`${BASE_URL}/api/orders`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✓ 获取订单成功');
    console.log('  总数:', response.data.data.total);
    console.log('  订单列表:');
    response.data.data.list.forEach(order => {
      console.log(`    - ${order.orderNo}: ${order.customerName} (${order.status})`);
    });
  } catch (error) {
    console.log('✗ 获取订单失败:', error.response?.data?.message || error.message);
  }
}

// 测试获取订单详情
async function testGetOrderDetail() {
  console.log('\n=== 测试获取订单详情 ===');
  try {
    const response = await axios.get(`${BASE_URL}/api/orders/ORD20240101001`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✓ 获取订单详情成功');
    console.log('  订单号:', response.data.data.orderNo);
    console.log('  客户:', response.data.data.customerName);
    console.log('  状态:', response.data.data.status);
    console.log('  板件数:', response.data.data.panels.length);
  } catch (error) {
    console.log('✗ 获取订单详情失败:', error.response?.data?.message || error.message);
  }
}

// 测试更新订单
async function testUpdateOrder() {
  console.log('\n=== 测试更新订单 ===');
  try {
    const response = await axios.put(`${BASE_URL}/api/orders/ORD20240101001`, {
      priority: '紧急',
      remark: '更新后的备注'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✓ 更新订单成功');
    console.log('  订单号:', response.data.data.orderNo);
    console.log('  优先级:', response.data.data.priority);
  } catch (error) {
    console.log('✗ 更新订单失败:', error.response?.data?.message || error.message);
  }
}

// 测试Token刷新
async function testRefreshToken() {
  console.log('\n=== 测试Token刷新 ===');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
      token: authToken
    });
    console.log('✓ Token刷新成功');
    console.log('  新Token:', response.data.data.token.substring(0, 50) + '...');
    authToken = response.data.data.token;
  } catch (error) {
    console.log('✗ Token刷新失败:', error.response?.data?.message || error.message);
  }
}

async function runTests() {
  console.log('开始API测试...\n');

  await testHealth();
  await testLogin();
  await testCreateOrder();
  await testGetOrders();
  await testGetOrderDetail();
  await testUpdateOrder();
  await testRefreshToken();

  console.log('\n所有测试完成!');
}

runTests().catch(console.error);
