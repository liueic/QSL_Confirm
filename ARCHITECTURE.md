# 系统架构 / System Architecture

## 概述

HamQSL MailConfirm 是一个用于业余无线电 QSL 卡片邮寄确认的 Web 应用系统，采用现代化的全栈架构，基于 Next.js 和 Supabase 构建。

## 技术栈

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│  Next.js 14 (App Router) + React + TailwindCSS         │
└─────────────────┬───────────────────────────────────────┘
                  │ API Routes
┌─────────────────▼───────────────────────────────────────┐
│                   Backend API                           │
│  Next.js API Routes + Server Actions                    │
│  - Token Generation & Verification                      │
│  - HMAC Signature Cryptography                         │
└─────────────────┬───────────────────────────────────────┘
                  │ Supabase Client
┌─────────────────▼───────────────────────────────────────┐
│                   Database Layer                        │
│  PostgreSQL (Supabase)                                  │
│  - QSOs, QSL Tokens, Confirmation Logs                 │
│  - Row Level Security (RLS)                            │
└─────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. Token 生成系统

**位置**: `src/lib/token.ts`

核心功能：
- **Token 生成**: 使用 `nanoid` 生成 10 字符的唯一 Token
- **HMAC 签名**: 使用 HMAC-SHA256 生成防伪签名
- **签名验证**: 使用 `timingSafeEqual` 进行常量时间比较

```
Token Format: XXXX-XXXX-XX (10 chars, segmented)
Charset: 0-9, A-Z (excluding I, O for clarity)
Signature: HMAC-SHA256(token|qso_id|timestamp, SECRET)
```

**安全特性**:
- 防暴力破解: 32^10 = ~1.1×10^15 组合
- 防伪造: HMAC 签名绑定 QSO 数据
- 防时序攻击: Timing-safe 比较
- 防重放: 一次性使用标记

### 2. API 架构

#### 2.1 Token 生成 API

```
POST /api/qso/[id]/generate-token
├─ 验证 QSO 存在性
├─ 检查是否已有 Token
├─ 生成 Token + Signature + PIN
├─ 存储到数据库
├─ 记录审计日志
└─ 返回 Token 数据（含 QR payload）

GET /api/qso/[id]/generate-token
└─ 查询已存在的 Token
```

#### 2.2 批量生成 API

```
POST /api/qso/batch/generate-tokens
├─ 接收 QSO IDs 数组
├─ 并行处理每个 QSO
├─ 收集成功/失败结果
└─ 返回汇总数据
```

#### 2.3 确认 API

```
GET /api/confirm?token=xxx&sig=yyy
├─ 查找 Token 记录
├─ 验证签名有效性
├─ 检查过期状态
├─ 记录扫描日志
└─ 返回 QSO 信息

POST /api/confirm
├─ 验证 Token 和签名
├─ 验证 PIN（如果需要）
├─ 检查是否已使用
├─ 更新 Token 状态
├─ 记录确认日志
└─ 触发 QSO 更新
```

### 3. 数据库架构

#### 3.1 核心表

**qsos** - QSO 通联记录
```sql
- id (UUID, PK)
- user_id (UUID, FK → profiles)
- callsign_worked, datetime, band, mode, frequency
- mailed (boolean)
- confirmed (boolean)
- confirmed_at (timestamp)
```

**qsl_tokens** - 确认 Token
```sql
- id (UUID, PK)
- qso_id (UUID, FK → qsos)
- token (text, UNIQUE)
- signature (text)
- pin (text, nullable)
- qr_payload (text)
- issued_at (timestamp)
- expires_at (timestamp)
- used (boolean)
- used_at, used_by, used_ip (tracking)
```

**confirmation_logs** - 审计日志
```sql
- id (UUID, PK)
- qsl_token_id (UUID, FK → qsl_tokens)
- event (enum: generated/scanned/confirmed/revoked)
- meta (JSONB)
- ip_address, user_agent
- created_at (timestamp)
```

#### 3.2 数据流

```
Token 生成流程:
QSO → generate_token() → qsl_tokens → confirmation_logs(generated)

确认流程:
Scan QR → verify_signature() → update qsl_tokens
         ↓
confirmation_logs(scanned/confirmed)
         ↓
Trigger → update qsos.confirmed = true
```

#### 3.3 安全策略

**Row Level Security (RLS)** 策略：

- `qsos`: 用户只能访问自己的 QSO
- `qsl_tokens`: 
  - 用户可查看/管理自己的 Token
  - 公开验证接口（仅通过 Token 字符串）
- `confirmation_logs`: 用户可查看自己 Token 的日志

### 4. 前端架构

#### 4.1 页面结构

```
/                    - 主页（功能介绍）
/confirm             - 公开确认页面
  └─ [Suspense boundary for useSearchParams]
```

#### 4.2 确认页面流程

```
访问 URL with token & sig
       ↓
    [Loading]
       ↓
GET /api/confirm (验证)
       ↓
  ┌─────────────┐
  │ 显示 QSO 信息│
  │ 输入表单     │
  │  - PIN      │
  │  - Callsign │
  │  - Message  │
  └─────────────┘
       ↓
POST /api/confirm (确认)
       ↓
  [Success / Error]
```

#### 4.3 状态处理

- **Loading**: 初始加载/验证中
- **Error**: Token 无效/过期/签名错误
- **Already Used**: Token 已确认
- **Ready**: 等待用户确认
- **Confirming**: 提交确认中
- **Confirmed**: 确认成功

## 安全架构

### 1. 加密层

```
Layer 1: HTTPS (Transport Layer Security)
         ↓
Layer 2: HMAC-SHA256 (Application Layer)
         ↓
Layer 3: Database RLS (Data Access Control)
```

### 2. Token 生命周期

```
生成 → [issued_at] → 激活期 → [expires_at] → 过期
  ↓                      ↓
  ├─ 未使用 (used=false) ├─ 可确认
  └─ 已使用 (used=true)  └─ 不可确认
```

### 3. 签名验证流程

```
收到: Token + Signature
  ↓
从数据库获取: qso_id, issued_at
  ↓
重新计算: HMAC(token|qso_id|issued_at, SECRET)
  ↓
Timing-safe 比较: provided_sig == calculated_sig
  ↓
✅ 通过 / ❌ 拒绝
```

## 部署架构

### 推荐部署方案

```
┌──────────────┐
│   Vercel     │  Frontend + API Routes
│  (Edge)      │  - Global CDN
│              │  - Serverless Functions
└──────┬───────┘
       │
┌──────▼───────┐
│  Supabase    │  Database + Auth + Storage
│  (Cloud)     │  - PostgreSQL
│              │  - Real-time subscriptions
└──────────────┘
```

### 环境变量

**必需**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `QSL_TOKEN_SECRET` (32+ 字符)

**可选**:
- `QSL_TOKEN_EXPIRY_DAYS` (默认: 365)
- `NEXT_PUBLIC_APP_URL`

## 扩展性设计

### 横向扩展

- **无状态 API**: 所有 API 路由都是无状态的
- **数据库连接池**: Supabase 自动管理
- **CDN 缓存**: 静态资源通过 Vercel Edge 分发

### 性能优化

- **数据库索引**: 所有查询字段已建立索引
- **签名缓存**: QR payload 预计算并存储
- **批量操作**: 支持批量 Token 生成

### 监控点

建议监控：
- Token 生成速率
- 签名验证失败率
- 确认延迟时间
- 数据库查询性能
- API 错误率

## 未来扩展方向

### 1. 高级功能
- 二维码图片生成（服务器端）
- PDF 批量导出
- 邮件通知
- LoTW/eQSL 集成

### 2. 安全增强
- 速率限制中间件
- CAPTCHA 集成
- IP 地理位置检测
- 异常行为检测

### 3. 分析功能
- 确认率统计
- 地理分布分析
- 时间趋势分析
- 导出报告

## 性能基准

**预期性能**（单实例）:
- Token 生成: < 50ms
- 签名验证: < 10ms
- 数据库查询: < 100ms
- API 端到端: < 200ms

**并发能力**（Vercel 免费层）:
- 并发请求: ~100 req/s
- 每月调用: 100K 次

## 贡献指南

架构变更应考虑：
1. 向后兼容性
2. 安全影响评估
3. 性能影响
4. 文档更新

关键决策记录在 `docs/decisions/` 目录。
