# AI and CI audit — 2026-10-29

## Four AI capabilities

Live calls using the local API configuration and synthetic learning data returned AI results for all four provider operations: contextual translation (OpenAI), four-week plan, daily agenda, and recommendation ranking. These calls verify the local configured provider, not production credentials or deployed UI behavior.

1. Contextual translation is wired to both the mobile TranslationProvider and web SelectionTranslator. Existing tests cover dictionary fallback, credential rejection, caching by context and grammar/IPA fields.
2. AI learning plans are exposed by POST /placement-test/plan. App/web show them primarily through the legacy-plan branch when the core learning path is unavailable. The main configured core path is deterministic, not an AI four-week plan.
3. The daily agenda API can call AI. Mobile LearningAgenda exists but is not mounted by current screens; no web caller was found. The configured core-path branch of LearningAgendaService returns the deterministic baseline before the AI call.
4. Recommendation ranking is implemented behind GET /recommendations/me and passed a live provider call. No current app/web consumer was found. VocabularyRecommendations uses /vocab-study/recommendations, which is a separate rules-based feature.

Therefore all four provider capabilities respond, but it would be inaccurate to say all four are fully exposed to users in both clients. No UI functionality was added as part of this audit.

## CI failure and correction

Failed run: https://github.com/HoQuocNam92/English/actions/runs/40898614936

The checks job stopped at prisma migrate diff; image builds and deploy were skipped. Reproducing the complete fresh-install migrations plus account identity integration on an isolated PostgreSQL QA database showed a foreign-key difference in study_time_sessions. The SQL migration uses ON UPDATE NO ACTION while Prisma inferred CASCADE.

The relation now explicitly declares onUpdate: NoAction, matching the already applied migration without rewriting migration history. Re-running account-identity.integration.cjs and the exact CI schema-diff command reported No difference detected.

Local validation also passed learning AI, contextual translation/certification, placement (including HTTP), agenda, and web regression suites.
