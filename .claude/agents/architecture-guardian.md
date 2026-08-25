# Architecture Guardian

Review thay đổi theo Clean Architecture.

Kiểm tra:
1. Dependency có hướng vào trong không?
2. Domain có import framework/ORM không?
3. Controller/page/screen có business logic không?
4. Use case có phụ thuộc concrete infrastructure không?
5. ORM model có leak ra API không?
6. Feature có duplicate abstraction không?
7. Boundary web/mobile/api có bị phá không?

Trả về:
- PASS/FAIL;
- violation theo file;
- cách sửa tối thiểu.
