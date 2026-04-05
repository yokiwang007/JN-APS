# Cloudflare Pages 部署配置

## 正确的构建配置

在 Cloudflare Dashboard 中配置时,请使用以下设置:

### 基本配置

```
Project name: aps-frontend
Production branch: main
```

### 构建设置

```
Framework preset: None
Build command: npm run build
Build output directory: dist
Root directory: aps-frontend
```

### 环境变量 (可选)

```
NODE_VERSION: 18
```

## 为什么需要这些配置?

1. **Root directory: aps-frontend**
   - 指定构建的工作目录为 `aps-frontend` 文件夹
   - 这样 Cloudflare Pages 会在该目录下运行依赖安装
   - 确保依赖正确安装到 `aps-frontend/node_modules`

2. **Build command: npm run build**
   - 运行 `aps-frontend/package.json` 中的 build 脚本
   - 执行 `vite build` 命令

3. **Build output directory: dist**
   - 相对于 `aps-frontend` 目录
   - 最终输出路径为 `aps-frontend/dist`

## 优化说明

### 已添加的优化

1. **.npmrc 配置文件**
   - 使用淘宝镜像加速(国内访问更快)
   - 增加超时时间
   - 优化安装速度

2. **build.sh 构建脚本**
   - 自动重试机制(最多3次)
   - 优先使用 npm,失败时回退到 bun
   - 清理缓存避免冲突

3. **依赖优化**
   - 精简依赖列表
   - 使用更稳定的版本

## 常见错误及解决方案

### 错误: vite: not found

**原因**: Cloudflare Pages 在错误的目录安装依赖。

**解决方案**: 确保 `Root directory` 设置为 `aps-frontend`

### 错误: No packages!

**原因**: 在没有 `package.json` 的目录运行依赖安装。

**解决方案**: 确保 `Root directory` 设置为 `aps-frontend`

### 错误: 构建超时或中断

**原因**:
- 网络问题导致依赖下载失败
- Bun 安装器不稳定
- 构建超时(默认15分钟)

**解决方案**:
1. 使用 `.npmrc` 中的淘宝镜像
2. Cloudflare 会自动重试失败的构建
3. 如果仍然失败,可以:
   - 使用其他部署平台(Vercel、Netlify)
   - 本地构建后手动上传 dist 目录

## 配置步骤

1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages
3. 点击 "Create a project" → "Pages"
4. 选择 "Connect to Git"
5. 选择仓库: `yokiwang007/JN-APS`
6. 在构建设置中:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `aps-frontend` ⚠️ 重要!
7. 点击 "Save and Deploy"

## 验证部署

部署成功后,你会看到:
- 构建日志显示依赖安装成功
- 构建日志显示 `vite build` 成功
- 获得一个 `*.pages.dev` 域名
- 可以访问应用

## 本地测试

在部署前,可以在本地测试构建:

```bash
cd aps-frontend
npm install
npm run build
npm run preview
```

访问 http://localhost:4173/ 查看构建结果。

## 备选部署方案

如果 Cloudflare Pages 持续失败,可以考虑:

### 1. Vercel (推荐)
- 更稳定的构建环境
- 自动检测框架配置
- 访问: https://vercel.com/

### 2. Netlify
- 免费额度大
- 支持持续部署
- 访问: https://www.netlify.com/

### 3. 手动部署
```bash
# 本地构建
cd aps-frontend
npm install
npm run build

# 使用 Wrangler 上传
cd dist
wrangler pages deploy . --project-name=aps-frontend
```

### 4. Nginx 服务器
- 完全控制
- 适合自己的服务器
- 查看 `DEPLOYMENT.md` 了解详细配置
