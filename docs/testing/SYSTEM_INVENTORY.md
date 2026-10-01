# Inventory đối chiếu phạm vi

Chụp từ mã nguồn ngày 2026-09-30. Đường dẫn API chưa bao gồm global prefix. Prefix và guard cấp class cần đọc controller; không suy ra endpoint public chỉ từ thiếu decorator ở method.

## API

| Controller | Method | Route |
|---|---|---|
| `auth.controller.ts` | GET | `/auth/google` |
| `auth.controller.ts` | GET | `/auth/google/callback` |
| `auth.controller.ts` | POST | `/auth/login` |
| `auth.controller.ts` | POST | `/auth/register` |
| `auth.controller.ts` | POST | `/auth/forgot-password` |
| `auth.controller.ts` | POST | `/auth/reset-password` |
| `auth.controller.ts` | POST | `/auth/refresh` |
| `auth.controller.ts` | POST | `/auth/logout` |
| `auth.controller.ts` | GET | `/auth/me` |
| `auth.controller.ts` | POST | `/auth/change-password` |
| `auth.controller.ts` | POST | `/auth/google/mobile` |
| `exam.controller.ts` | GET | `/exams` |
| `exam.controller.ts` | GET | `/exams/attempts/my` |
| `exam.controller.ts` | GET | `/exams/:id` |
| `exam.controller.ts` | POST | `/exams` |
| `exam.controller.ts` | PATCH | `/exams/:id` |
| `exam.controller.ts` | DELETE | `/exams/:id` |
| `exam.controller.ts` | POST | `/exams/:id/attempts` |
| `exam.controller.ts` | POST | `/exams/attempts/:attemptId/submit` |
| `exam.controller.ts` | GET | `/exams/attempts/:id` |
| `learner-group.controller.ts` | GET | `/learner-groups` |
| `learner-group.controller.ts` | POST | `/learner-groups` |
| `learner-group.controller.ts` | PATCH | `/learner-groups/:id` |
| `learner-group.controller.ts` | DELETE | `/learner-groups/:id` |
| `learner-group.controller.ts` | POST | `/learner-groups/:id/members` |
| `learner-group.controller.ts` | DELETE | `/learner-groups/:id/members/:learnerId` |
| `learner-profile.controller.ts` | GET | `/learner-profiles` |
| `learner-profile.controller.ts` | GET | `/learner-profiles/me` |
| `learner-profile.controller.ts` | GET | `/learner-profiles/me/journey` |
| `learner-profile.controller.ts` | GET | `/learner-profiles/me/placement-exam` |
| `learner-profile.controller.ts` | PUT | `/learner-profiles/me` |
| `learner-profile.controller.ts` | PUT | `/learner-profiles/me/goals` |
| `learner-profile.controller.ts` | PUT | `/learner-profiles/:userId/goals` |
| `learner-profile.controller.ts` | PUT | `/learner-profiles/me/domains` |
| `learner-profile.controller.ts` | POST | `/learner-profiles/me/complete-onboarding` |
| `learner-profile.controller.ts` | GET | `/learner-profiles/:userId` |
| `lesson.controller.ts` | GET | `/lessons` |
| `lesson.controller.ts` | GET | `/lessons/:id` |
| `lesson.controller.ts` | POST | `/lessons` |
| `lesson.controller.ts` | PATCH | `/lessons/:id` |
| `lesson.controller.ts` | DELETE | `/lessons/:id` |
| `notification.controller.ts` | POST | `/notifications/subscriptions` |
| `notification.controller.ts` | DELETE | `/notifications/subscriptions` |
| `placement-test.controller.ts` | GET | `/placement-test` |
| `placement-test.controller.ts` | POST | `/placement-test/submit` |
| `progress.controller.ts` | GET | `/progress/me` |
| `progress.controller.ts` | POST | `/progress/me` |
| `progress.controller.ts` | GET | `/progress/learners/:id` |
| `question.controller.ts` | GET | `/questions` |
| `question.controller.ts` | GET | `/questions/:id` |
| `question.controller.ts` | POST | `/questions/bulk` |
| `question.controller.ts` | POST | `/questions` |
| `question.controller.ts` | PATCH | `/questions/:id` |
| `question.controller.ts` | DELETE | `/questions/:id` |
| `recommendation.controller.ts` | GET | `/recommendations/me` |
| `role.controller.ts` | GET | `/roles` |
| `role.controller.ts` | GET | `/roles/permissions` |
| `role.controller.ts` | POST | `/roles/permissions` |
| `role.controller.ts` | PATCH | `/roles/permissions/:permissionId` |
| `role.controller.ts` | DELETE | `/roles/permissions/:permissionId` |
| `role.controller.ts` | GET | `/roles/:id` |
| `role.controller.ts` | GET | `/roles/:id/users` |
| `role.controller.ts` | POST | `/roles` |
| `role.controller.ts` | PATCH | `/roles/:id` |
| `role.controller.ts` | DELETE | `/roles/:id` |
| `role.controller.ts` | POST | `/roles/:id/permissions` |
| `role.controller.ts` | PATCH | `/roles/:id/permissions` |
| `role.controller.ts` | DELETE | `/roles/:id/permissions/:permId` |
| `role.controller.ts` | POST | `/roles/:id/users` |
| `role.controller.ts` | DELETE | `/roles/:id/users/:userId` |
| `taxonomy.controller.ts` | GET | `/career-goals` |
| `taxonomy.controller.ts` | POST | `/career-goals` |
| `taxonomy.controller.ts` | PATCH | `/career-goals/:id` |
| `taxonomy.controller.ts` | GET | `/levels` |
| `taxonomy.controller.ts` | GET | `/levels/:id` |
| `taxonomy.controller.ts` | POST | `/levels` |
| `taxonomy.controller.ts` | PATCH | `/levels/:id` |
| `taxonomy.controller.ts` | DELETE | `/levels/:id` |
| `taxonomy.controller.ts` | GET | `/domains` |
| `taxonomy.controller.ts` | GET | `/certificates` |
| `taxonomy.controller.ts` | GET | `/certificates/:id` |
| `taxonomy.controller.ts` | POST | `/certificates` |
| `taxonomy.controller.ts` | PATCH | `/certificates/:id` |
| `taxonomy.controller.ts` | PATCH | `/certificates/:id/content-links` |
| `taxonomy.controller.ts` | POST | `/certificates/:id/domains` |
| `taxonomy.controller.ts` | POST | `/certificates/:id/topics` |
| `taxonomy.controller.ts` | PATCH | `/certification-topics/:topicId/content-links` |
| `taxonomy.controller.ts` | DELETE | `/certificates/:id` |
| `taxonomy.controller.ts` | GET | `/students` |
| `taxonomy.controller.ts` | GET | `/test-results` |
| `taxonomy.controller.ts` | GET | `/progress-overview` |
| `taxonomy.controller.ts` | GET | `/analytics/dashboard` |
| `taxonomy.controller.ts` | GET | `/reports/domain/:domainId` |
| `upload.controller.ts` | POST | `/upload/avatar` |
| `upload.controller.ts` | POST | `/upload/avatar-base64` |
| `user.controller.ts` | GET | `/users` |
| `user.controller.ts` | GET | `/users/me` |
| `user.controller.ts` | PATCH | `/users/me` |
| `user.controller.ts` | POST | `/users/me/change-password` |
| `user.controller.ts` | GET | `/users/:id` |
| `user.controller.ts` | POST | `/users` |
| `user.controller.ts` | PATCH | `/users/:id` |
| `user.controller.ts` | PATCH | `/users/:id/suspend` |
| `user.controller.ts` | PATCH | `/users/:id/activate` |
| `user.controller.ts` | DELETE | `/users/:id` |
| `vocab-study.controller.ts` | GET | `/vocab-study/dashboard` |
| `vocab-study.controller.ts` | GET | `/vocab-study/session` |
| `vocab-study.controller.ts` | GET | `/vocab-study/review-session` |
| `vocab-study.controller.ts` | POST | `/vocab-study/quiz` |
| `vocab-study.controller.ts` | POST | `/vocab-study/answer` |
| `vocab-study.controller.ts` | POST | `/vocab-study/rate` |
| `vocab-study.controller.ts` | GET | `/vocab-study/summary` |
| `vocab-study.controller.ts` | GET | `/vocab-study/history` |
| `vocabulary.controller.ts` | GET | `/vocabulary` |
| `vocabulary.controller.ts` | GET | `/vocabulary/:id` |
| `vocabulary.controller.ts` | POST | `/vocabulary` |
| `vocabulary.controller.ts` | PATCH | `/vocabulary/bulk-status` |
| `vocabulary.controller.ts` | PATCH | `/vocabulary/:id` |
| `vocabulary.controller.ts` | DELETE | `/vocabulary/:id` |

## Web — file route

- `apps/web/app/(admin)/admin/career-goals/page.tsx`
- `apps/web/app/(admin)/admin/certifications/[id]/page.tsx`
- `apps/web/app/(admin)/admin/certifications/page.tsx`
- `apps/web/app/(admin)/admin/dashboard/page.tsx`
- `apps/web/app/(admin)/admin/learner-groups/page.tsx`
- `apps/web/app/(admin)/admin/learner-preview/page.tsx`
- `apps/web/app/(admin)/admin/learning-content/page.tsx`
- `apps/web/app/(admin)/admin/lessons/editor/page.tsx`
- `apps/web/app/(admin)/admin/lessons/page.tsx`
- `apps/web/app/(admin)/admin/levels/page.tsx`
- `apps/web/app/(admin)/admin/page.tsx`
- `apps/web/app/(admin)/admin/progress/page.tsx`
- `apps/web/app/(admin)/admin/questions/editor/page.tsx`
- `apps/web/app/(admin)/admin/questions/page.tsx`
- `apps/web/app/(admin)/admin/reports/[id]/page.tsx`
- `apps/web/app/(admin)/admin/reports/page.tsx`
- `apps/web/app/(admin)/admin/roles/[id]/page.tsx`
- `apps/web/app/(admin)/admin/roles/page.tsx`
- `apps/web/app/(admin)/admin/search/page.tsx`
- `apps/web/app/(admin)/admin/students/[id]/page.tsx`
- `apps/web/app/(admin)/admin/students/page.tsx`
- `apps/web/app/(admin)/admin/test-results/[id]/page.tsx`
- `apps/web/app/(admin)/admin/test-results/page.tsx`
- `apps/web/app/(admin)/admin/tests/builder/page.tsx`
- `apps/web/app/(admin)/admin/tests/page.tsx`
- `apps/web/app/(admin)/admin/users/page.tsx`
- `apps/web/app/(auth)/forgot-password/page.tsx`
- `apps/web/app/(auth)/google/callback/page.tsx`
- `apps/web/app/(auth)/login/page.tsx`
- `apps/web/app/(auth)/register/page.tsx`
- `apps/web/app/(auth)/reset-password/page.tsx`
- `apps/web/app/(learner)/learn/catalog/page.tsx`
- `apps/web/app/(learner)/learn/certifications/[id]/page.tsx`
- `apps/web/app/(learner)/learn/certifications/page.tsx`
- `apps/web/app/(learner)/learn/flashcards/[id]/page.tsx`
- `apps/web/app/(learner)/learn/flashcards/[id]/practice/page.tsx`
- `apps/web/app/(learner)/learn/flashcards/[id]/quiz/page.tsx`
- `apps/web/app/(learner)/learn/flashcards/page.tsx`
- `apps/web/app/(learner)/learn/lessons/[id]/page.tsx`
- `apps/web/app/(learner)/learn/lessons/page.tsx`
- `apps/web/app/(learner)/learn/page.tsx`
- `apps/web/app/(learner)/learn/practice/page.tsx`
- `apps/web/app/(learner)/learn/profile/page.tsx`
- `apps/web/app/(learner)/learn/progress/page.tsx`
- `apps/web/app/(learner)/learn/quiz/[id]/page.tsx`
- `apps/web/app/(learner)/learn/quiz/result/[id]/page.tsx`
- `apps/web/app/(learner)/onboarding/page.tsx`
- `apps/web/app/(learner)/onboarding/placement-test/page.tsx`
- `apps/web/app/landing/page.tsx`
- `apps/web/app/page.tsx`

## Mobile — file route

- `apps/mobile/app/(auth)/forgot-password.tsx`
- `apps/mobile/app/(auth)/login.tsx`
- `apps/mobile/app/(auth)/register.tsx`
- `apps/mobile/app/(onboarding)/certificate.tsx`
- `apps/mobile/app/(onboarding)/goal.tsx`
- `apps/mobile/app/(onboarding)/it-field.tsx`
- `apps/mobile/app/(onboarding)/level.tsx`
- `apps/mobile/app/(onboarding)/plan.tsx`
- `apps/mobile/app/(tabs)/certificates.tsx`
- `apps/mobile/app/(tabs)/home.tsx`
- `apps/mobile/app/(tabs)/learning.tsx`
- `apps/mobile/app/(tabs)/practice.tsx`
- `apps/mobile/app/(tabs)/profile.tsx`
- `apps/mobile/app/(tabs)/progress.tsx`
- `apps/mobile/app/certifications/[id].tsx`
- `apps/mobile/app/certifications/index.tsx`
- `apps/mobile/app/flashcards/dashboard.tsx`
- `apps/mobile/app/flashcards/history.tsx`
- `apps/mobile/app/flashcards/index.tsx`
- `apps/mobile/app/index.tsx`
- `apps/mobile/app/lessons/[id].tsx`
- `apps/mobile/app/lessons/index.tsx`
- `apps/mobile/app/placement-test.tsx`
- `apps/mobile/app/profile/change-password.tsx`
- `apps/mobile/app/profile/edit.tsx`
- `apps/mobile/app/quiz/[id].tsx`
- `apps/mobile/app/test-result/[id].tsx`
