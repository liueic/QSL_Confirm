# HamQSL MailConfirm

**实体 QSL 卡邮寄确认系统 / Physical QSL Card Mail Confirmation System**

一个现代化的业余无线电 QSL 卡片邮寄确认系统，使用基于 HMAC 的签名技术确保确认的真实性和安全性。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用户名/hamqsl-mailconfirm)

## 🚀 快速部署

- **[10 分钟快速部署指南](./DEPLOY.md)** - 最快上手方式
- **[详细 Vercel 部署文档](./docs/VERCEL_DEPLOYMENT.md)** - 完整部署说明

## 核心功能

### 🔐 Token 生成与 HMAC 签名
- 为每张 QSL 卡生成唯一的确认 Token（格式：`ABCD-EFGH-IJ`）
- 使用 HMAC-SHA256 生成不可伪造的签名
- 支持可选的 PIN 码保护
- 二维码自动生成（包含 Token + Signature）

### ✅ 确认流程
- 收卡者扫描二维码或输入短码
- 实时验证签名有效性
- 记录确认时间、IP、User Agent
- 支持可选的留言功能

### 📊 审计与日志
- 完整的操作审计日志
- 记录 Token 生成、扫描、确认、撤销事件
- IP 地址和时间戳记录
- 防止重复确认

### 🔒 安全特性
- HMAC-SHA256 签名防伪
- Timing-safe 签名比较防止时序攻击
- Token 过期机制
- 可选 PIN 码二次验证
- RLS (Row Level Security) 数据库安全策略

## 技术栈

- **前端**: Next.js 14 (App Router), React, TailwindCSS
- **后端**: Next.js API Routes, Supabase
- **数据库**: PostgreSQL (Supabase)
- **身份验证**: Supabase Auth
- **加密**: Node.js Crypto (HMAC-SHA256)
- **部署**: Vercel

## 项目结构

```
.
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── qso/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── generate-token/    # 单个 Token 生成
│   │   │   │   └── batch/
│   │   │   │       └── generate-tokens/  # 批量 Token 生成
│   │   │   └── confirm/                 # Token 确认 API
│   │   ├── confirm/                     # 确认页面
│   │   └── page.tsx                     # 主页
│   ├── lib/
│   │   ├── supabase.ts                  # Supabase 客户端
│   │   └── token.ts                     # Token 生成与验证逻辑
│   └── types/
│       └── database.ts                  # TypeScript 类型定义
├── supabase/
│   └── migrations/
│       └── 20240101000000_initial_schema.sql  # 数据库 Schema
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local` 并填写配置：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Token Security
QSL_TOKEN_SECRET=your-secure-random-secret-min-32-chars
QSL_TOKEN_EXPIRY_DAYS=365

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**重要**: `QSL_TOKEN_SECRET` 必须是至少 32 个字符的随机字符串，用于 HMAC 签名。可以使用以下命令生成：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. 设置数据库

在 Supabase 项目中运行迁移文件：

```bash
# 使用 Supabase CLI
supabase db push

# 或者直接在 Supabase SQL Editor 中执行
# supabase/migrations/20240101000000_initial_schema.sql
```

### 4. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## API 文档

### Token 生成

#### 生成单个 Token

```http
POST /api/qso/:id/generate-token
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "token": "ABCD-EFGH-IJ",
    "signature": "base64url-signature",
    "qr_payload": "https://your-domain.com/confirm?token=...&sig=...",
    "pin": "123456",
    "issued_at": "2024-01-01T00:00:00Z",
    "expires_at": "2025-01-01T00:00:00Z"
  }
}
```

#### 批量生成 Tokens

```http
POST /api/qso/batch/generate-tokens
Content-Type: application/json

{
  "qso_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "total": 3,
    "successful": 3,
    "failed": 0,
    "results": [...],
    "errors": []
  }
}
```

### Token 验证与确认

#### 获取 Token 信息

```http
GET /api/confirm?token=ABCD-EFGH-IJ&sig=signature
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "token": "ABCD-EFGH-IJ",
    "used": false,
    "qso": {
      "callsign_worked": "N0CALL",
      "datetime": "2024-01-01T12:00:00Z",
      "band": "20m",
      "mode": "SSB",
      "frequency": 14.250
    },
    "requires_pin": true
  }
}
```

#### 确认 Token

```http
POST /api/confirm
Content-Type: application/json

{
  "token": "ABCD-EFGH-IJ",
  "signature": "base64url-signature",
  "pin": "123456",
  "callsign": "N0CALL",
  "email": "operator@example.com",
  "message": "73!"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "QSL card confirmed successfully",
  "data": {
    "confirmed_at": "2024-01-01T12:00:00Z",
    "token": "ABCD-EFGH-IJ"
  }
}
```

## Token 生成算法

### Token 格式

- 长度: 10 个字符（分为 3 段）
- 格式: `XXXX-XXXX-XX`
- 字符集: `0-9`, `A-Z` (排除 `I`, `O` 以避免混淆)
- 示例: `A7B3-9K2M-4C`

### HMAC 签名

```javascript
// 签名生成
const payload = `${normalizedToken}|${qsoId}|${issuedAt.getTime()}`;
const signature = HMAC-SHA256(payload, SECRET).slice(0, 12).base64url();

// 签名验证
const expectedSignature = generateSignature(token, qsoId, issuedAt);
const isValid = timingSafeEqual(providedSignature, expectedSignature);
```

### 安全特性

1. **防暴力破解**: 使用 32 字符字母表 × 10 位 = 约 1.1 × 10^15 种可能组合
2. **防伪造**: HMAC 签名绑定 Token、QSO ID 和签发时间
3. **防时序攻击**: 使用 `timingSafeEqual` 进行常量时间比较
4. **防重放攻击**: Token 一次性使用标记

## 数据库 Schema

### 主要表结构

#### `qsos` - QSO 记录
- 存储通联记录
- 包含邮寄状态和确认状态
- 关联到用户和 Token

#### `qsl_tokens` - QSL 确认 Token
- 存储 Token、签名、PIN
- 记录使用状态和确认信息
- 一对一关联 QSO

#### `confirmation_logs` - 审计日志
- 记录所有 Token 相关事件
- 包含元数据、IP、User Agent
- 用于安全审计

详细 Schema 请参考 `supabase/migrations/20240101000000_initial_schema.sql`

## 部署

### 📦 Vercel 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/你的用户名/hamqsl-mailconfirm)

点击上方按钮，按照提示配置环境变量即可完成部署！

### 📖 部署文档

- **[快速部署指南 (10分钟)](./DEPLOY.md)** - 适合快速上手
- **[完整部署文档](./docs/VERCEL_DEPLOYMENT.md)** - 详细步骤和最佳实践

### 🔑 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role 密钥 | `eyJhbGc...` |
| `QSL_TOKEN_SECRET` | Token 签名密钥（至少32字节） | 使用下方命令生成 |
| `QSL_TOKEN_EXPIRY_DAYS` | Token 有效期（天数） | `365` |
| `NEXT_PUBLIC_APP_URL` | 应用域名 | `https://your-app.vercel.app` |

**生成 Token Secret**:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 安全建议

### 生产环境

1. **使用强密钥**: `QSL_TOKEN_SECRET` 至少 32 字节随机数据
2. **启用 HTTPS**: 确保所有通信加密
3. **配置 CORS**: 限制 API 访问来源
4. **速率限制**: 使用 Vercel Edge Config 或中间件限制请求频率
5. **日志监控**: 定期检查 `confirmation_logs` 表

### Token 安全

1. **不要在客户端生成**: Token 和签名必须在服务器端生成
2. **Secret 保护**: 永远不要在客户端暴露 `QSL_TOKEN_SECRET`
3. **签名验证**: 始终验证签名后再处理确认请求
4. **过期检查**: 实施 Token 过期机制

## 贡献

欢迎提交 Pull Request 或 Issue！

## License

MIT License

## 致谢

- 感谢业余无线电社区的支持
- 基于 Next.js、Supabase 和现代 Web 技术构建
