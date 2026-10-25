# Learning journey parity — 2026-10-25

Learner interface changes must cover both web and native mobile when the same feature exists on both platforms.

- Web and mobile import `packages/shared-kernel/src/weekly-study-schedule.ts`: identical weekly groups, daily lesson sessions, durations and assessment ordering.
- Native plan and progress screens use `/progress/me/learning-path`, rather than the historical placement plan for current-level core courses.
- Lesson completion and non-certification quiz results show the next lesson, assessment or explicit level promotion. Reading completion alone does not promote learners.
- Professional completion uses existing continuation endpoints for review, application and certificate plans. Session confirmation is self-reported, not a grade.
- Native progress no longer displays milestone/XP/streak cards. Recent exam results remain available.
- Lesson free-response exercises are hidden consistently; glossary headings capitalize their first letter. Narrow screens use full-width term cards.
- Google mobile authentication already calls the shared API and displays its error messages, including deletion cooldown and suspended-account errors.

Verification: mobile and web regression suites; TypeScript for both clients and shared kernel; Next production build; Android Expo export.

`expo export` validates the JavaScript bundle. A pushed web deployment does not update an installed native binary. Installable APK/IPA delivery uses the separately dispatched `Mobile EAS build` workflow.
