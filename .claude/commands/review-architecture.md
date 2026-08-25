# Review Architecture

Review code thay đổi gần nhất theo `docs/17-clean-architecture.md`.

Hãy tìm:
- framework leak vào domain;
- ORM leak;
- controller/page/screen quá dày;
- application phụ thuộc infrastructure;
- duplicate repository/service;
- direct DB access từ Next.js;
- raw HTTP trong React Native screen.

Không refactor ngoài phạm vi nếu chưa cần.
