# Mobile and web alignment

The mobile app uses Inter (bundled under the SIL Open Font License), shared design tokens, outline icons, and shared text, button, tab, badge and list controls. Use `src/shared/ui/primitives.tsx` and `AppIcon.tsx` for new screens; screen-specific positioning belongs in the screen styles. Nested text inherits its parent’s font and color. Headers and lesson/quiz action areas account for device safe areas.

Learner flows aligned in this change:

- Certifications: visible navigation tab, search by name/code/provider, progress filters, one roadmap action per card, real topic lesson progress, knowledge lessons and completion-gated practice quizzes. Certificate/topic context survives quiz submission and result navigation.
- Vocabulary: the new-only switch changes the requested session; examples bold the current term; quiz questions use the studied word IDs. Wrong answers return to the queue until correct, correct words leave the queue, manual previous/continue controls preserve responses without duplicate submissions, and feedback explains the options.
- Lessons: no personal notebook, team badge or decision checklist. Long-press English lesson text opens a contextual translation dialog with editable phrase, IPA, meaning and pronunciation.
- Placement: shows domain scores, a four-week plan, strengths/weaknesses and answer review. `/learning-plan` restores the persisted plan or creates one from the learner’s goals.
- Home: today/month/year agenda comes from the same `/progress/me/agenda` endpoint as web. Shared mobile route mapping converts web task links to native routes.
- Exams: multiple-answer questions use the API’s `multiple_choice` type; short answers submit `textAnswer`; question context is displayed.

Alignment and cleanup on 2026-10-07:

- Removed the inactive web/mobile i18n providers, English UI dictionaries, locale setters, and unused lesson notebook props/styles. The UI remains Vietnamese; contextual English-to-Vietnamese lesson translation is still used.
- Mobile home now displays pending learning reminders from `/notifications/pending`, retries while focused/active, and marks reminders read before closing or starting a lesson.
- Web agenda/recommendation links map to native progress and lesson-vocabulary screens, preserving certificate/topic query context. Lesson vocabulary uses the paginated `/vocabulary?sourceLessonId=...` endpoint and only lists published words from published lessons.
- Mobile translation, AI recommendations, agenda, and placement-plan requests allow 60 seconds. Ordinary requests retain the 15-second timeout.
- Profile editing has a retry screen when initial data cannot be loaded and validates target ranges, phone and bio before saving. Invalid or empty numeric input no longer silently becomes a default. Password changes follow the backend's 6–72 character rule.
- Removed unreferenced web list-filter/list-option helpers and unused mobile styles. CI now runs mobile regression tests for navigation, timeouts and target validation.

Verified for this update: API build and unit tests, shared-package typechecks/tests, Prisma validation, web production build with `NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`, mobile typecheck/regression tests, and Android/iOS Expo exports. Exports are JavaScript/Hermes bundles, not installable APK/IPA files. Native OS notification delivery and physical-device interaction still need device testing.

Validation: mobile TypeScript, Expo exports for Android and web, browser checks of Expo web at 360/390/768px with deterministic API fixtures, quiz retry/history and certificate gating, certificate search, and overflow checks on certification list/detail, lesson, home and login. Physical-device speech and native gestures require Android/iOS device testing; browser fixtures do not verify production data or native OS behavior.
