# Learning trail on web and native mobile

Both clients use `packages/shared-kernel/src/learning-trail.ts` to render a stage per selected domain, topics in core-lesson order, lesson and contextual vocabulary-practice nodes, and an end-stage assessment.

- Completed lessons remain reviewable. Future lessons on the map unlock after preceding core lessons. This is guidance in the learning map, not a restriction on browsing the published lesson library.
- Practice nodes use the actual lesson-scoped flashcard session. They appear only when the lesson has published linked vocabulary.
- Practice completion requires all linked words to have a real `lastReviewAt` after the lesson's completion timestamp. Opening a lesson/session alone never completes practice.
- Word review is supplementary. Existing earned assessment results remain valid; an optional review does not reset a passed course or add a promotion requirement.
- Promotion still requires all selected domain courses and their assessments, followed by explicit user confirmation. Professional continuation plans remain available.
- The daily agenda, compact completion prompt and full learning map prioritize the same pending topic review. The weekly/day calendar has been removed; the topic-based map is the learning interface.
- No new tables, migrations, generated lessons or fake grades are introduced.

Validation covers sequential unlocking, actual review timestamps, empty content, checkpoint readiness, retained completed history, native route mapping, level confirmation, shared/web/mobile regression suites, API tests, Next production build and Android bundle export.

## Separate progress reporting

The Progress screens on web and mobile use the shared `learning-report.ts` model. They report accumulated completed/in-progress lessons, studied words, current-level reading completion and assessment outcomes, certificate statistics, and real lesson activity history. They do not render the learning map, recommendations, promotion actions or planned weekly/day calendars. A navigation link opens the learning path.

Reading all lessons is separate from passing an assessment. Current-level results use the authoritative path endpoint; cumulative counts/history come from `/progress/me`. Partial failures do not replace unavailable course results with a fabricated zero score.
