# 数据库设置指南 / Database Setup Guide

本文档说明如何正确初始化和配置Supabase数据库。

## 📋 前置条件

1. 已创建Supabase项目
2. 已获取以下凭证：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 🚀 快速初始化

### 方法 1: 使用数据库检查脚本（推荐）

运行数据库检查脚本，它会自动检测您的数据库状态：

```bash
npm run check-db
```

此脚本会：
- ✅ 检查环境变量配置
- ✅ 测试数据库连接
- ✅ 验证表结构是否存在
- ✅ 显示数据库统计信息
- ✅ 提供详细的初始化说明

### 方法 2: 使用Supabase Dashboard（最简单）

1. 登录到您的Supabase项目控制台
2. 导航到: **SQL Editor**
3. 点击 **New query** 创建新查询
4. 依次复制并执行以下migration文件的内容：
   - `supabase/migrations/20240101000000_initial_schema.sql`
   - `supabase/migrations/20240102000000_single_admin_notes.sql`
5. 点击 **Run** 执行SQL

### 方法 3: 使用Supabase CLI

如果您已经安装了Supabase CLI：

```bash
# 安装Supabase CLI（如果还没有）
npm install -g supabase

# 链接到您的项目
supabase link --project-ref your-project-ref

# 推送migrations
supabase db push
```

## 🔍 验证安装

### 使用API健康检查

访问数据库健康检查端点：

```bash
curl http://localhost:3000/api/health/db
```

或在浏览器中访问：`http://localhost:3000/api/health/db`

健康的数据库应该返回：

```json
{
  "healthy": true,
  "environment": {
    "valid": true,
    "missing": [],
    "warnings": []
  },
  "database": {
    "connected": true,
    "url": "https://your-project.supabase.co"
  },
  "tables": {
    "initialized": true,
    "missingTables": []
  },
  "auth": {
    "configured": true,
    "userCount": 0
  }
}
```

### 使用测试套件

运行集成测试来验证数据库连接：

```bash
npm run test:integration
```

## 📊 数据库结构

初始化后，以下表将被创建：

### 核心表

1. **profiles** - 用户配置文件
   - 存储用户基本信息（呼号、邮箱、QTH等）
   - 与auth.users表关联

2. **qsos** - QSO通联记录
   - 存储所有通联记录
   - 包含邮寄和确认状态

3. **qsl_tokens** - QSL确认Token
   - 存储Token、签名和PIN
   - 用于QSL卡片确认

4. **confirmation_logs** - 审计日志
   - 记录所有Token相关事件
   - 用于安全审计

5. **mail_batches** - 邮寄批次
   - 用于批量管理邮寄操作

### 安全特性

所有表都启用了Row Level Security (RLS)，并配置了适当的策略：

- ✅ 用户只能访问自己的数据
- ✅ 管理员拥有完整权限（通过Service Role Key）
- ✅ 确认页面无需登录即可访问（使用Token验证）

## 🔧 常见问题

### 问题 1: "Database not initialized" 错误

**原因**: Migration文件未被执行

**解决方案**:
1. 运行 `npm run check-db` 检查状态
2. 按照上述方法之一应用migrations
3. 重新运行健康检查

### 问题 2: "Failed to connect to database" 错误

**原因**: 环境变量配置错误或网络问题

**解决方案**:
1. 验证 `.env.local` 文件中的配置：
   ```bash
   # 检查环境变量
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $SUPABASE_SERVICE_ROLE_KEY
   ```
2. 确认Supabase项目状态正常
3. 检查网络连接

### 问题 3: 表存在但无法访问

**原因**: RLS策略配置问题或使用了错误的密钥

**解决方案**:
1. 确保使用正确的密钥：
   - 客户端操作: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - 管理员操作: `SUPABASE_SERVICE_ROLE_KEY`
2. 检查RLS策略是否正确应用

### 问题 4: 测试失败

**原因**: 使用了测试环境变量而不是真实配置

**解决方案**:
1. 创建 `.env.test.local` 文件并配置真实的Supabase凭证
2. 或者使用 `.env.local` 中的配置运行测试

## 📝 初始化管理员账户

数据库初始化后，需要创建管理员账户：

### 1. 配置管理员凭证

在 `.env.local` 中设置：

```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-secure-password
```

### 2. 初始化管理员

通过API初始化：

```bash
curl -X POST http://localhost:3000/api/auth/init-admin
```

或在首次访问登录页面时自动初始化。

### 3. 验证初始化

检查初始化状态：

```bash
curl http://localhost:3000/api/auth/init-admin
```

## 🔐 安全建议

1. **保护Service Role Key**: 
   - ❌ 绝不要在客户端代码中使用
   - ✅ 仅在服务器端API路由中使用

2. **使用强密码**:
   - 管理员密码至少12个字符
   - 包含大小写字母、数字和特殊字符

3. **定期备份**:
   - 在Supabase Dashboard中设置自动备份
   - 定期导出重要数据

4. **监控日志**:
   - 定期检查 `confirmation_logs` 表
   - 留意异常的确认活动

## 📚 相关文档

- [Supabase官方文档](https://supabase.com/docs)
- [项目README](./README.md)
- [部署指南](./DEPLOY.md)
- [测试文档](./TESTING.md)

## 🆘 获取帮助

如果遇到问题：

1. 运行 `npm run check-db` 获取详细诊断信息
2. 检查应用日志输出
3. 访问 `/api/health/db` 端点查看健康状态
4. 查阅本文档的常见问题部分

---

最后更新：2024年
