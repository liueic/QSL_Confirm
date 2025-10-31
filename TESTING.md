# 测试指南 / Testing Guide

## 测试核心功能

本文档提供了测试 HamQSL MailConfirm 系统核心功能的指南。

## 1. Token 生成与验证测试

### 测试 Token 生成

```bash
# 使用 Node.js 测试 Token 生成逻辑
node -e "
const { generateToken, generateSignature, verifySignature, generatePin } = require('./src/lib/token.ts');

// 设置环境变量
process.env.QSL_TOKEN_SECRET = 'test-secret-at-least-32-characters-long-for-security';

// 生成 Token
const token = generateToken();
console.log('Generated Token:', token);

// 生成签名
const qsoId = 'test-qso-id-123';
const issuedAt = new Date();
const signature = generateSignature(token, qsoId, issuedAt);
console.log('Generated Signature:', signature);

// 验证签名
const isValid = verifySignature(token, signature, qsoId, issuedAt);
console.log('Signature Valid:', isValid);

// 生成 PIN
const pin = generatePin(6);
console.log('Generated PIN:', pin);
"
```

### 测试 HMAC 签名安全性

```javascript
// test-hmac.js
const { generateSignature, verifySignature } = require('./src/lib/token.ts');

process.env.QSL_TOKEN_SECRET = 'your-32-char-secret-here';

const token = 'ABCD-EFGH-IJ';
const qsoId = 'test-qso-123';
const issuedAt = new Date();

// 正确的签名
const validSig = generateSignature(token, qsoId, issuedAt);
console.log('Valid signature:', verifySignature(token, validSig, qsoId, issuedAt)); // true

// 错误的签名
const invalidSig = 'invalid-signature';
console.log('Invalid signature:', verifySignature(token, invalidSig, qsoId, issuedAt)); // false

// 修改 Token
const modifiedToken = 'XXXX-XXXX-XX';
console.log('Modified token:', verifySignature(modifiedToken, validSig, qsoId, issuedAt)); // false

// 修改 QSO ID
const wrongQsoId = 'wrong-qso-id';
console.log('Wrong QSO ID:', verifySignature(token, validSig, wrongQsoId, issuedAt)); // false
```

## 2. API 端点测试

### 生成单个 Token

```bash
# 使用 curl 测试
curl -X POST http://localhost:3000/api/qso/YOUR-QSO-ID/generate-token \
  -H "Content-Type: application/json" \
  | jq
```

### 批量生成 Tokens

```bash
curl -X POST http://localhost:3000/api/qso/batch/generate-tokens \
  -H "Content-Type: application/json" \
  -d '{
    "qso_ids": [
      "qso-id-1",
      "qso-id-2",
      "qso-id-3"
    ]
  }' \
  | jq
```

### 获取 Token 信息

```bash
curl "http://localhost:3000/api/confirm?token=ABCD-EFGH-IJ&sig=YOUR-SIGNATURE" \
  | jq
```

### 确认 Token

```bash
curl -X POST http://localhost:3000/api/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ABCD-EFGH-IJ",
    "signature": "YOUR-SIGNATURE",
    "pin": "123456",
    "callsign": "N0CALL",
    "email": "test@example.com",
    "message": "73!"
  }' \
  | jq
```

## 3. 数据库测试

### 查询生成的 Tokens

```sql
-- 在 Supabase SQL Editor 中执行

-- 查看所有 Tokens
SELECT 
  qt.token,
  qt.signature,
  qt.used,
  qt.used_at,
  q.callsign_worked,
  q.datetime
FROM qsl_tokens qt
JOIN qsos q ON qt.qso_id = q.id
ORDER BY qt.created_at DESC
LIMIT 10;

-- 查看未使用的 Tokens
SELECT * FROM qsl_tokens
WHERE used = false
ORDER BY issued_at DESC;

-- 查看已确认的 Tokens
SELECT * FROM qsl_tokens
WHERE used = true
ORDER BY used_at DESC;
```

### 查询审计日志

```sql
-- 查看最近的确认日志
SELECT 
  cl.event,
  cl.created_at,
  cl.ip_address,
  cl.meta,
  qt.token
FROM confirmation_logs cl
JOIN qsl_tokens qt ON cl.qsl_token_id = qt.id
ORDER BY cl.created_at DESC
LIMIT 20;

-- 统计各类事件
SELECT 
  event,
  COUNT(*) as count
FROM confirmation_logs
GROUP BY event;
```

## 4. 端到端测试流程

### 完整确认流程测试

```bash
#!/bin/bash
# test-e2e.sh

# 1. 创建测试 QSO (需要先在数据库中创建)
QSO_ID="your-test-qso-id"

# 2. 生成 Token
echo "Step 1: Generating token..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/qso/$QSO_ID/generate-token)
TOKEN=$(echo $RESPONSE | jq -r '.data.token')
SIGNATURE=$(echo $RESPONSE | jq -r '.data.signature')
PIN=$(echo $RESPONSE | jq -r '.data.pin')

echo "Token: $TOKEN"
echo "Signature: $SIGNATURE"
echo "PIN: $PIN"

# 3. 验证 Token 信息
echo -e "\nStep 2: Verifying token info..."
curl -s "http://localhost:3000/api/confirm?token=$TOKEN&sig=$SIGNATURE" | jq

# 4. 确认 Token
echo -e "\nStep 3: Confirming token..."
curl -s -X POST http://localhost:3000/api/confirm \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"$TOKEN\",
    \"signature\": \"$SIGNATURE\",
    \"pin\": \"$PIN\",
    \"callsign\": \"N0TEST\",
    \"message\": \"Test confirmation\"
  }" | jq

# 5. 尝试重复确认（应该失败）
echo -e "\nStep 4: Attempting duplicate confirmation (should fail)..."
curl -s -X POST http://localhost:3000/api/confirm \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"$TOKEN\",
    \"signature\": \"$SIGNATURE\",
    \"pin\": \"$PIN\"
  }" | jq
```

## 5. 安全测试

### 测试签名防伪

```bash
# 测试伪造的签名
curl "http://localhost:3000/api/confirm?token=ABCD-EFGH-IJ&sig=fake-signature" | jq

# 应该返回 403 错误和 "Invalid signature" 消息
```

### 测试过期 Token

```sql
-- 在数据库中手动设置 Token 为过期
UPDATE qsl_tokens
SET expires_at = NOW() - INTERVAL '1 day'
WHERE token = 'YOUR-TOKEN';

-- 然后尝试访问该 Token，应该返回 410 错误
```

### 测试 PIN 验证

```bash
# 使用错误的 PIN
curl -X POST http://localhost:3000/api/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR-TOKEN",
    "signature": "YOUR-SIGNATURE",
    "pin": "000000"
  }' | jq

# 应该返回 403 错误和 "Invalid PIN" 消息
```

## 6. 性能测试

### 批量生成性能测试

```bash
# 生成 100 个 Tokens
time curl -X POST http://localhost:3000/api/qso/batch/generate-tokens \
  -H "Content-Type: application/json" \
  -d "{
    \"qso_ids\": $(seq 1 100 | jq -R . | jq -s .)
  }" > /dev/null
```

### 签名验证性能测试

```javascript
// benchmark-signature.js
const { generateSignature, verifySignature } = require('./src/lib/token.ts');

process.env.QSL_TOKEN_SECRET = 'your-32-char-secret-here';

const iterations = 10000;
const token = 'ABCD-EFGH-IJ';
const qsoId = 'test-qso-123';
const issuedAt = new Date();
const signature = generateSignature(token, qsoId, issuedAt);

console.time('Verify ' + iterations + ' signatures');
for (let i = 0; i < iterations; i++) {
  verifySignature(token, signature, qsoId, issuedAt);
}
console.timeEnd('Verify ' + iterations + ' signatures');
```

## 7. 前端测试

### 确认页面测试

1. 访问确认页面（带正确的 token 和 signature）:
   ```
   http://localhost:3000/confirm?token=ABCD-EFGH-IJ&sig=YOUR-SIGNATURE
   ```

2. 测试场景:
   - ✅ 正常确认流程
   - ✅ 已确认的 Token
   - ❌ 无效的 Token
   - ❌ 无效的签名
   - ❌ 过期的 Token
   - ❌ 错误的 PIN

## 8. 自动化测试建议

### 使用 Jest 进行单元测试

```javascript
// __tests__/token.test.ts
import { generateToken, generateSignature, verifySignature } from '@/lib/token';

describe('Token Generation', () => {
  it('should generate valid token format', () => {
    const token = generateToken();
    expect(token).toMatch(/^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{2}$/);
  });

  it('should verify valid signature', () => {
    process.env.QSL_TOKEN_SECRET = 'test-secret-at-least-32-characters-long';
    const token = 'ABCD-EFGH-IJ';
    const qsoId = 'test-qso';
    const issuedAt = new Date();
    const signature = generateSignature(token, qsoId, issuedAt);
    
    expect(verifySignature(token, signature, qsoId, issuedAt)).toBe(true);
  });

  it('should reject invalid signature', () => {
    const token = 'ABCD-EFGH-IJ';
    const qsoId = 'test-qso';
    const issuedAt = new Date();
    
    expect(verifySignature(token, 'invalid-sig', qsoId, issuedAt)).toBe(false);
  });
});
```

### 使用 Playwright 进行 E2E 测试

```javascript
// tests/e2e/confirm.spec.ts
import { test, expect } from '@playwright/test';

test('confirm QSL card', async ({ page }) => {
  // 假设已经有一个有效的 token 和 signature
  const token = 'ABCD-EFGH-IJ';
  const signature = 'valid-signature';
  
  await page.goto(`/confirm?token=${token}&sig=${signature}`);
  
  // 应该显示 QSO 信息
  await expect(page.locator('text=QSL Card Confirmation')).toBeVisible();
  
  // 填写表单
  await page.fill('#callsign', 'N0TEST');
  await page.fill('#message', 'Test confirmation');
  
  // 提交
  await page.click('button[type="submit"]');
  
  // 应该显示成功消息
  await expect(page.locator('text=QSL Card Confirmed!')).toBeVisible();
});
```

## 9. 测试数据清理

```sql
-- 清理测试数据
DELETE FROM confirmation_logs WHERE qsl_token_id IN (
  SELECT id FROM qsl_tokens WHERE token LIKE 'TEST%'
);

DELETE FROM qsl_tokens WHERE token LIKE 'TEST%';

DELETE FROM qsos WHERE callsign_worked = 'N0TEST';
```

## 测试清单

- [ ] Token 生成格式正确
- [ ] HMAC 签名验证工作正常
- [ ] 无效签名被拒绝
- [ ] Token 过期检查工作
- [ ] PIN 验证正确
- [ ] 重复确认被阻止
- [ ] 审计日志正确记录
- [ ] 批量生成功能正常
- [ ] 前端确认页面显示正确
- [ ] 数据库触发器更新 QSO 状态
- [ ] RLS 策略正确限制访问
