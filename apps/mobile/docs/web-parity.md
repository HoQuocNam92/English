# Mobile and web alignment

The mobile app uses Inter (bundled under the SIL Open Font License), shared design tokens, outline icons, and shared text, button, tab, badge and list controls. Use `src/shared/ui/primitives.tsx` and `AppIcon.tsx` for new screens; screen-specific positioning belongs in the screen styles. Nested text inherits its parent’s font and color. Headers and lesson/quiz action areas account for device safe areas.

Learner flows aligned in this change:

- Certifications: visible navigation tab, search by name/code/provider, progress filters, one roadmap action per card, real topic lesson progress, knowledge lessons and completion-gated practice quizzes. Certificate/topic context survives quiz submission and result navigation.
- Vocabulary: the new-only switch changes the requested session; examples bold the current term; quiz questions use the studied word IDs. Wrong answers return to the queue until correct, correct words leave the queue, manual previous/continue controls preserve responses without duplicate submissions, and feedback explains the options.
- Lessons: no personal notebook, team badge or decision checklist. Long-press English lesson text opens a contextual translation dialog with editable phrase, IPA, meaning and pronunciation.
- Placement: shows domain scores, a four-week plan, strengths/weaknesses and answer review. `/learning-plan` restores the persisted plan or creates one from the learner’s goals.
- Home: today/month/year agenda comes from the same `/progress/me/agenda` endpoint as web. Shared mobile route mapping converts web task links to native routes.
- Exams: multiple-answer questions use the API’s `multiple_choice` type; short answers submit `textAnswer`; question context is displayed.

Validation: mobile TypeScript, Expo exports for Android and web, browser checks of Expo web at 360/390/768px with deterministic API fixtures, quiz retry/history and certificate gating, certificate search, and overflow checks on certification list/detail, lesson, home and login. Physical-device speech and native gestures require Android/iOS device testing; browser fixtures do not verify production data or native OS behavior.
