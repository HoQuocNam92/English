---
description: NestJS API rules
paths:
  - "apps/api/**"
---
# NestJS Rules

- Dùng NestJS như delivery/composition framework, không làm domain framework-coupled.
- Controller mỏng.
- HTTP DTO chỉ ở presentation boundary.
- Use case ở application.
- Repository port ở application/domain theo dependency need.
- Concrete repository ở infrastructure.
- Bind provider token trong Nest module.
- Guard không thay thế authorization business rule trong use case.
- Score exam chỉ tính server-side.
- Multi-write critical flow phải xem xét transaction.
- Validate input.
- Không trả raw ORM model.
- Test use case không boot Nest app nếu không cần.
