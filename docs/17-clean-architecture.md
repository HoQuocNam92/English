# 17 — Clean Architecture

## Dependency Rule

```text
                    ┌─────────────────────────────┐
                    │ Presentation / Frameworks   │
                    │ Nest / Next / React Native  │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │       Application           │
                    │ use cases + ports           │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │          Domain             │
                    │ entities + business rules   │
                    └─────────────────────────────┘

Infrastructure implements ports and is wired from the outside.
```

## Domain
Có:
- Entity.
- Value Object.
- Domain service khi rule không thuộc riêng entity.
- Domain error.
- Pure business invariant.

Không có:
- ORM decorator.
- HTTP status.
- Nest decorator.
- React state.
- fetch/axios.
- database query.

## Application
Có:
- Use case.
- Input/output model.
- Repository/provider port.
- Transaction abstraction nếu cần.
- Authorization policy ở mức use-case nếu là rule nghiệp vụ.

Không có:
- SQL.
- Prisma/TypeORM.
- UI component.
- request/response framework object.

## Infrastructure
Có:
- Repository implementation.
- ORM schema/model mapper.
- Redis/cache adapter.
- Email/storage/AI adapter.
- HTTP client external provider.
- transaction implementation.

## Presentation
Backend:
- Controller.
- Guard.
- HTTP DTO.
- Presenter.
- Filter/interceptor.

Web/Mobile:
- Screen/page.
- Component.
- View model/hook.
- Navigation.

## Mapper strategy
Không truyền ORM entity xuyên layer.
Dùng mapper:
`Persistence Model ↔ Domain Entity`
và presenter:
`Application Output → API Response`.

## Example: Submit Exam
Presentation:
`POST /exams/:id/submit`

Application:
`SubmitExamUseCase`

Domain:
- scoring rule;
- attempt state;
- invariant: không submit attempt đã finalized.

Ports:
- ExamRepository
- AttemptRepository
- ProgressRepository
- UnitOfWork

Infrastructure:
- ORM repositories;
- transaction adapter.

## Tests
- Domain: unit test thuần.
- Application: unit test với fake/in-memory ports.
- Infrastructure: integration test.
- Controller/UI: contract/component/e2e khi cần.
