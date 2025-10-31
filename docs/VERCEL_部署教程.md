# Vercel 部署教程 - 10分钟快速上手 🚀

本教程将指导你在 10 分钟内完成项目部署到 Vercel。

## 视频教程

如果你喜欢视频教程，可以参考 Vercel 官方中文教程：
- [Vercel 中文文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)

---

## 第一步：准备 Supabase 数据库 (3分钟)

### 1.1 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 点击右上角 **"Start your project"** 或 **"Sign in"**
3. 使用 GitHub 账号登录
4. 点击 **"New Project"**
5. 填写项目信息：
   - **Organization**: 选择你的组织
   - **Name**: `hamqsl-mailconfirm` (或你喜欢的名字)
   - **Database Password**: 设置一个强密码（记住它！）
   - **Region**: 选择 **Northeast Asia (Tokyo)** 或 **Southeast Asia (Singapore)** (距离中国最近)
6. 点击 **"Create new project"**
7. 等待项目创建（约1-2分钟）

### 1.2 运行数据库迁移

1. 项目创建完成后，点击左侧菜单的 **"SQL Editor"**
2. 打开本项目的 `supabase/migrations/20240101000000_initial_schema.sql` 文件
3. 复制所有内容
4. 粘贴到 Supabase 的 SQL Editor 中
5. 点击右下角 **"Run"** 按钮
6. 看到 **"Success. No rows returned"** 表示成功

### 1.3 获取 API 密钥

1. 点击左侧菜单的 **⚙️ Settings** (设置)
2. 点击 **API** 选项
3. 复制保存以下信息（稍后会用到）：
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJI...` (公开密钥)
   - **service_role**: `eyJhbGciOiJI...` (私密密钥，点击 "Reveal" 显示)

> ⚠️ **重要**: `service_role` 密钥非常重要，不要分享给任何人！

---

## 第二步：生成 Token Secret (1分钟)

### 2.1 生成密钥

打开终端（Windows 用 PowerShell，Mac/Linux 用 Terminal），运行：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

你会看到类似这样的输出：

```
a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890
```

复制这个 64 位的密钥，稍后会用到。

### 2.2 如果没有 Node.js

访问 [Online UUID Generator](https://www.uuidgenerator.net/) 或任何密钥生成网站生成随机密钥。

---

## 第三步：推送代码到 GitHub (2分钟)

### 3.1 如果你还没有推送代码

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Ready for Vercel deployment"

# 在 GitHub 上创建新仓库，然后关联
git remote add origin https://github.com/你的用户名/hamqsl-mailconfirm.git

# 推送代码
git push -u origin main
```

### 3.2 如果你已经有 GitHub 仓库

```bash
git add .
git commit -m "Add Vercel deployment config"
git push origin main
```

---

## 第四步：部署到 Vercel (4分钟)

### 4.1 导入项目

1. 访问 [vercel.com](https://vercel.com)
2. 点击右上角 **"Sign Up"** 或 **"Login"**
3. 使用 **GitHub** 账号登录
4. 点击 **"Add New..."** → **"Project"**
5. 找到你的 `hamqsl-mailconfirm` 仓库
6. 点击 **"Import"**

### 4.2 配置项目

在导入页面：

1. **Project Name**: 保持默认或修改（如：`hamqsl-mailconfirm`）
2. **Framework Preset**: 自动检测为 **Next.js** ✅
3. **Root Directory**: 保持 `./` ✅
4. **Build Command**: 保持 `npm run build` ✅
5. **Output Directory**: 保持 `.next` ✅

### 4.3 配置环境变量 ⭐

这是最重要的一步！点击 **"Environment Variables"**，添加以下变量：

#### 第一组：Supabase 配置

| 变量名 | 值 | 从哪里获取 |
|--------|-----|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase → Settings → API (anon public) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase → Settings → API (service_role) |

#### 第二组：Token 安全配置

| 变量名 | 值 |
|--------|-----|
| `QSL_TOKEN_SECRET` | 你在第二步生成的 64 位密钥 |
| `QSL_TOKEN_EXPIRY_DAYS` | `365` |

#### 第三组：应用配置

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_APP_URL` | 先留空 | 部署后再填 |

**如何添加变量**：

1. 在 "Key" 输入框输入变量名（如：`NEXT_PUBLIC_SUPABASE_URL`）
2. 在 "Value" 输入框输入对应的值
3. 确保 **Production**、**Preview**、**Development** 都勾选 ✅
4. 点击 **"Add"**
5. 重复以上步骤，添加所有变量

### 4.4 开始部署

1. 检查所有配置正确
2. 点击 **"Deploy"** 按钮
3. 等待构建（约 1-3 分钟）
4. 看到 🎉 **"Congratulations!"** 表示部署成功！

### 4.5 获取你的应用 URL

部署成功后，你会看到：

```
https://hamqsl-mailconfirm.vercel.app
```

或类似的 URL，这就是你的应用地址！

### 4.6 更新 APP_URL 环境变量

1. 复制你的应用 URL
2. 在 Vercel Dashboard 中，点击项目名称
3. 点击 **"Settings"** 标签
4. 点击左侧 **"Environment Variables"**
5. 找到 `NEXT_PUBLIC_APP_URL` 变量
6. 点击右侧的 **"Edit"** 按钮
7. 粘贴你的实际 URL（如：`https://hamqsl-mailconfirm.vercel.app`）
8. 点击 **"Save"**
9. 回到项目主页，点击 **"Deployments"** 标签
10. 找到最新的部署，点击右侧的 **"..."** 菜单
11. 选择 **"Redeploy"** → **"Redeploy"**

---

## 第五步：配置 Supabase CORS (1分钟)

回到 Supabase Dashboard：

1. 点击左侧 **⚙️ Settings**
2. 点击 **Authentication**
3. 找到 **"URL Configuration"** 部分
4. 在 **Site URL** 中输入你的 Vercel URL：
   ```
   https://hamqsl-mailconfirm.vercel.app
   ```
5. 在 **Redirect URLs** 中添加：
   ```
   https://hamqsl-mailconfirm.vercel.app/**
   ```
6. 点击 **"Save"** 保存

---

## 第六步：测试部署 (1分钟)

### 6.1 访问你的应用

在浏览器中打开你的 Vercel URL，应该能看到应用首页。

### 6.2 测试功能

如果应用有提供测试功能，尝试：
- 生成一个测试 Token
- 扫描 QR 码
- 完成确认流程

---

## 🎉 完成！

恭喜你！你的 HamQSL MailConfirm 系统已经成功部署到 Vercel！

### 你现在可以：

- ✅ 通过 URL 访问你的应用
- ✅ 生成和分享 QSL 确认 Token
- ✅ 扫描 QR 码进行确认
- ✅ 查看确认记录和日志

### 下一步建议：

1. **配置自定义域名**（可选）
   - 在 Vercel → Settings → Domains 添加你的域名
   - 配置 DNS 记录
   - 更新 `NEXT_PUBLIC_APP_URL` 环境变量

2. **设置监控和日志**
   - 在 Vercel Dashboard 查看访问统计
   - 监控错误日志
   - 设置告警通知

3. **备份重要信息**
   - Supabase 数据库密码
   - Supabase API 密钥
   - QSL Token Secret
   - Vercel 项目配置

---

## ⚠️ 常见问题

### Q1: 部署后看到 500 错误

**A**: 检查环境变量是否配置正确，特别是：
- `SUPABASE_SERVICE_ROLE_KEY` 
- `QSL_TOKEN_SECRET`

在 Vercel → Settings → Environment Variables 中检查。

### Q2: API 返回 CORS 错误

**A**: 确保在 Supabase 中配置了正确的 URL：
- Supabase → Settings → Authentication → URL Configuration
- 添加你的 Vercel URL

### Q3: 构建失败

**A**: 查看构建日志：
- Vercel → Deployments → 点击失败的部署 → 查看 Build Logs
- 通常是代码错误或依赖问题

### Q4: 如何更新代码？

**A**: 非常简单！只需：

```bash
git add .
git commit -m "Update code"
git push origin main
```

Vercel 会自动检测并重新部署。

### Q5: 如何回滚到之前的版本？

**A**: 
1. Vercel → Deployments
2. 找到之前的稳定版本
3. 点击 **"..."** → **"Promote to Production"**

---

## 📚 更多资源

- [完整部署文档](./VERCEL_DEPLOYMENT.md) - 详细的部署说明
- [项目 README](../README.md) - 项目介绍和 API 文档
- [Vercel 官方文档](https://vercel.com/docs) - Vercel 平台文档
- [Next.js 文档](https://nextjs.org/docs) - Next.js 框架文档
- [Supabase 文档](https://supabase.com/docs) - Supabase 数据库文档

---

## 🆘 需要帮助？

如果遇到问题：

1. 查看 [完整部署文档](./VERCEL_DEPLOYMENT.md) 的故障排除部分
2. 检查 Vercel 和 Supabase 的日志
3. 在 GitHub 仓库提交 Issue
4. 加入 Vercel 和 Supabase 的 Discord 社区

---

**预计总时间**: 约 10-15 分钟  
**难度**: ⭐⭐☆☆☆ (简单)  
**成本**: 💰 免费（使用免费套餐）

祝你部署顺利！73! 📻
