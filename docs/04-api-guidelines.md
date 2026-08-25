# 04 — API Guidelines

Không ép framework. Nếu repo đã có convention, ưu tiên convention hiện tại.

## Resource groups
`auth`, `users`, `learner-profiles`, `domains`, `levels`, `career-goals`, `certificates`, `vocabularies`, `lessons`, `questions`, `exams`, `attempts`, `progress`, `reports`, `recommendations`.

## List queries
Hỗ trợ khi UI cần: `page`, `limit`, `search`, `sort`, filter theo role/status/domain/level/certificate/category/date.

## Exam submission
Client gửi answer data, server tự chấm. Không nhận `score` từ client như nguồn sự thật.

## Response
Dùng response/error contract nhất quán của repo. Không tạo thêm wrapper nếu repo đã có chuẩn khác.
