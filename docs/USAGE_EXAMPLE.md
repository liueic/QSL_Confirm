# 使用示例 / Usage Examples

## 完整工作流程示例

本文档展示了 HamQSL MailConfirm 系统的典型使用场景。

## 场景 1: 发卡者生成并邮寄 QSL 卡

### 步骤 1: 创建 QSO 记录

首先，在数据库中创建 QSO 记录：

```javascript
// 使用 Supabase 客户端
const { data: qso, error } = await supabase
  .from('qsos')
  .insert({
    user_id: 'user-uuid',
    callsign_worked: 'N0CALL',
    datetime: '2024-01-15T14:30:00Z',
    band: '20m',
    mode: 'SSB',
    frequency: 14.250,
    rst_sent: '59',
    rst_recv: '59',
    qth: 'California, USA',
    notes: 'Nice contact on 20m'
  })
  .select()
  .single();
```

### 步骤 2: 生成确认 Token

```javascript
// 调用 API 生成 Token
const response = await fetch(`/api/qso/${qso.id}/generate-token`, {
  method: 'POST'
});

const result = await response.json();

// result.data:
// {
//   token: "A7B3-9K2M-4C",
//   signature: "xYz123AbC456",
//   qr_payload: "https://hamqsl.app/confirm?token=A7B3-9K2M-4C&sig=xYz123AbC456",
//   pin: "748293",
//   issued_at: "2024-01-15T15:00:00Z",
//   expires_at: "2025-01-15T15:00:00Z"
// }
```

### 步骤 3: 打印 QSL 卡

发卡者将以下信息印在 QSL 卡上：

```
┌─────────────────────────────────────┐
│  QSL Card                          │
│                                     │
│  From: KE8XXX                      │
│  To: N0CALL                        │
│  Date: 2024-01-15 14:30 UTC       │
│  Band: 20m  Mode: SSB             │
│  Freq: 14.250 MHz                 │
│  RST: 59/59                       │
│                                     │
│  ┌─────────┐  Confirm Code:       │
│  │ [QR码] │  A7B3-9K2M-4C         │
│  │         │  PIN: 748293          │
│  └─────────┘                       │
│                                     │
│  Scan to confirm:                  │
│  hamqsl.app/confirm                │
└─────────────────────────────────────┘
```

### 步骤 4: 邮寄卡片

发卡者通过邮政寄送卡片给 N0CALL。

## 场景 2: 收卡者确认收到

### 方式 A: 扫描二维码

1. 收卡者收到实体 QSL 卡
2. 使用手机扫描卡上的二维码
3. 自动跳转到确认页面（URL 中包含 token 和 signature）
4. 查看 QSO 信息确认无误
5. 填写表单（可选）：
   - 输入 PIN: `748293`
   - 输入呼号: `N0CALL`
   - 输入邮箱: `n0call@example.com` (可选)
   - 留言: `Thanks for the QSO! 73!` (可选)
6. 点击"确认收到"按钮
7. 系统显示确认成功

### 方式 B: 手动输入

1. 访问 `https://hamqsl.app/confirm`
2. 在页面上输入短码: `A7B3-9K2M-4C`
3. 系统自动查找并验证
4. 按照方式 A 的步骤 4-7 完成确认

## 场景 3: 批量生成 Tokens

适用于发卡者需要一次性为多个 QSO 生成确认码的场景。

```javascript
// 获取未生成 Token 的 QSO
const { data: qsos } = await supabase
  .from('qsos')
  .select('id')
  .eq('mailed', false)
  .limit(50);

const qsoIds = qsos.map(q => q.id);

// 批量生成
const response = await fetch('/api/qso/batch/generate-tokens', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ qso_ids: qsoIds })
});

const result = await response.json();

// result.data:
// {
//   total: 50,
//   successful: 50,
//   failed: 0,
//   results: [
//     {
//       qso_id: "uuid-1",
//       callsign_worked: "N0CALL",
//       token: "A7B3-9K2M-4C",
//       signature: "...",
//       qr_payload: "https://...",
//       pin: "748293"
//     },
//     // ... 更多结果
//   ],
//   errors: []
// }

// 导出为 CSV 用于批量打印
const csv = generateCSV(result.data.results);
downloadFile('qsl-tokens.csv', csv);
```

### CSV 格式示例

```csv
callsign_worked,token,pin,qr_payload,datetime,band,mode
N0CALL,A7B3-9K2M-4C,748293,https://hamqsl.app/confirm?token=A7B3-9K2M-4C&sig=...,2024-01-15T14:30:00Z,20m,SSB
K2XYZ,B8C4-1D3N-7E,592847,https://hamqsl.app/confirm?token=B8C4-1D3N-7E&sig=...,2024-01-16T10:15:00Z,40m,CW
W1ABC,C9D5-2E4P-8F,136594,https://hamqsl.app/confirm?token=C9D5-2E4P-8F&sig=...,2024-01-17T18:45:00Z,10m,FT8
```

## 场景 4: 查看确认状态

### 发卡者查看自己的 QSO 确认状态

```javascript
// 查询已确认的 QSO
const { data: confirmedQSOs } = await supabase
  .from('qsos')
  .select(`
    *,
    qsl_tokens (
      token,
      used,
      used_at,
      used_by,
      message
    )
  `)
  .eq('user_id', userId)
  .eq('confirmed', true)
  .order('confirmed_at', { ascending: false });

// 显示结果
confirmedQSOs.forEach(qso => {
  console.log(`
    Callsign: ${qso.callsign_worked}
    Date: ${qso.datetime}
    Confirmed At: ${qso.confirmed_at}
    Confirmed By: ${qso.qsl_tokens[0].used_by}
    Message: ${qso.qsl_tokens[0].message || 'N/A'}
  `);
});
```

### 查看审计日志

```javascript
// 查询特定 Token 的所有事件
const { data: logs } = await supabase
  .from('confirmation_logs')
  .select(`
    *,
    qsl_tokens (token)
  `)
  .eq('qsl_token_id', tokenId)
  .order('created_at', { ascending: true });

// 显示时间线
logs.forEach(log => {
  console.log(`
    [${log.created_at}] ${log.event}
    IP: ${log.ip_address}
    Meta: ${JSON.stringify(log.meta)}
  `);
});

// 输出示例:
// [2024-01-15T15:00:00Z] generated
// IP: 192.168.1.100
// Meta: {"qso_id":"uuid","callsign_worked":"N0CALL"}
//
// [2024-01-20T10:30:00Z] scanned
// IP: 203.0.113.45
// Meta: {"token":"A7B3-9K2M-4C","signature":"...","valid":true}
//
// [2024-01-20T10:31:00Z] confirmed
// IP: 203.0.113.45
// Meta: {"token":"A7B3-9K2M-4C","callsign":"N0CALL","message":"73!"}
```

## 场景 5: 生成二维码图片

### 在前端生成二维码

```javascript
import QRCode from 'qrcode';

// 生成二维码 Data URL
async function generateQRCodeImage(qrPayload) {
  try {
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrDataUrl;
  } catch (err) {
    console.error('QR Code generation failed:', err);
    return null;
  }
}

// 使用
const qrImage = await generateQRCodeImage(result.data.qr_payload);

// 在 React 中显示
<img src={qrImage} alt="QSL Confirmation QR Code" />

// 或生成可下载的 PNG
function downloadQRCode(qrDataUrl, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = qrDataUrl;
  link.click();
}

downloadQRCode(qrImage, `qsl-${token}.png`);
```

## 场景 6: Token 安全管理

### 撤销 Token

```javascript
// 如果卡片寄丢或需要重新生成
async function revokeToken(tokenId) {
  const { error } = await supabase
    .from('qsl_tokens')
    .update({ 
      used: true,
      used_at: new Date().toISOString(),
      used_by: 'SYSTEM_REVOKED'
    })
    .eq('id', tokenId);

  if (!error) {
    // 记录撤销日志
    await supabase
      .from('confirmation_logs')
      .insert({
        qsl_token_id: tokenId,
        event: 'revoked',
        meta: { reason: 'Card lost in mail' }
      });
  }
}
```

### 重新生成 Token

```javascript
// 撤销旧 Token 后，为同一 QSO 生成新 Token
async function regenerateToken(qsoId) {
  // 1. 撤销现有 Token
  const { data: oldToken } = await supabase
    .from('qsl_tokens')
    .select('id')
    .eq('qso_id', qsoId)
    .single();
  
  if (oldToken) {
    await revokeToken(oldToken.id);
  }
  
  // 2. 生成新 Token
  const response = await fetch(`/api/qso/${qsoId}/generate-token`, {
    method: 'POST'
  });
  
  return await response.json();
}
```

## 场景 7: 统计报告

### 确认率统计

```javascript
// 获取确认统计
async function getConfirmationStats(userId) {
  // 总 QSO 数
  const { count: totalQSOs } = await supabase
    .from('qsos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  // 已邮寄数
  const { count: mailedCount } = await supabase
    .from('qsos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('mailed', true);
  
  // 已确认数
  const { count: confirmedCount } = await supabase
    .from('qsos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('confirmed', true);
  
  return {
    total: totalQSOs,
    mailed: mailedCount,
    confirmed: confirmedCount,
    confirmationRate: ((confirmedCount / mailedCount) * 100).toFixed(1) + '%'
  };
}

// 使用
const stats = await getConfirmationStats('user-uuid');
console.log(`
  Total QSOs: ${stats.total}
  Mailed: ${stats.mailed}
  Confirmed: ${stats.confirmed}
  Confirmation Rate: ${stats.confirmationRate}
`);
```

### 按日期统计确认趋势

```sql
-- 最近 30 天的每日确认数
SELECT 
  DATE(used_at) as date,
  COUNT(*) as confirmations
FROM qsl_tokens
WHERE used = true
  AND used_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(used_at)
ORDER BY date DESC;
```

## 最佳实践

### 1. Token 生成时机
- 在实际邮寄前生成 Token
- 避免提前生成大量未使用的 Token

### 2. 打印建议
- 二维码尺寸至少 2x2 cm
- 确保足够的留白（quiet zone）
- 短码使用清晰的等宽字体
- PIN 码单独打印或在卡背面

### 3. 安全建议
- 定期更换 `QSL_TOKEN_SECRET`
- 监控异常确认行为
- 设置合理的 Token 过期时间
- 对高频确认 IP 进行速率限制

### 4. 用户体验
- 提供清晰的扫码说明
- 支持手动输入作为备选方案
- 确认页面简洁明了
- 提供确认状态查询功能
