---
description: Clean Architecture dependency rules
paths:
  - "apps/**"
  - "packages/**"
---
# Clean Architecture Rules

- Dependency hướng vào Domain.
- Domain là pure TypeScript.
- Application phụ thuộc abstraction.
- Infrastructure implement abstraction.
- Presentation gọi use case, không gọi ORM.
- Không framework import trong domain.
- Không ORM entity làm API contract.
- Không business rule trong controller/page/screen.
- Khi thêm feature, chỉ rõ layer của từng file.
- Nếu implementation phá boundary để “nhanh hơn”, dừng và sửa thiết kế.
