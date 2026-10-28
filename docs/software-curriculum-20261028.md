# Software Engineering curriculum

The managed Software path contains ten lessons and fifty distinct, published terms at each of the four levels. The first four lesson slugs and IDs are retained; six lessons extend each level. Each level covers terminology, vocabulary, technical reading, API documentation, system design and case studies. Words include English/Vietnamese definitions and bilingual examples. Each assessment has at least eighteen questions covering the original module and new lessons.

The broader vocabulary catalog can contain additional terms. This update does not remove unrelated catalog content or learner history. It normalizes the level of the managed terms while retaining their vocabulary IDs. Software advancement requires all ten lessons and a passing assessment taken after completion; other domains keep their existing four-lesson requirement.

Lesson review (`sourceLessonId` with `onlyNew=false`, without `reviewOnly`) returns every published linked word, including mastered words. Daily limits still apply to new-word sessions. Due-review mode still filters by review date.

## Check and apply

From `apps/api`, with the intended `DATABASE_URL` already set:

```sh
node prisma/seed-software-curriculum.cjs           # validate source data without writes
node prisma/seed-software-curriculum.cjs --audit   # read-only persisted-content audit
node prisma/seed-software-curriculum.cjs --apply   # reconcile managed content
```

Back up the database before applying. The existing VPS deployment script already creates a database backup before `docker/migrate.cjs`. After schema migrations, that runner audits Software and applies the update only if needed. An empty installation without Software taxonomy or a content author is skipped; run the updater after initial taxonomy/account seeding. A failed audit rolls back the content transaction.

CI validates all source data and tests the updater against its disposable PostgreSQL service. The integration check loads twice, verifies no duplicated rows or changed history, and compares every one of the forty lesson-review sessions with its trail label. It also verifies that all eight mastered words remain available after the daily target. Only use `SOFTWARE_CURRICULUM_QA=1` for an explicitly disposable test database.
