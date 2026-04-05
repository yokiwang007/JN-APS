# 部署指南

本文档介绍如何将 JN-APS 前端项目部署到不同的平台。

## 目录

- [Cloudflare Pages](#cloudflare-pages-推荐)
- [Vercel](#vercel)
- [Netlify](#netlify)
- [Nginx](#nginx)
- [阿里云 OSS + CDN](#阿里云-oss--cdn)

---

## Cloudflare Pages (推荐)

### 优势
- ✅ 免费额度慷慨(每月 500 次构建)
- ✅ 全球 CDN,300+ 边缘节点
- ✅ 自动 HTTPS
- ✅ 国内访问速度不错
- ✅ 支持自定义域名

### 通过 Git 部署

1. **登录 Cloudflare Dashboard**
   - 访问: https://dash.cloudflare.com/
   - 进入 "Workers & Pages"

2. **创建新项目**
   - 点击 "Create a project" → "Pages"
   - 选择 "Connect to Git"
   - 授权并选择仓库: `yokiwang007/JN-APS`

3. **配置构建设置**
   ```
   Build command: cd aps-frontend && npm run build
   Build output directory: aps-frontend/dist
   Root directory: (留空)
   ```

4. **环境变量**(可选)
   - 添加 API 地址等配置

5. **部署完成**
   - 获得 `*.pages.dev` 域名
   - 可配置自定义域名

### 通过 Wrangler CLI 部署

1. **安装 Wrangler**
   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. **构建项目**
   ```bash
   cd aps-frontend
   npm run build
   ```

3. **部署**
   ```bash
   cd dist
   wrangler pages deploy . --project-name=aps-frontend
   ```

---

## Vercel

### 优势
- ✅ 零配置部署
- ✅ 自动 HTTPS
- ✅ 免费 SSL 证书
- ✅ 全球 CDN

### 部署步骤

1. **登录 Vercel**
   - 访问: https://vercel.com/
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New" → "Project"
   - 选择仓库: `yokiwang007/JN-APS`

3. **配置构建**
   ```
   Framework Preset: Vite
   Root Directory: aps-frontend
   Build Command: npm run build
   Output Directory: dist
   ```

4. **部署**
   - 点击 "Deploy"
   - 获得 `*.vercel.app` 域名

---

## Netlify

### 优势
- ✅ 免费 SSL
- ✅ 持续部署
- ✅ 表单功能
- ✅ 无服务器函数

### 部署步骤

1. **登录 Netlify**
   - 访问: https://www.netlify.com/
   - 使用 GitHub 账号登录

2. **添加站点**
   - 点击 "Add new site" → "Import an existing project"
   - 选择仓库: `yokiwang007/JN-APS`

3. **配置构建**
   ```toml
   [build]
     publish = "aps-frontend/dist"
     command = "cd aps-frontend && npm run build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

4. **部署**
   - 点击 "Deploy site"
   - 获得 `*.netlify.app` 域名

---

## Nginx

### 优势
- ✅ 完全控制
- ✅ 高性能
- ✅ 灵活配置
- ✅ 适合自己服务器

### 部署步骤

1. **构建项目**
   ```bash
   cd aps-frontend
   npm run build
   ```

2. **上传到服务器**
   ```bash
   scp -r dist/* user@server:/var/www/aps-frontend/
   ```

3. **配置 Nginx**

   创建配置文件 `/etc/nginx/sites-available/aps-frontend`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       root /var/www/aps-frontend;
       index index.html;

       # 处理 Vue Router 的 history 模式
       location / {
           try_files $uri $uri/ /index.html;
       }

       # 静态资源缓存
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # Gzip 压缩
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

4. **启用配置**
   ```bash
   sudo ln -s /etc/nginx/sites-available/aps-frontend /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **配置 HTTPS**(可选)
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

---

## 阿里云 OSS + CDN

### 优势
- ✅ 国内访问速度快
- ✅ 成本低
- ✅ 高可用
- ✅ 自动 HTTPS

### 部署步骤

1. **构建项目**
   ```bash
   cd aps-frontend
   npm run build
   ```

2. **创建 OSS Bucket**
   - 登录阿里云控制台
   - 创建 Bucket,选择"公共读"
   - 记录 Bucket 域名

3. **上传文件**
   ```bash
   # 使用阿里云 CLI
   aliyun oss cp dist/ oss://your-bucket/ -r --update

   # 或使用 ossutil
   ossutil cp -r dist/ oss://your-bucket/
   ```

4. **配置 CDN**
   - 在 CDN 控制台添加域名
   - 源站类型: OSS
   - 回源协议: HTTPS
   - 缓存配置:
     - 文件名后缀: `.js,.css,.png,.jpg,.jpeg,.gif,.ico,.svg,.woff,.woff2,.ttf,.eot`
     - 过期时间: 31536000 秒(1年)

5. **配置 HTTPS**
   - 免费申请 SSL 证书
   - 开启 HTTPS 加速

6. **配置路由重写**
   - 在 CDN 控制台配置 URL 重写规则
   - 将所有路径重写到 `/index.html`

---

## 本地预览

### 使用 Vite Preview

```bash
cd aps-frontend
npm run build
npm run preview
```

访问: http://localhost:4173/

### 使用 Wrangler

```bash
cd aps-frontend
npm run build
cd dist
npx wrangler pages dev .
```

访问: http://localhost:8788/

---

## 环境变量

### 开发环境

创建 `.env.development`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 生产环境

在部署平台配置环境变量:
```env
VITE_API_BASE_URL=https://api.your-domain.com
```

或在构建时传入:
```bash
VITE_API_BASE_URL=https://api.your-domain.com npm run build
```

---

## 性能优化

### 已实现的优化

- ✅ 代码分割和依赖分离
- ✅ Gzip/Brotli 压缩
- ✅ 静态资源缓存
- ✅ 移除 console 和 debugger
- ✅ Terser 压缩

### 进一步优化建议

1. **图片优化**
   - 使用 WebP 格式
   - 压缩图片大小
   - 实现懒加载

2. **按需引入**
   - ECharts 按需引入图表类型
   - Element Plus 按需引入组件

3. **CDN 加速**
   - 大型库使用 CDN
   - 减小打包体积

4. **预加载**
   - 关键资源预加载
   - 路由预加载

---

## 故障排查

### 路由 404

确保服务器配置了 SPA 路由重写,所有路径都返回 `index.html`。

### 静态资源 404

检查:
- 构建输出目录配置是否正确
- 文件路径是否正确
- Nginx/OSS 权限配置

### API 请求失败

检查:
- 环境变量配置
- CORS 配置
- API 地址是否正确

---

## 监控和分析

### Cloudflare Analytics

- 访问 Cloudflare Dashboard
- 查看 Analytics 页面
- 监控流量和性能

### Google Analytics

在 `index.html` 中添加:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 常见问题

### Q: 如何配置自定义域名?

A: 在各平台的设置页面添加域名并配置 DNS 记录:
- Cloudflare: Pages → Custom domains
- Vercel: Settings → Domains
- Netlify: Domain management
- Nginx: 修改 `server_name` 配置

### Q: 如何实现自动部署?

A: 连接 Git 仓库后,每次 push 到主分支都会自动触发部署。

### Q: 如何回滚到之前的版本?

A: 各平台都提供版本历史和回滚功能:
- Cloudflare: Deployments → 选择版本 → Rollback
- Vercel: Deployments → 选择版本 → Redeploy
- Netlify: Deploys → 选择版本 → Publish deploy

---

## 联系支持

如有问题,请联系开发团队或查看:
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Vercel 文档](https://vercel.com/docs)
- [Netlify 文档](https://docs.netlify.com/)
- [Vite 文档](https://vitejs.dev/guide/)
