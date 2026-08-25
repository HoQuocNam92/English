# 13 — Screen → Feature Mapping

## Web flow
`admin_login` → `admin_dashboard` → quản lý user/profile/content/lesson/level/certification/question/test/result/progress/group/report.

## Mobile onboarding
`mobile_register` / `mobile_login` → level → IT field → career goal → target certificate → home.

## Mobile learning
`mobile_home` → `mobile_learning_screen` / `mobile_lesson_list` → lesson detail/vocabulary → progress.

## Mobile practice/test
`mobile_practice_category` → quiz/scenario question → test result → answer review → test history.

## Profile
`mobile_profile` → `mobile_edit_profile` / `mobile_change_password`.

## API coupling rule
Không để screen gọi database trực tiếp. Screen → state/query layer → API/service. Các filter/search/pagination của web phải được phản ánh trong API contract nếu dataset có thể tăng.
