# 数据库连接与测试文档

本文档详细说明数据库连接、初始化、健康检查和测试相关的功能。

## 🎯 新增功能概览

### 1. 数据库工具库 (`src/lib/db-utils.ts`)

提供一套完整的数据库管理工具函数：

- ✅ **checkDatabaseConnection()** - 检查数据库连接状态
- ✅ **checkDatabaseTables()** - 验证表结构是否完整
- ✅ **getDatabaseStats()** - 获取数据库统计信息
- ✅ **validateEnvironmentConfig()** - 验证环境变量配置
- ✅ **checkAuthConfiguration()** - 检查Auth配置状态

### 2. 数据库初始化脚本 (`scripts/init-database.js`)

交互式命令行工具，用于：

- 检查环境变量配置
- 测试数据库连接
- 验证表结构
- 显示详细的初始化指南
- 提供数据库统计信息

**使用方法**:
```bash
npm run check-db
```

### 3. 健康检查API (`/api/health/db`)

RESTful API端点，返回完整的数据库健康状态：

```bash
GET /api/health/db
```

**响应示例**:
```json
{
  "healthy": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": {
    "valid": true,
    "missing": [],
    "warnings": []
  },
  "database": {
    "connected": true,
    "url": "https://xxx.supabase.co"
  },
  "tables": {
    "initialized": true,
    "missingTables": []
  },
  "auth": {
    "configured": true,
    "userCount": 1
  },
  "stats": {
    "profiles": 1,
    "qsos": 0,
    "qsl_tokens": 0,
    "confirmation_logs": 0,
    "mail_batches": 0
  }
}
```

### 4. 改进的管理员初始化

增强的 `/api/auth/init-admin` 端点：

**新特性**:
- ✅ 详细的日志记录（使用 `[INIT-ADMIN]` 前缀）
- ✅ 数据库表存在性验证
- ✅ 更好的错误处理和回滚机制
- ✅ 性能监控（返回执行时间）
- ✅ 详细的错误信息

**使用示例**:
```bash
# 检查初始化状态
curl http://localhost:3000/api/auth/init-admin

# 初始化管理员
curl -X POST http://localhost:3000/api/auth/init-admin
```

### 5. SMTP邮件配置支持

支持配置外部SMTP服务发送邮件：

**环境变量配置**:
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@example.com
SMTP_FROM_NAME=HamQSL MailConfirm
```

**特性**:
- ✅ 可选配置（未配置时使用Supabase内置邮件服务）
- ✅ 完整的配置验证
- ✅ 安全的密钥存储
- ✅ 邮箱格式验证
- ✅ 支持密码重置邮件

**SMTP工具函数** (`src/lib/smtp.ts`):
- `getSMTPConfig()` - 获取SMTP配置
- `isSMTPConfigured()` - 检查是否已配置
- `validateSMTPConfig()` - 验证配置有效性
- `sendEmailWithSMTP()` - 使用SMTP发送邮件
- `getSMTPStatus()` - 获取SMTP状态

### 6. 完整的测试套件

#### 单元测试

**数据库工具测试** (`src/__tests__/lib/db-utils.test.ts`):
- 环境变量验证测试
- 配置缺失检测测试
- 警告生成测试

**SMTP配置测试** (`src/__tests__/lib/smtp.test.ts`):
- SMTP配置解析测试
- 配置验证测试
- 邮箱格式验证测试
- 状态检查测试

**Supabase客户端测试** (`src/__tests__/lib/supabase.test.ts`):
- 客户端初始化测试
- 配置缺失错误处理测试

#### 集成测试

**数据库连接集成测试** (`src/__tests__/integration/database-connection.integration.test.ts`):
- 真实数据库连接测试
- 表结构验证测试
- 统计信息获取测试
- Auth配置检查测试
- 完整初始化流程测试

**运行测试**:
```bash
# 运行所有测试
npm test

# 运行并监视变化
npm run test:watch

# 运行集成测试
npm run test:integration

# 生成覆盖率报告
npm run test:coverage
```

## 🔧 使用指南

### 初次设置流程

1. **配置环境变量**
   ```bash
   cp .env.example .env.local
   # 编辑 .env.local 并填写真实的Supabase凭证
   ```

2. **检查数据库状态**
   ```bash
   npm run check-db
   ```

3. **应用数据库migrations**
   
   根据步骤2的输出，使用以下方法之一：
   
   - **Supabase Dashboard**: SQL Editor → 执行migration文件
   - **Supabase CLI**: `supabase db push`

4. **验证健康状态**
   ```bash
   npm run dev
   curl http://localhost:3000/api/health/db
   ```

5. **初始化管理员**
   ```bash
   curl -X POST http://localhost:3000/api/auth/init-admin
   ```

### 日常开发流程

**检查数据库健康状态**:
```bash
# 使用脚本
npm run check-db

# 或使用API
curl http://localhost:3000/api/health/db
```

**运行测试**:
```bash
# 开发时持续运行
npm run test:watch

# CI/CD中运行
npm test
```

**查看日志**:
管理员初始化操作会输出详细日志：
```
[INIT-ADMIN] Starting admin initialization process...
[INIT-ADMIN] Admin email configured: admin@example.com
[INIT-ADMIN] Checking database tables...
[INIT-ADMIN] Database tables verified
[INIT-ADMIN] Supabase client created
[INIT-ADMIN] Checking for existing users...
[INIT-ADMIN] No existing users found, proceeding with admin creation...
[INIT-ADMIN] Auth user created successfully: uuid-here
[INIT-ADMIN] Admin profile created successfully in 1234ms
```

## 🔍 故障排查

### 问题：数据库连接失败

**症状**:
```json
{
  "healthy": false,
  "database": {
    "connected": false,
    "error": "Database connection failed: ..."
  }
}
```

**解决方案**:
1. 验证环境变量：
   ```bash
   npm run check-db
   ```
2. 检查Supabase项目状态
3. 验证Service Role Key是否正确

### 问题：表未初始化

**症状**:
```json
{
  "tables": {
    "initialized": false,
    "missingTables": ["profiles", "qsos", ...]
  }
}
```

**解决方案**:
1. 在Supabase Dashboard的SQL Editor中执行migration文件
2. 或使用Supabase CLI: `supabase db push`
3. 重新检查: `curl http://localhost:3000/api/health/db`

### 问题：管理员初始化失败

**症状**:
```json
{
  "error": "Database not initialized",
  "missingTables": [...]
}
```

**解决方案**:
1. 确保数据库表已创建（见上一个问题）
2. 验证ADMIN_EMAIL和ADMIN_PASSWORD已配置
3. 检查日志输出获取详细信息

### 问题：测试失败

**症状**:
```
FAIL src/__tests__/integration/database-connection.integration.test.ts
```

**解决方案**:
1. 确保使用真实的Supabase凭证（不是测试凭证）
2. 集成测试需要真实数据库连接
3. 检查网络连接
4. 查看测试输出中的具体错误信息

## 📊 监控和维护

### 健康检查端点

在生产环境中，定期调用健康检查端点：

```bash
# 每5分钟检查一次
*/5 * * * * curl https://your-domain.com/api/health/db
```

### 数据库统计

使用健康检查API监控数据增长：

```javascript
const response = await fetch('/api/health/db');
const health = await response.json();

if (health.healthy && health.stats) {
  console.log('QSO records:', health.stats.qsos);
  console.log('Tokens generated:', health.stats.qsl_tokens);
  console.log('Confirmations:', health.stats.confirmation_logs);
}
```

### 日志监控

管理员操作日志使用 `[INIT-ADMIN]` 前缀，便于过滤：

```bash
# 查看管理员相关日志
grep "\[INIT-ADMIN\]" /var/log/app.log
```

## 🔐 安全最佳实践

### 环境变量管理

1. **永远不要提交** `.env.local` 到版本控制
2. **使用不同的密钥** 用于开发和生产环境
3. **定期轮换** Service Role Key
4. **限制访问** 健康检查端点（在生产环境中）

### SMTP配置安全

1. **使用应用专用密码** 而不是主密码
2. **启用TLS/SSL** (`SMTP_SECURE=true`)
3. **限制发送速率** 防止滥用
4. **监控邮件日志** 检测异常活动

### 数据库访问控制

1. **遵循最小权限原则**:
   - 客户端操作使用 Anon Key
   - 管理员操作使用 Service Role Key
2. **启用RLS策略** 保护所有表
3. **定期审计** 访问日志

## 📚 API参考

### GET /api/health/db

获取数据库健康状态。

**响应**:
- `200` - 数据库健康
- `503` - 数据库不健康
- `500` - 服务器错误

### POST /api/auth/init-admin

初始化管理员账户。

**响应**:
- `200` - 初始化成功或已存在
- `500` - 初始化失败
- `503` - 数据库未初始化

### GET /api/auth/init-admin

检查管理员初始化状态。

**响应**:
```json
{
  "success": true,
  "needsInit": false,
  "adminConfigured": true,
  "hasUsers": true
}
```

## 🧪 测试覆盖率目标

当前测试覆盖率目标：

- 分支覆盖率: 50%
- 函数覆盖率: 50%
- 行覆盖率: 50%
- 语句覆盖率: 50%

查看详细报告：
```bash
npm run test:coverage
```

报告将生成在 `coverage/` 目录。

## 🚀 CI/CD集成

### GitHub Actions 示例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

---

**维护者**: HamQSL开发团队  
**最后更新**: 2024年
