# Explicit proficiency and career focus

Both profile editors start without a selected level for unconfirmed accounts.
Mobile onboarding no longer substitutes `beginner` when its saved level is missing.
Completing onboarding requires a level; choosing one is self-assessment, and the
existing optional placement assessment can determine a level later.

`LearnerProfile.levelSelectedAt` distinguishes a confirmed level from the required
internal baseline created at registration. Profile APIs return a null level until
selection or a submitted placement assessment. Editing unrelated preferences does
not confirm it. Career choices remain optional and persist through the shared API.

Career preferences reprioritize selected domains in the core path, vocabulary
groups, exam recommendations and placement-plan candidates. Existing prerequisites,
level checks and selected domains still apply. AI receives the selected careers.
Profile editors show which selected domains actually match each chosen career.
Unknown or inactive careers do not get an invented domain mapping.

The initial broad mappings live in `career-focus.ts`: Cloud → CLOUD; Security →
CYBERSEC; Network → CLOUD/CYBERSEC; Data → SOFTWARE_ENG/CLOUD; Business Analyst →
SOFTWARE_ENG; Software → SOFTWARE_ENG; DevOps → CLOUD/SOFTWARE_ENG. These prioritize
existing domain material; they do not imply dedicated courses for each occupation.

## Deployment

Deploy migration `20261105150000_explicit_learner_level` before the updated API.
Both existing and fresh-install migration histories contain the same SQL.
The migration preserves levels for previously completed onboarding and submitted
placement assessments. Historical completed onboarding did not record whether a
level was explicitly chosen or supplied by an old client fallback, so those older
records cannot be distinguished reliably and are retained rather than erased.

Deploy the web build and build/install an updated Android APK. Existing installed
APKs will not acquire these UI changes automatically. This change does not itself
deploy code, migrate the production database, or publish an APK.

## Verification

- Web/mobile TypeScript, API build and Prisma schema validation.
- Web production build; Android Hermes export.
- 42 mobile tests and 57 web tests.
- API base suite, placement/HTTP suite, agenda and learning-path suites.
- New regression coverage: an unconfirmed registration baseline is hidden;
  unrelated edits cannot confirm it; missing onboarding level is rejected;
  explicit selection confirms it; changing career changes actual path ordering
  while preserving current level and prerequisites.

The SQL migration has not been executed against production. Device interaction
still requires installing the updated APK and testing with the updated API.
