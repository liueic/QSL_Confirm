# Vercel 部署指南 / Vercel Deployment Guide

本指南将详细介绍如何将 HamQSL MailConfirm 项目部署到 Vercel 平台。

## 📋 部署前准备

### 1. 准备 Supabase 项目

在部署之前，确保你已经：

1. **创建 Supabase 项目**
   - 访问 [https://supabase.com](https://supabase.com)
   - 点击 "New Project" 创建新项目
   - 记下项目的 URL 和 API Keys

2. **运行数据库迁移**
   - 在 Supabase Dashboard 中打开 SQL Editor
   - 执行 `supabase/migrations/20240101000000_initial_schema.sql` 文件中的所有 SQL 语句
   - 或使用 Supabase CLI: `supabase db push`

3. **获取必要的密钥**
   - **Project URL**: 在 Project Settings → API 中找到
   - **Anon Key**: 在 Project Settings → API 中找到（公开密钥）
   - **Service Role Key**: 在 Project Settings → API 中找到（私密密钥，仅在服务器端使用）

### 2. 生成 Token Secret

QSL Token 需要一个强密钥用于 HMAC 签名。在终端运行：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

保存生成的 64 位十六进制字符串，稍后会用到。

### 3. 准备 GitHub 仓库

确保你的代码已推送到 GitHub 仓库：

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

## 🚀 部署步骤

### 方式一：通过 Vercel Dashboard 部署（推荐）

#### 第一步：导入项目

1. 访问 [https://vercel.com](https://vercel.com) 并登录
2. 点击 **"Add New"** → **"Project"**
3. 选择 **"Import Git Repository"**
4. 授权 Vercel 访问你的 GitHub 账号
5. 选择 `hamqsl-mailconfirm` 仓库（或你的仓库名称）
6. 点击 **"Import"**

#### 第二步：配置项目

在项目配置页面：

1. **Framework Preset**: 自动检测为 Next.js（无需修改）
2. **Root Directory**: 保持为 `./`（根目录）
3. **Build Command**: 保持默认 `npm run build`
4. **Output Directory**: 保持默认 `.next`
5. **Install Command**: 保持默认 `npm install`

#### 第三步：配置环境变量

点击 **"Environment Variables"** 部分，添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase 匿名密钥（公开） |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase Service Role 密钥（保密） |
| `QSL_TOKEN_SECRET` | `a1b2c3d4...` | 前面生成的 64 位密钥 |
| `QSL_TOKEN_EXPIRY_DAYS` | `365` | Token 有效期（天数） |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | 你的应用域名（稍后更新） |

**注意**：
- 所有环境变量都应用于 **Production**、**Preview** 和 **Development** 环境
- `NEXT_PUBLIC_APP_URL` 可以先留空，部署后再更新

#### 第四步：部署

1. 确认所有配置正确
2. 点击 **"Deploy"** 按钮
3. 等待构建完成（通常需要 1-3 分钟）
4. 部署成功后，你会看到：
   - ✅ 部署成功消息
   - 🌐 你的应用 URL（如：`https://hamqsl-mailconfirm.vercel.app`）
   - 📸 预览截图

#### 第五步：更新应用 URL

1. 复制部署成功后的应用 URL
2. 前往 **Project Settings** → **Environment Variables**
3. 找到 `NEXT_PUBLIC_APP_URL` 变量
4. 点击编辑，更新为实际的应用 URL
5. 点击 **"Save"**
6. 触发重新部署：
   - 前往 **Deployments** 标签
   - 点击最新部署右侧的 **"⋯"** 菜单
   - 选择 **"Redeploy"**

### 方式二：通过 Vercel CLI 部署

如果你偏好使用命令行：

#### 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 登录 Vercel

```bash
vercel login
```

#### 首次部署

在项目根目录运行：

```bash
vercel
```

按照提示操作：
1. 选择你的账号/团队
2. 确认项目名称
3. 确认项目路径
4. 选择是否关联到现有项目

#### 配置环境变量

```bash
# 设置生产环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# 输入值后按回车

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add QSL_TOKEN_SECRET production
vercel env add QSL_TOKEN_EXPIRY_DAYS production
vercel env add NEXT_PUBLIC_APP_URL production
```

#### 部署到生产环境

```bash
vercel --prod
```

### 方式三：通过 GitHub 集成自动部署

Vercel 已经自动配置了 GitHub 集成：

1. **自动部署**: 每次推送到 `main` 分支都会触发生产部署
2. **预览部署**: 每次推送到其他分支或 PR 都会创建预览部署
3. **评论通知**: Vercel 会在 PR 中评论预览链接

无需额外配置，只需：

```bash
git push origin main
```

## 🔧 部署后配置

### 1. 验证部署

访问你的应用 URL，检查：

- ✅ 首页正常加载
- ✅ 样式正确显示
- ✅ API 路由可访问（测试 `/api/health` 等）

### 2. 配置自定义域名（可选）

如果你有自己的域名：

1. 前往 Vercel Dashboard → **Settings** → **Domains**
2. 点击 **"Add"**
3. 输入你的域名（如：`qsl.example.com`）
4. 按照指引配置 DNS 记录：
   - **A 记录**: 指向 Vercel 的 IP
   - 或 **CNAME 记录**: 指向 `cname.vercel-dns.com`
5. 等待 DNS 传播（可能需要几分钟到几小时）
6. 更新 `NEXT_PUBLIC_APP_URL` 环境变量为新域名
7. 重新部署

### 3. 配置 Supabase CORS

在 Supabase Dashboard 中：

1. 前往 **Authentication** → **URL Configuration**
2. 添加你的 Vercel 域名到 **Site URL**
3. 添加你的域名到 **Redirect URLs**：
   - `https://your-app.vercel.app/**`
   - `https://your-custom-domain.com/**`（如果有）

### 4. 测试功能

测试关键功能：

1. **Token 生成**: 调用 API 生成测试 Token
2. **QR 码扫描**: 扫描生成的 QR 码
3. **Token 确认**: 完成确认流程
4. **审计日志**: 检查数据库中的日志记录

## 📊 监控和调试

### 查看部署日志

1. 前往 Vercel Dashboard → **Deployments**
2. 点击任意部署
3. 查看 **Build Logs** 和 **Function Logs**

### 实时日志

```bash
vercel logs [deployment-url] --follow
```

### 常见问题排查

#### 构建失败

检查：
- `package.json` 中的依赖版本
- TypeScript 类型错误
- ESLint 错误

查看构建日志获取详细错误信息。

#### 环境变量未生效

确保：
- 变量名拼写正确
- 已应用到正确的环境（Production/Preview/Development）
- 设置变量后重新部署

#### API 路由 500 错误

检查：
- Supabase 连接配置
- `SUPABASE_SERVICE_ROLE_KEY` 是否正确
- 数据库迁移是否完成

查看 Function Logs 获取详细错误堆栈。

#### CORS 错误

确保：
- Supabase 中配置了正确的域名
- API 路由返回正确的 CORS 头
- `NEXT_PUBLIC_APP_URL` 配置正确

## 🔐 安全最佳实践

### 1. 保护敏感信息

- ✅ 永远不要在代码中硬编码密钥
- ✅ 使用 Vercel 环境变量存储所有密钥
- ✅ 定期轮换 `QSL_TOKEN_SECRET`
- ✅ 限制 Service Role Key 的使用范围

### 2. 生产环境配置

- ✅ 启用 HTTPS（Vercel 自动配置）
- ✅ 配置 Supabase Row Level Security (RLS)
- ✅ 启用速率限制（考虑使用 Vercel Edge Config）
- ✅ 监控异常访问模式

### 3. 数据库安全

- ✅ 确保 RLS 策略已启用
- ✅ 定期备份数据库
- ✅ 限制 API 密钥权限
- ✅ 审查审计日志

## 🔄 持续部署

### 自动部署流程

1. 在本地开发和测试
2. 提交代码到 Git
3. 推送到 GitHub
4. Vercel 自动检测并部署
5. 收到部署通知（邮件/Slack）
6. 验证部署成功

### 回滚部署

如果新部署有问题：

1. 前往 **Deployments** 标签
2. 找到上一个稳定版本
3. 点击 **"⋯"** → **"Promote to Production"**
4. 确认回滚

或使用 CLI：

```bash
vercel rollback
```

## 📈 性能优化

### 1. 边缘函数

Vercel 自动将 API 路由部署为边缘函数，提供最低延迟。

### 2. 静态资源优化

- Next.js 自动优化图片（使用 `next/image`）
- 自动代码分割
- 自动预加载关键资源

### 3. 缓存策略

在 `next.config.ts` 中配置：

```typescript
const nextConfig = {
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store, must-revalidate' },
      ],
    },
  ],
};
```

## 💰 成本估算

### Vercel 免费套餐

- ✅ 100 GB 带宽/月
- ✅ 无限部署
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 预览部署

对于中小型项目完全够用！

### Supabase 免费套餐

- ✅ 500 MB 数据库
- ✅ 1 GB 文件存储
- ✅ 50,000 月活用户
- ✅ 50 MB 文件上传

如需更多资源，考虑升级套餐。

## 🆘 获取帮助

### 文档资源

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Supabase 文档](https://supabase.com/docs)

### 社区支持

- Vercel Discord: [https://vercel.com/discord](https://vercel.com/discord)
- Next.js 论坛: [https://github.com/vercel/next.js/discussions](https://github.com/vercel/next.js/discussions)
- Supabase Discord: [https://supabase.com/discord](https://supabase.com/discord)

## ✅ 部署检查清单

在宣布上线前，确保完成：

- [ ] Supabase 项目已创建并配置
- [ ] 数据库迁移已完成
- [ ] 所有环境变量已配置
- [ ] Token Secret 已生成（至少 32 字节）
- [ ] 首次部署成功
- [ ] `NEXT_PUBLIC_APP_URL` 已更新
- [ ] 自定义域名已配置（如果有）
- [ ] Supabase CORS 已配置
- [ ] 核心功能已测试（生成、扫描、确认）
- [ ] API 路由正常工作
- [ ] 审计日志正常记录
- [ ] 错误监控已设置
- [ ] 备份策略已制定
- [ ] 团队成员已知晓部署 URL

---

## 🎉 完成！

恭喜！你的 HamQSL MailConfirm 系统已成功部署到 Vercel。

现在你可以：
- 🔗 分享你的应用 URL
- 📱 生成并分享 QR 码
- 📊 监控使用情况和日志
- 🚀 持续迭代和改进

73! Happy QSLing! 📻
