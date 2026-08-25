# 10 — UI Design System — Source of Truth

Nguồn gốc: `design-reference/stitch_techenglish_pro/techenglish_pro/DESIGN.md` và từng `code.html`/`screen.png`.

## Personality
Modern Corporate + Minimal EdTech. Professional, empowering, progress-driven. Nhiều whitespace, border nhẹ, typography rõ; không dùng hiệu ứng phô trương.

## Core palette
- Background/surface: `#f7f9fb`
- White container: `#ffffff`
- On surface: `#191c1e`
- Muted text: `#464555`
- Primary indigo: `#3525cd`
- Primary container: `#4f46e5`
- Secondary blue: `#0058be`
- Tertiary violet: `#5c00ca`
- AI accent violet: `#7C3AED`
- Error: `#ba1a1a`
- Border/outline variants: `#777587`, `#c7c4d8`

## Typography
Inter.
- H1 30/38, 700
- H2 24/32, 700
- H3 20/28, 600
- Body 14/20, 400
- Small 12/18, 400
- Interface 14/20, 600
- Caps 12/16, 700, tracking 0.05em

## Spacing
4px base grid. Common 4/8/16/24/32/48. Desktop gutter 24, side margin 32. Mobile margin/gutter 16.

## Shapes & depth
- Inputs/buttons ~10px radius.
- Cards ~14px.
- Mobile modal ~16px.
- Chips full pill.
- Borders nhẹ, shadow ambient `0 1px 3px rgba(15,23,24,0.06)` khi cần.

## AI treatment
AI recommendation dùng violet border/accent và nền tint `#F5F3FF`; không dùng indigo standard để AI dễ phân biệt.

## Implementation rule
Tạo design tokens tương ứng trong framework (Tailwind/theme/CSS variables/native theme). Không scatter hex value mới khắp codebase nếu token đã tồn tại.
