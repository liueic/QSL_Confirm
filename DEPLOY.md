# 🚀 快速部署指南 / Quick Deployment Guide

一个简化的部署步骤指南，让你在 10 分钟内完成 Vercel 部署。

详细部署文档请参考：[docs/VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md)

## 📋 准备工作（5 分钟）

### 1. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) 并登录
2. 点击 "New Project"
3. 创建项目后，前往 **SQL Editor**
4. 复制并执行 `supabase/migrations/20240101000000_initial_schema.sql`
5. 记下以下信息（在 Settings → API）：
   - Project URL: `https://xxx.supabase.co`
   - Anon Key: `eyJhbGc...`
   - Service Role Key: `eyJhbGc...`

### 2. 生成 Token Secret

在终端运行：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

复制输出的 64 位字符串。

### 3. 推送代码到 GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

## 🚀 Vercel 部署（5 分钟）

### 方式 A：一键部署 [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用户名/hamqsl-mailconfirm)

点击按钮后：
1. 授权 Vercel 访问你的 GitHub
2. 配置环境变量（见下方）
3. 点击 Deploy

### 方式 B：手动导入

1. 访问 [vercel.com](https://vercel.com)
2. 点击 **Add New** → **Project**
3. 导入你的 GitHub 仓库
4. 配置环境变量（见下方）
5. 点击 **Deploy**

## 🔑 环境变量配置

在 Vercel 部署配置页面添加：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
QSL_TOKEN_SECRET=你生成的64位密钥
QSL_TOKEN_EXPIRY_DAYS=365
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**注意**：`NEXT_PUBLIC_APP_URL` 部署后会获得，可以先留空稍后更新。

## ✅ 部署后操作

### 1. 更新应用 URL

部署成功后：
1. 复制 Vercel 给你的 URL（如 `https://hamqsl-mailconfirm.vercel.app`）
2. 前往 **Settings** → **Environment Variables**
3. 编辑 `NEXT_PUBLIC_APP_URL`，填入实际 URL
4. 前往 **Deployments**，重新部署最新版本

### 2. 配置 Supabase

在 Supabase Dashboard：
1. **Authentication** → **URL Configuration**
2. 设置 Site URL 为你的 Vercel URL
3. 添加 Redirect URLs: `https://your-app.vercel.app/**`

### 3. 测试部署

访问你的应用 URL，测试：
- ✅ 页面正常加载
- ✅ 可以生成 Token
- ✅ 可以扫描和确认

## 🎯 使用 Vercel CLI（可选）

如果你喜欢命令行：

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel

# 设置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# ... 添加其他变量

# 部署到生产环境
vercel --prod
```

## 🔍 验证部署

检查以下 URL：
- 应用首页: `https://your-app.vercel.app`
- API 健康检查: `https://your-app.vercel.app/api/health`（如果有）
- 确认页面: `https://your-app.vercel.app/confirm`

## 📊 监控

在 Vercel Dashboard 中：
- **Deployments**: 查看部署历史
- **Analytics**: 查看访问统计
- **Logs**: 查看实时日志

## 🆘 遇到问题？

常见问题：

### 构建失败
- 检查 Node.js 版本兼容性
- 查看构建日志中的错误信息

### API 500 错误
- 确认 Supabase 密钥正确
- 检查数据库迁移是否完成
- 查看 Function Logs

### 环境变量未生效
- 确认变量名拼写正确
- 设置后需要重新部署

详细排查方法请参考：[docs/VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md)

## 📚 更多资源

- 📖 [完整部署文档](./docs/VERCEL_DEPLOYMENT.md)
- 📖 [项目 README](./README.md)
- 📖 [使用示例](./docs/USAGE_EXAMPLE.md)
- 🔧 [Vercel 文档](https://vercel.com/docs)
- 🔧 [Next.js 文档](https://nextjs.org/docs)
- 🔧 [Supabase 文档](https://supabase.com/docs)

---

**部署时间**: 大约 10 分钟  
**难度**: ⭐⭐☆☆☆（简单）  
**费用**: 免费（使用免费套餐）

祝你部署顺利！73! 📻
