# Learning trail on web and native mobile

Both clients use `packages/shared-kernel/src/learning-trail.ts` to render a stage per selected domain, topics in core-lesson order, lesson and contextual vocabulary-practice nodes, and an end-stage assessment.

- Completed lessons remain reviewable. Future lessons on the map unlock after preceding core lessons. This is guidance in the learning map, not a restriction on browsing the published lesson library.
- Practice nodes use the actual lesson-scoped flashcard session. They appear only when the lesson has published linked vocabulary.
- Practice completion requires all linked words to have a real `lastReviewAt` after the lesson's completion timestamp. Opening a lesson/session alone never completes practice.
- Word review is supplementary. Existing earned assessment results remain valid; an optional review does not reset a passed course or add a promotion requirement.
- Promotion still requires all selected domain courses and their assessments, followed by explicit user confirmation. Professional continuation plans remain available.
- The daily agenda, compact completion prompt and full learning map prioritize the same pending topic review. The weekly/day calendar remains available as a planning view for new lessons; it is not a fixed one-month promise.
- No new tables, migrations, generated lessons or fake grades are introduced.

Validation covers sequential unlocking, actual review timestamps, empty content, checkpoint readiness, retained completed history, native route mapping, level confirmation, shared/web/mobile regression suites, API tests, Next production build and Android bundle export.
