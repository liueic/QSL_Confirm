# i18n 和管理后台功能完善实施文档
# i18n and Admin Interface Implementation Documentation

## 概述 / Overview

本文档描述了为 HamQSL MailConfirm 系统实现的国际化（i18n）支持和管理后台功能完善。  
This document describes the internationalization (i18n) support and admin interface enhancements implemented for the HamQSL MailConfirm system.

## 实现的功能 / Implemented Features

### 1. 国际化支持 (i18n Support)

#### 安装的包 / Installed Packages
- `next-intl@latest` - Next.js 官方推荐的国际化库

#### 配置文件 / Configuration Files

**`/src/i18n/request.ts`**
- 配置 next-intl 请求处理器
- 从 cookie 读取用户语言偏好
- 默认语言：中文 (zh)

**`/next.config.ts`**
- 集成 next-intl 插件

**翻译文件 / Translation Files:**
- `/messages/zh.json` - 中文翻译
- `/messages/en.json` - 英文翻译

#### 支持的页面 / Supported Pages

所有主要页面已完成国际化：
- ✅ 首页 (Home Page)
- ✅ 管理后台布局 (Admin Layout)
- ✅ 管理仪表盘 (Admin Dashboard)
- ✅ 确认页面 (Confirmation Page)

#### 语言切换器 / Language Switcher

**组件位置：** `/src/components/LanguageSwitcher.tsx`

**集成位置：**
- 首页顶部
- 管理后台导航栏
- 确认页面顶部

**工作原理：**
- 通过 Cookie (`NEXT_LOCALE`) 存储语言偏好
- 页面刷新后保持语言选择
- 平滑的语言切换体验

### 2. 管理后台功能完善 (Admin Interface Enhancements)

#### 新增页面 / New Pages

**QSO 管理：**

1. **添加新 QSO** - `/src/app/admin/qsos/new/page.tsx`
   - 完整的 QSO 录入表单
   - 字段：呼号、日期时间、波段、模式、频率、RST、备注
   - 表单验证
   - 自动转换呼号为大写

2. **编辑 QSO** - `/src/app/admin/qsos/[id]/edit/page.tsx`
   - 加载现有 QSO 数据
   - 编辑所有字段
   - 保存更新

3. **生成确认码** - `/src/app/admin/qsos/[id]/generate-token/page.tsx`
   - 为单个 QSO 生成确认码
   - 可选 PIN 码保护
   - 二维码自动生成和显示
   - 下载二维码功能
   - 打印功能
   - 复制确认链接

#### 新增 API 端点 / New API Endpoints

**QSO 操作：**

1. **创建 QSO** - `/src/app/api/qso/create/route.ts`
   - POST 请求创建新 QSO
   - 身份验证检查
   - 数据验证

2. **获取单个 QSO** - `/src/app/api/qso/[id]/route.ts`
   - GET 请求获取 QSO 详情
   - DELETE 请求删除 QSO
   - 用户权限验证

3. **更新 QSO** - `/src/app/api/qso/[id]/update/route.ts`
   - PUT 请求更新 QSO
   - 字段验证
   - 权限检查

### 3. 界面优化 / UI Improvements

#### 翻译的界面元素 / Translated UI Elements

**管理后台：**
- 导航菜单（仪表盘、QSOs、Tokens、日志、批量操作）
- 统计卡片（总 QSO、已邮寄、已确认、总确认码、已使用确认码）
- 确认率指示器
- 快速操作按钮
- 系统状态显示

**确认页面：**
- 页面标题和说明
- QSO 详情显示
- 表单标签（PIN、呼号、邮箱、留言）
- 按钮文本（确认收到、确认中...）
- 状态消息（已确认、已使用、错误）
- 隐私声明

**首页：**
- 系统介绍
- 功能列表
- 角色说明（发卡者、邮寄、收卡者）
- 行动号召按钮

### 4. 用户体验改进 / UX Improvements

#### 表单功能 / Form Features
- 实时输入验证
- 加载状态指示
- 错误消息显示
- 成功反馈
- 自动字段格式化（呼号大写）

#### 导航改进 / Navigation Improvements
- 面包屑导航
- 返回按钮
- 上下文链接
- 清晰的操作流程

#### 二维码功能 / QR Code Features
- Canvas 渲染
- 可下载为 PNG
- 打印优化布局
- 高对比度显示

## 技术实现细节 / Technical Implementation Details

### i18n 架构 / i18n Architecture

```
┌─────────────────────────────────────┐
│  Cookie: NEXT_LOCALE                │
│  (zh / en)                          │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  /src/i18n/request.ts               │
│  - Read locale from cookie          │
│  - Load messages from JSON          │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  Root Layout (app/layout.tsx)       │
│  - NextIntlClientProvider           │
│  - Pass messages to all components  │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  Components                         │
│  - useTranslations() hook           │
│  - getTranslations() for Server     │
└─────────────────────────────────────┘
```

### 数据流 / Data Flow

```
用户创建 QSO / User Creates QSO:
┌──────────────┐    POST    ┌──────────────┐
│ New QSO Form │──────────→│ /api/qso/    │
│              │            │   create     │
└──────────────┘            └──────┬───────┘
                                   │
                                   ↓
                            ┌──────────────┐
                            │ Supabase DB  │
                            └──────┬───────┘
                                   │
                                   ↓
                            ┌──────────────┐
                            │ Redirect to  │
                            │ QSOs List    │
                            └──────────────┘

生成确认码 / Generate Token:
┌──────────────┐    POST    ┌──────────────┐
│ Generate     │──────────→│ /api/qso/    │
│ Token Page   │            │ [id]/token   │
└──────────────┘            └──────┬───────┘
                                   │
                            ┌──────↓───────┐
                            │ - Create     │
                            │   Token      │
                            │ - Generate   │
                            │   HMAC       │
                            │ - Optional   │
                            │   PIN        │
                            └──────┬───────┘
                                   │
                                   ↓
                            ┌──────────────┐
                            │ QR Code +    │
                            │ Token Data   │
                            └──────────────┘
```

## 使用指南 / Usage Guide

### 切换语言 / Switching Languages

1. 点击页面顶部的语言切换按钮
2. 选择 "中文" 或 "English"
3. 页面将自动刷新并显示所选语言

### 添加新 QSO / Adding a New QSO

1. 进入管理后台
2. 点击 "Add New QSO" 或 "添加新 QSO"
3. 填写表单：
   - 通联呼号（必填）
   - 我的呼号（可选）
   - 日期时间（必填）
   - 波段（必填）
   - 模式（必填）
   - 频率（可选）
   - RST 发送/接收（可选）
   - 备注（可选）
4. 点击 "Create QSO" 保存

### 生成确认码 / Generating Tokens

1. 在 QSO 列表中找到目标 QSO
2. 点击 "Generate" 链接
3. 选择是否使用 PIN 码保护
4. 点击 "Generate Token"
5. 查看生成的：
   - 二维码
   - 确认码
   - PIN 码（如果启用）
   - 确认链接
6. 可以：
   - 下载二维码
   - 打印页面
   - 复制确认链接

### 编辑 QSO / Editing a QSO

1. 在 QSO 列表中点击 "Edit"
2. 修改需要更改的字段
3. 点击 "Save Changes" 保存
4. 或点击 "Cancel" 取消

## 配置 / Configuration

### 环境变量 / Environment Variables

确保以下环境变量已配置：

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

# Admin Account
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-secure-admin-password
```

### 默认语言 / Default Language

默认语言设置在 `/src/i18n/request.ts`：

```typescript
const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh';
```

可以将 `'zh'` 改为 `'en'` 来设置英文为默认语言。

## 文件清单 / File Checklist

### 新增文件 / New Files

```
✅ /src/i18n/request.ts
✅ /messages/zh.json
✅ /messages/en.json
✅ /src/components/LanguageSwitcher.tsx
✅ /src/app/admin/qsos/new/page.tsx
✅ /src/app/admin/qsos/[id]/edit/page.tsx
✅ /src/app/admin/qsos/[id]/generate-token/page.tsx
✅ /src/app/api/qso/create/route.ts
✅ /src/app/api/qso/[id]/route.ts
✅ /src/app/api/qso/[id]/update/route.ts
```

### 修改的文件 / Modified Files

```
✅ /next.config.ts - 添加 next-intl 插件
✅ /src/app/layout.tsx - 集成 NextIntlClientProvider
✅ /src/app/page.tsx - 添加翻译和语言切换器
✅ /src/app/admin/layout.tsx - 添加翻译和语言切换器
✅ /src/app/admin/page.tsx - 完整翻译
✅ /src/app/confirm/page.tsx - 完整翻译和语言切换器
✅ /src/components/AuthGuard.tsx - 修复类型错误
```

## 待完成功能 / Future Enhancements

以下功能可以在未来添加：

1. **更多语言支持** - 添加日语、德语等
2. **日期格式本地化** - 根据语言显示不同的日期格式
3. **数字格式本地化** - 千位分隔符、小数点等
4. **时区支持** - 自动转换时区
5. **批量编辑 QSO** - 一次编辑多个 QSO
6. **导入/导出 ADIF** - 支持 ADIF 格式
7. **统计图表** - 可视化统计数据
8. **搜索和筛选** - 高级搜索功能

## 测试建议 / Testing Recommendations

### 手动测试清单 / Manual Testing Checklist

- [ ] 语言切换功能正常
- [ ] 刷新页面后语言保持不变
- [ ] 所有页面文本正确翻译
- [ ] 表单验证正常工作
- [ ] QSO CRUD 操作成功
- [ ] 二维码正确生成
- [ ] 下载和打印功能正常
- [ ] 移动端响应式布局正常
- [ ] 错误消息正确显示

### 自动化测试建议 / Automated Testing Suggestions

```typescript
// 测试语言切换
test('should switch language', () => {
  // 设置 cookie
  // 验证文本变化
});

// 测试 QSO 创建
test('should create QSO', () => {
  // 填写表单
  // 提交
  // 验证数据库
});

// 测试确认码生成
test('should generate token', () => {
  // 调用 API
  // 验证返回数据
  // 验证二维码
});
```

## 故障排除 / Troubleshooting

### 常见问题 / Common Issues

**Q: 语言切换后没有生效**
A: 检查浏览器 Cookie 是否被正确设置，或尝试清除缓存

**Q: 翻译文本显示为 key**
A: 检查 messages 文件中是否存在对应的翻译 key

**Q: 二维码不显示**
A: 检查 qrcode 包是否正确安装，查看浏览器控制台错误

**Q: API 返回 401 错误**
A: 确认用户已登录且 Supabase 认证正常工作

## 总结 / Summary

本次实现包括：

1. ✅ 完整的 i18n 支持（中文/英文）
2. ✅ 语言切换器组件
3. ✅ QSO 创建页面
4. ✅ QSO 编辑页面
5. ✅ 确认码生成页面
6. ✅ 相关 API 端点
7. ✅ 所有主要页面的翻译
8. ✅ 用户体验优化

系统现在支持完整的双语界面，管理员可以方便地管理 QSO 记录和生成确认码，用户体验得到显著提升。
