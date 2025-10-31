# 快速开始指南 / Quick Start Guide

本指南将帮助您在 5 分钟内设置并运行 HamQSL MailConfirm 系统。

## 前置要求

- Node.js 18+ 
- npm 或 yarn
- Supabase 账号 (免费)

## 第 1 步：克隆并安装

```bash
# 克隆项目（如果还没有）
git clone <your-repo-url>
cd hamqsl-mailconfirm

# 安装依赖
npm install
```

## 第 2 步：设置 Supabase

### 2.1 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 等待数据库初始化完成

### 2.2 获取 API 密钥

在 Supabase 项目仪表盘：
- 前往 **Settings > API**
- 复制 `Project URL`
- 复制 `anon public` 密钥
- 复制 `service_role` 密钥（注意：这是敏感密钥）

### 2.3 运行数据库迁移

在 Supabase 仪表盘：
- 前往 **SQL Editor**
- 创建新查询
- 复制粘贴 `supabase/migrations/20240101000000_initial_schema.sql` 的内容
- 点击 **Run** 执行

## 第 3 步：配置环境变量

```bash
# 复制示例配置
cp .env.example .env.local

# 编辑 .env.local
nano .env.local
```

填写以下配置：

```env
# 从 Supabase 获取
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 生成安全密钥（运行下面的命令）
QSL_TOKEN_SECRET=<运行命令生成>
QSL_TOKEN_EXPIRY_DAYS=365

# 开发环境
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 生成 Token 密钥

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

将输出复制到 `QSL_TOKEN_SECRET`。

## 第 4 步：启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 第 5 步：创建测试数据

### 5.1 创建用户 Profile

在 Supabase SQL Editor 执行：

```sql
-- 首先需要在 Supabase Auth 中创建一个测试用户
-- 然后使用该用户的 UUID

INSERT INTO profiles (id, callsign, email, name, qth)
VALUES (
  'your-user-uuid-from-auth',
  'KE8XXX',
  'test@example.com',
  'Test Operator',
  'California, USA'
);
```

### 5.2 创建测试 QSO

```sql
INSERT INTO qsos (
  user_id,
  callsign_worked,
  datetime,
  band,
  mode,
  frequency,
  rst_sent,
  rst_recv,
  qth,
  notes
) VALUES (
  'your-user-uuid-from-auth',
  'N0CALL',
  '2024-01-15 14:30:00+00',
  '20m',
  'SSB',
  14.250,
  '59',
  '59',
  'New York, USA',
  'Great QSO on 20m'
);
```

### 5.3 生成 Token

使用 curl 或浏览器：

```bash
# 获取刚才创建的 QSO ID
curl "http://localhost:3000/api/qso/YOUR-QSO-ID/generate-token" \
  -X POST \
  | jq
```

响应示例：

```json
{
  "success": true,
  "data": {
    "token": "A7B3-9K2M-4C",
    "signature": "xYz123AbC456",
    "qr_payload": "http://localhost:3000/confirm?token=A7B3-9K2M-4C&sig=xYz123AbC456",
    "pin": "748293",
    "issued_at": "2024-01-15T15:00:00Z",
    "expires_at": "2025-01-15T15:00:00Z"
  }
}
```

### 5.4 测试确认流程

1. 访问生成的 `qr_payload` URL
2. 查看 QSO 信息
3. 填写表单（输入 PIN: `748293`）
4. 点击确认

## 验证安装

### 检查 Token 生成

```bash
curl -X POST http://localhost:3000/api/qso/YOUR-QSO-ID/generate-token | jq
```

应该返回成功响应。

### 检查 Token 验证

```bash
curl "http://localhost:3000/api/confirm?token=YOUR-TOKEN&sig=YOUR-SIGNATURE" | jq
```

应该返回 QSO 信息。

### 检查确认功能

```bash
curl -X POST http://localhost:3000/api/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR-TOKEN",
    "signature": "YOUR-SIGNATURE",
    "pin": "YOUR-PIN",
    "callsign": "N0CALL",
    "message": "Test confirmation"
  }' | jq
```

应该返回确认成功。

## 常见问题

### Q: 构建失败怎么办？

```bash
# 清理缓存并重新安装
rm -rf .next node_modules
npm install
npm run build
```

### Q: 数据库连接失败？

检查：
1. Supabase 项目是否正在运行
2. URL 和密钥是否正确
3. 是否已运行数据库迁移

### Q: Token 验证失败？

确保：
1. `QSL_TOKEN_SECRET` 已设置
2. Secret 长度至少 32 字符
3. 开发和生产使用相同的 Secret

### Q: 如何重置测试数据？

```sql
-- 在 Supabase SQL Editor 执行
DELETE FROM confirmation_logs;
DELETE FROM qsl_tokens;
DELETE FROM qsos WHERE callsign_worked = 'N0CALL';
```

## 下一步

- 📖 阅读 [README.md](../README.md) 了解完整功能
- 🧪 查看 [TESTING.md](../TESTING.md) 了解测试方法
- 💡 查看 [USAGE_EXAMPLE.md](./USAGE_EXAMPLE.md) 了解使用示例
- 🚀 部署到 [Vercel](https://vercel.com)

## 获取帮助

如果遇到问题：
1. 查看 [GitHub Issues](https://github.com/your-repo/issues)
2. 检查 Supabase 日志
3. 查看浏览器控制台错误
4. 检查服务器日志 (`npm run dev` 输出)

祝您使用愉快！73!
