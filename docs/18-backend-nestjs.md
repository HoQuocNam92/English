# 18 — Backend NestJS Guide

## Module boundaries
Nest module chỉ là composition root của feature.
Controller không phải nơi đặt nghiệp vụ.

## Request flow

```text
HTTP Request
→ Controller
→ Validate DTO
→ Application Use Case
→ Domain
→ Port
→ Infrastructure Adapter
→ Presenter
→ HTTP Response
```

## Naming
- `CreateLessonUseCase`
- `QuestionRepository` (port)
- `OrmQuestionRepository` hoặc implementation theo ORM thật
- `CreateLessonHttpDto`
- `LessonPresenter`

## Nest Dependency Injection
Infrastructure implementation bind vào token/interface abstraction ở module wiring.
Không import concrete repository vào use case.

## Auth
Guard có thể xác thực token/context.
Use case vẫn phải nhận actor/user context cho các authorization rule quan trọng.

## Transactions
Transaction nằm ở infrastructure/composition boundary; application diễn tả nhu cầu atomicity qua abstraction khi cần.
Exam submit là ứng viên rõ ràng cho transaction.
