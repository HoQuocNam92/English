---
description: General backend business rules
paths:
  - "apps/api/**"
---
# Backend Rules

Backend cố định là NestJS và phải tuân theo:
- `.claude/rules/clean-architecture.md`
- `.claude/rules/nestjs.md`
- `.claude/rules/security.md`
- `.claude/rules/database.md`

Controller chỉ điều phối HTTP.
Business logic nằm trong Domain/Application.
Không gọi ORM trực tiếp từ controller.
