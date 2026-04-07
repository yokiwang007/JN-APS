#!/bin/bash

echo "=========================================="
echo "APS系统服务状态检查"
echo "=========================================="
echo ""

# 检查后端服务
echo "📊 检查后端服务 (端口3002)..."
if lsof -ti:3002 > /dev/null 2>&1; then
    echo "✅ 后端服务正在运行"
    echo "   健康检查: $(curl -s http://localhost:3002/health | python3 -m json.tool 2>/dev/null || echo '无法获取')"
else
    echo "❌ 后端服务未运行"
fi
echo ""

# 检查前端服务
echo "🌐 检查前端服务 (端口5173)..."
if lsof -ti:5173 > /dev/null 2>&1; then
    echo "✅ 前端服务正在运行"
    echo "   访问地址: http://localhost:5173/"
else
    echo "❌ 前端服务未运行"
fi
echo ""

# 检查数据库连接
echo "💾 检查数据库连接..."
if mysql -h localhost -u root -pjienor0803 -e "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ 数据库连接正常"
    echo "   产线数据: $(mysql -h localhost -u root -pjienor0803 aps_db -e "SELECT COUNT(*) FROM production_lines;" 2>/dev/null | tail -1) 条"
else
    echo "❌ 数据库连接失败"
fi
echo ""

# 测试API
echo "🔌 测试产线API..."
if curl -s http://localhost:3002/api/capacity/production-lines > /dev/null 2>&1; then
    echo "✅ API响应正常"
    echo "   数据条数: $(curl -s http://localhost:3002/api/capacity/production-lines | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data']['total'])" 2>/dev/null || echo '无法解析')"
else
    echo "❌ API无法访问"
fi
echo ""

echo "=========================================="
echo "启动命令参考："
echo "=========================================="
echo ""
echo "📝 启动后端服务："
echo "cd /Users/yoki/IDEProjects/JN-APS/aps-backend"
echo "PORT=3002 DB_HOST=localhost DB_PORT=3306 DB_NAME=aps_db DB_USER=root DB_PASSWORD=jienor0803 NODE_ENV=development node src/app.js"
echo ""
echo "📝 启动前端服务："
echo "cd /Users/yoki/IDEProjects/JN-APS/aps-frontend"
echo "npx vite"
echo ""
echo "=========================================="
