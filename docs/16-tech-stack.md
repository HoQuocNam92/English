# 16 — Tech Stack

## Stack đã chốt

### Backend
- NestJS
- TypeScript

### Web
- Next.js
- TypeScript

### Mobile
- React Native
- TypeScript

### Architecture
- Clean Architecture

### Database
- PostgreSQL

### ORM
- Prisma ORM

### UI
- Stitch reference trong `design-reference/stitch_techenglish_pro/`

## Quy tắc
PostgreSQL là database chính.
Prisma là persistence adapter của backend NestJS.

Next.js và React Native không được kết nối PostgreSQL trực tiếp.

```text
Next.js ──────────┐
                  ├──> NestJS API ──> Prisma ──> PostgreSQL
React Native ─────┘
```
