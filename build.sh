#!/bin/bash

# Cloudflare Pages 构建脚本

# 进入前端目录
cd aps-frontend

# 安装依赖
npm install

# 构建项目
npm run build
