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
   - 这样 Cloudflare Pages 会在该目录下运行 `bun install`
   - 确保依赖正确安装到 `aps-frontend/node_modules`

2. **Build command: npm run build**
   - 运行 `aps-frontend/package.json` 中的 build 脚本
   - 执行 `vite build` 命令

3. **Build output directory: dist**
   - 相对于 `aps-frontend` 目录
   - 最终输出路径为 `aps-frontend/dist`

## 常见错误及解决方案

### 错误: vite: not found

**原因**: Cloudflare Pages 在错误的目录安装依赖。

**解决方案**: 确保 `Root directory` 设置为 `aps-frontend`

### 错误: No packages!

**原因**: 在没有 `package.json` 的目录运行依赖安装。

**解决方案**: 确保 `Root directory` 设置为 `aps-frontend`

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
- 构建日志显示 `bun install` 成功
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
