---
description: Testing và verify
---
# Testing Rules
Ưu tiên test cho:
1. auth + authorization;
2. auto grading;
3. exam submission;
4. progress calculation;
5. recommendation input/output contract;
6. CRUD có constraint quan trọng.

Sau khi sửa:
- chạy test liên quan trước;
- chạy typecheck/lint nếu repo có;
- chạy build cho UI khi thay routing/component lớn;
- không nói “đã test” nếu chưa thực sự chạy.
