#!/bin/bash

echo "========================================"
echo "JN-APS 系统状态检查"
echo "========================================"
echo ""

# 检查前端
echo "📱 前端状态:"
if curl -s http://localhost:5174/ > /dev/null; then
    echo "  ✅ 前端运行正常"
    echo "  🌐 访问地址: http://localhost:5174/"
else
    echo "  ❌ 前端未运行"
fi
echo ""

# 检查后端
echo "🔧 后端状态:"
HEALTH_RESPONSE=$(curl -s http://localhost:3003/health)
if [ $? -eq 0 ]; then
    echo "  ✅ 后端运行正常"
    echo "  🌐 API地址: http://localhost:3003/"
    echo "  📚 API文档: http://localhost:3003/api/v2"
    echo "  💚 健康检查: $HEALTH_RESPONSE"
else
    echo "  ❌ 后端未运行"
fi
echo ""

# 检查数据库
echo "💾 数据库状态:"
cd aps-backend
if mysql -u root -pjienor0803 -h localhost -P 3306 -e "USE aps_db; SHOW TABLES;" > /dev/null 2>&1; then
    TABLE_COUNT=$(mysql -u root -pjienor0803 -h localhost -P 3306 aps_db -e "SHOW TABLES;" -s | wc -l)
    echo "  ✅ 数据库连接正常"
    echo "  📊 表数量: $TABLE_COUNT 个"
else
    echo "  ❌ 数据库连接失败"
fi
cd ..
echo ""

# 模式切换说明
echo "🔄 模式切换说明:"
echo "  当前默认模式: 模拟数据模式"
echo "  切换方式: 访问 http://localhost:5174/ 点击顶部按钮"
echo ""

# 快速命令
echo "⚡ 快速命令:"
echo "  启动前端: cd aps-frontend && npm run dev"
echo "  启动后端: cd aps-backend && npm run dev-v2"
echo "  初始化数据库: cd aps-backend && npm run init-db-v2"
echo ""

echo "========================================"
echo "✅ 系统检查完成"
echo "========================================"
