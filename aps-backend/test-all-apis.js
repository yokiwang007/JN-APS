#!/usr/bin/env node

/**
 * 完整API测试脚本
 * 测试所有后端API接口
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3002';
let authToken = '';

// 辅助函数: 打印测试结果
function printResult(testName, success, data) {
  if (success) {
    console.log(`✓ ${testName}`);
    if (data) {
      console.log(`  ${JSON.stringify(data).substring(0, 200)}...`);
    }
  } else {
    console.log(`✗ ${testName}`);
  }
}

// 1. 健康检查
async function testHealth() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    printResult('健康检查', true);
  } catch (error) {
    printResult('健康检查', false, error.message);
  }
}

// 2. 登录
async function testLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    authToken = response.data.data.token;
    printResult('用户登录', true, { user: response.data.data.user.username });
  } catch (error) {
    printResult('用户登录', false, error.response?.data?.message);
  }
}

// 3. 批次规划
async function testBatchPlanning() {
  try {
    const response = await axios.post(`${BASE_URL}/api/batches/plan`, {
      strategyId: 'STR002',
      orderPoolScope: 'TODAY'
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    printResult('批次规划', true, { batchNo: response.data.data.batchNo });
    return response.data.data.batchNo;
  } catch (error) {
    printResult('批次规划', false, error.response?.data?.message);
    return null;
  }
}

// 4. 查询批次列表
async function testGetBatches() {
  try {
    const response = await axios.get(`${BASE_URL}/api/batches`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    printResult('查询批次列表', true, { total: response.data.data.total });
  } catch (error) {
    printResult('查询批次列表', false, error.response?.data?.message);
  }
}

// 5. 排程优化
async function testScheduleOptimization(batchNo) {
  try {
    const response = await axios.post(`${BASE_URL}/api/schedules/optimize`, {
      batchNos: [batchNo || 'BCH1234567890'],
      optimizationTarget: 'BALANCE',
      timeWindow: 7
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    printResult('排程优化', true, { schedules: response.data.data.schedules.length });
  } catch (error) {
    printResult('排程优化', false, error.response?.data?.message);
  }
}

// 6. 查询生产进度
async function testGetProgress() {
  try {
    const response = await axios.get(`${BASE_URL}/api/monitor/progress`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    printResult('查询生产进度', true, {
      orders: response.data.data.orderProgress.total,
      batches: response.data.data.batchProgress.total
    });
  } catch (error) {
    printResult('查询生产进度', false, error.response?.data?.message);
  }
}

// 7. 查询异常预警
async function testGetAnomalies() {
  try {
    const response = await axios.get(`${BASE_URL}/api/monitor/anomalies`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    printResult('查询异常预警', true, { total: response.data.data.total });
  } catch (error) {
    printResult('查询异常预警', false, error.response?.data?.message);
  }
}

// 8. 查询策略列表
async function testGetStrategies() {
  try {
    const response = await axios.get(`${BASE_URL}/api/strategies`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    printResult('查询策略列表', true, { total: response.data.data.total });
  } catch (error) {
    printResult('查询策略列表', false, error.response?.data?.message);
  }
}

// 9. 查询产线列表
async function testGetProductionLines() {
  try {
    const response = await axios.get(`${BASE_URL}/api/capacity/production-lines`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    printResult('查询产线列表', true, { total: response.data.data.total });
  } catch (error) {
    printResult('查询产线列表', false, error.response?.data?.message);
  }
}

// 10. 查询工艺路线列表
async function testGetProcessRoutes() {
  try {
    const response = await axios.get(`${BASE_URL}/api/capacity/process-routes`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    printResult('查询工艺路线列表', true, { total: response.data.data.total });
  } catch (error) {
    printResult('查询工艺路线列表', false, error.response?.data?.message);
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('开始完整API测试...\n');

  await testHealth();
  await testLogin();
  const batchNo = await testBatchPlanning();
  await testGetBatches();
  await testScheduleOptimization(batchNo);
  await testGetProgress();
  await testGetAnomalies();
  await testGetStrategies();
  await testGetProductionLines();
  await testGetProcessRoutes();

  console.log('\n所有测试完成!');
}

runAllTests().catch(console.error);
