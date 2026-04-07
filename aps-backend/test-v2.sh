#!/bin/bash

# JN-APS Backend V2 测试脚本

echo "========================================"
echo "JN-APS Backend V2 测试脚本"
echo "========================================"
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

echo "✓ Node.js 版本: $(node --version)"
echo ""

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

echo "✓ npm 版本: $(npm --version)"
echo ""

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "⚠️  依赖未安装,正在安装..."
    npm install
    echo ""
fi

echo "✓ 依赖已安装"
echo ""

# 检查.env文件是否存在
if [ ! -f ".env" ]; then
    echo "❌ .env 文件不存在"
    echo "请创建 .env 文件并配置以下变量:"
    echo "  DB_HOST=localhost"
    echo "  DB_PORT=3306"
    echo "  DB_USER=root"
    echo "  DB_PASSWORD=your_password"
    echo "  DB_NAME=aps_db"
    echo "  PORT_V2=3003"
    echo "  NODE_ENV=development"
    exit 1
fi

echo "✓ .env 文件存在"
echo ""

# 检查数据库连接
echo "正在测试数据库连接..."
node -e "
const { testConnection } = require('./src/database/connection');
testConnection()
  .then(() => {
    console.log('✓ 数据库连接成功');
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ 数据库连接失败:', error.message);
    process.exit(1);
  });
"

if [ $? -ne 0 ]; then
    echo ""
    echo "请确保 MySQL 服务正在运行,并且 .env 文件中的数据库配置正确"
    exit 1
fi

echo ""

# 检查数据库表是否存在
echo "正在检查数据库表..."
TABLES=$(mysql -u root -p$(grep DB_PASSWORD .env | cut -d '=' -f2) -h $(grep DB_HOST .env | cut -d '=' -f2) -P $(grep DB_PORT .env | cut -d '=' -f2) $(grep DB_NAME .env | cut -d '=' -f2) -e "SHOW TABLES;" -s 2>/dev/null | wc -l)

if [ "$TABLES" -lt 11 ]; then
    echo "⚠️  数据库表不完整,正在初始化数据库..."
    npm run init-db-v2
    echo ""
else
    echo "✓ 数据库表已存在 ($TABLES 个表)"
    echo ""
fi

# 检查端口是否被占用
PORT=$(grep PORT_V2 .env | cut -d '=' -f2)
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  端口 $PORT 已被占用"
    echo "请先停止占用该端口的进程,或修改 .env 文件中的 PORT_V2"
    exit 1
fi

echo "✓ 端口 $PORT 可用"
echo ""

# 检查V2文件是否存在
echo "正在检查V2文件..."
FILES_OK=true

if [ ! -f "src/app-v2.js" ]; then
    echo "❌ src/app-v2.js 不存在"
    FILES_OK=false
fi

if [ ! -d "src/models-v2" ]; then
    echo "❌ src/models-v2 目录不存在"
    FILES_OK=false
fi

if [ ! -d "src/services-v2" ]; then
    echo "❌ src/services-v2 目录不存在"
    FILES_OK=false
fi

if [ ! -d "src/routes-v2" ]; then
    echo "❌ src/routes-v2 目录不存在"
    FILES_OK=false
fi

if [ "$FILES_OK" = true ]; then
    echo "✓ 所有V2文件存在"
    echo ""

    # 统计文件数量
    MODEL_COUNT=$(ls -1 src/models-v2/*.js 2>/dev/null | wc -l)
    SERVICE_COUNT=$(ls -1 src/services-v2/*.js 2>/dev/null | wc -l)
    ROUTE_COUNT=$(ls -1 src/routes-v2/*.js 2>/dev/null | wc -l)

    echo "文件统计:"
    echo "  - Sequelize 模型: $MODEL_COUNT 个"
    echo "  - 业务服务: $SERVICE_COUNT 个"
    echo "  - API 路由: $ROUTE_COUNT 个"
    echo ""
else
    exit 1
fi

echo "========================================"
echo "✓ 所有检查通过!"
echo "========================================"
echo ""
echo "可以启动V2服务器了:"
echo "  npm run dev-v2"
echo ""
echo "服务器启动后,访问以下URL:"
echo "  - 健康检查: http://localhost:$PORT/health"
echo "  - API 文档: http://localhost:$PORT/api/v2"
echo ""
