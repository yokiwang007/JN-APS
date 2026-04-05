#!/bin/bash

# Cloudflare Pages 构建脚本
# 增强版: 处理依赖安装失败的情况

set -e  # 遇到错误立即退出

echo "🚀 开始构建..."

# 清理可能的缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.cache
rm -rf .vite

# 设置超时和重试
MAX_RETRIES=3
RETRY_COUNT=0

# 安装依赖函数
install_deps() {
    echo "📦 安装依赖 (尝试 $((RETRY_COUNT + 1))/$MAX_RETRIES)..."

    # 优先使用 npm,如果失败再尝试 bun
    if command -v npm &> /dev/null; then
        echo "使用 npm 安装..."
        npm install --legacy-peer-deps --no-audit --no-fund || {
            echo "npm 安装失败,尝试使用 bun..."
            bun install
        }
    elif command -v bun &> /dev/null; then
        echo "使用 bun 安装..."
        bun install
    else
        echo "❌ 错误: 找不到 npm 或 bun"
        exit 1
    fi
}

# 重试安装依赖
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if install_deps; then
        echo "✅ 依赖安装成功"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "⚠️ 依赖安装失败,5秒后重试..."
            sleep 5
        else
            echo "❌ 依赖安装失败,已达到最大重试次数"
            exit 1
        fi
    fi
done

# 构建项目
echo "🔨 开始构建..."
npm run build

echo "✅ 构建完成!"
