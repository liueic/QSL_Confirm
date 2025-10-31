# 🎨 Flat Fall Guys Theme

## 设计理念

本主题采用"糖豆人扁平像素风"设计，特点如下：

### 🌈 视觉特征

| 元素 | 特征 |
|------|------|
| 🎨 色彩 | 高饱和、糖果色（粉、紫、湖蓝、柠檬黄、橙红） |
| 🟦 形状 | 圆润、胖胖的几何形（按钮、输入框、人物） |
| 🧱 材质 | **完全平面化（无渐变/高光/投影）** |
| 🧩 图案 | 点状背景、简洁图标、轻微像素感 |
| 💬 气质 | 活泼、可爱、无攻击性，非常友好 |

## 🎨 配色系统

### ☀️ 浅色主题（Light Mode）

| 角色 | 颜色 | 说明 |
|------|------|------|
| 🎯 **主色（Primary）** | `#B58BFF` | 柔和的薰衣草紫，明快但不刺眼，传达温和科技感 |
| 💡 **强调色（Accent）** | `#7BE0F2` | 清爽薄荷蓝，作为 hover、active 等动态反馈色 |
| 🌸 **辅助色（Secondary）** | `#F9A8D4` | 糖果粉，用于分隔或视觉点缀（如小标签、边线） |
| 📄 **背景色（Background）** | `#FAF9FF` | 轻微偏紫的白，防止纯白刺眼 |
| 🧱 **表面色（Surface / Card）** | `#FFFFFF` | 卡片或输入框背景色 |
| 🖋️ **主文字（Text Primary）** | `#1C1630` | 深紫灰，舒适对比度 |
| ✏️ **次文字（Text Secondary）** | `#6B6780` | 次要信息（placeholder、注释） |
| 🪄 **边框 / 分隔线（Border）** | `#E4E0F2` | 柔和分割线，不强调存在感 |

### 🌙 深色主题（Dark Mode）

| 角色 | 颜色 | 说明 |
|------|------|------|
| 🎯 **主色（Primary）** | `#A68BFF` | 稍降亮度的紫色，仍保留亮点 |
| 💡 **强调色（Accent）** | `#61D4E9` | 薄荷蓝偏暗版本，控制亮度以减少眩光 |
| 🌸 **辅助色（Secondary）** | `#E58DC2` | 柔粉低亮度版 |
| 📄 **背景色（Background）** | `#161320` | 深紫灰，非纯黑，有柔和氛围感 |
| 🧱 **表面色（Surface / Card）** | `#1E1A2A` | 卡片比背景略亮一点，用于层级分隔 |
| 🖋️ **主文字（Text Primary）** | `#F4F1FA` | 温和白，不是纯白 |
| ✏️ **次文字（Text Secondary）** | `#A29BBF` | 柔和灰紫，减轻对比度疲劳 |
| 🪄 **边框 / 分隔线（Border）** | `#2E2940` | 低饱和紫灰，平衡层次感 |

## 💻 CSS 变量使用

### 在 CSS 中使用

```css
.my-element {
  background: var(--color-surface);
  color: var(--color-text);
  border: 4px solid var(--color-primary);
  border-radius: 1.5rem;
}
```

### 在 Tailwind 中使用

```html
<div class="bg-primary text-primary border-primary rounded-3xl">
  Flat Fall Guys Button
</div>
```

## 🎯 设计原则

### ✅ 应该做的（DO）

1. **使用纯色背景** - 使用单一颜色，避免渐变
2. **圆润的边角** - 使用 `rounded-3xl` (1.5rem) 或 `rounded-4xl` (2rem)
3. **明快的颜色** - 使用糖果色系，保持高饱和度
4. **简单的动画** - 使用 scale、rotate、opacity 等简单变换
5. **清晰的层级** - 使用颜色和边框区分层级，而非阴影
6. **大胆的字体** - 使用 `font-black` 或 `font-bold`

### ❌ 不应该做的（DON'T）

1. ❌ **避免使用渐变** - 除非是非常微妙的背景过渡
2. ❌ **不用阴影** - 包括 box-shadow 和 drop-shadow
3. ❌ **不用高光效果** - 不使用 inset shadow 模拟立体感
4. ❌ **避免复杂动画** - 不要使用过于复杂的变换效果
5. ❌ **不用半透明叠加** - 使用实色而非 opacity 混合

## 🧩 组件示例

### 按钮

```html
<!-- Primary Button -->
<button class="bg-candy-pink text-white px-6 py-3 rounded-3xl border-4 border-candy-pink font-bold">
  确认
</button>

<!-- Accent Button -->
<button class="bg-candy-blue text-white px-6 py-3 rounded-3xl border-4 border-candy-blue font-bold">
  扫描
</button>
```

### 卡片

```html
<div class="card-candy border-candy-purple p-6">
  <h3 class="text-xl font-black mb-2">标题</h3>
  <p class="font-semibold">内容文本</p>
</div>
```

### 输入框

```html
<input 
  class="w-full px-6 py-4 bg-white border-4 border-candy-purple rounded-2xl font-bold text-center"
  placeholder="输入内容"
/>
```

## 🎭 动画类

| 类名 | 效果 | 用途 |
|------|------|------|
| `animate-sparkle` | 旋转+缩放 | 装饰元素 |
| `animate-wiggle` | 左右摇摆 | 吸引注意 |
| `animate-bounce-rainbow` | 上下弹跳 | 背景装饰 |
| `animate-candy-pulse` | 透明度脉冲 | 状态指示 |

## 🌟 最佳实践

1. **保持一致性** - 在整个应用中使用相同的圆角半径（推荐 1.5rem）
2. **色彩对比** - 确保文字和背景有足够的对比度
3. **视觉层级** - 使用颜色和边框粗细建立层级，而非阴影
4. **响应式设计** - 在小屏幕上适当调整元素大小和间距
5. **可访问性** - 确保所有交互元素有明确的视觉反馈

## 🔄 从旧主题迁移

如果你有使用旧主题的代码，需要进行以下修改：

1. 移除所有 `shadow-*` 类
2. 将 `bg-gradient-*` 替换为单色背景
3. 移除 `bg-white/80` 等半透明背景，使用实色
4. 确保所有按钮和卡片使用 `rounded-3xl` 或 `rounded-4xl`
5. 更新颜色变量使用新的命名规范

## 📚 参考资源

- **灵感关键词**: "flat candy ui", "fall guys flat design", "kawaii flat interface"
- **字体**: Baloo 2（圆润可爱）, Press Start 2P（像素风格）
- **色彩心理**: 使用温暖、友好的糖果色营造轻松氛围
