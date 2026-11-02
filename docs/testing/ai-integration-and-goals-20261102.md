# AI integration and goal presentation — 2026-11-02

This completes the UI gaps documented in ai-and-ci-audit-20261029.md without adding database tables or dashboard panels.

- Home on web and mobile calls the daily agenda and personalized recommendations independently of its core data load. Existing hero copy shows the daily guidance; existing primary/secondary actions open the next permitted task and one ranked recommendation. AI/API failures retain the ordinary home actions and measured goal totals.
- The configured-core-path branch now passes its permitted task list through the AI agenda service rather than returning before AI enrichment. AI only reorders supplied tasks and cannot invent destinations or alter completion/level.
- Existing Plan screens expose a switch between the current learning progression and a compact four-week plan. Creating/updating a plan is available even with a configured core path. The compact view reuses the same content area with simple weekly dividers; it does not add nested cards. Mobile uses the POST response directly and keeps the action available after errors.
- Home goal tiles display actual completed work and the target on separate lines, a progress bar capped at 100%, and achieved/exceeded wording. Values such as 14 words with a target of 10 never appear as a fraction.

Validation: web/mobile typecheck; 35 web tests; 42 mobile tests; 12 agenda tests; 6 provider/learning-AI tests; 122 API tests; API build; web production build; Android Hermes export. Production-browser QA at 390px and 1440px verified separate actual/target labels, exceeded wording, AI destinations, four-week creation, switching back to the core path, fallback on failed AI requests and no horizontal overflow. Screenshots inspected locally under .tmp-mobile-qa/ai-home-*.png and ai-plan-*.png.

Translation remains connected through the existing selection translators on both clients. All four capabilities are now reachable from the existing app/web screens.
