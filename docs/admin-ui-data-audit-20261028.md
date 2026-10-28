# Admin choices, feedback and duration audit

- General domain choices now default to active database records. No list of three names is embedded in the UI. Explicit `activeOnly=false` remains available for historical administration.
- Certificate blueprint areas are preserved as certificate structure. Certificate filters derive their general learning domains from active linked exam/lesson domains as well as active direct links. Adding a topic uses the certificate's existing areas, so hiding retired general choices does not break existing structures.
- All shared dropdowns with more than one choice include text search, including short certificate lists.
- Failed mutations emit immediate viewport toast feedback and still reject to the caller for contextual error handling. Reads do not produce mutation notifications. Error notifications remain visible for eight seconds and can be dismissed.
- Certificate topic weights, counts, status and lesson minutes are returned by the API. The old AWS sample seeder did assign twelve minutes to every lesson. New seeded durations use readable content; untouched old defaults are repaired during migration. Records edited after creation are left alone.
- The lesson editor can estimate study minutes as content changes or accept an explicit duration. Estimates are not actual learner study time. Reading speed, glossary effort and code effort are estimation parameters, not fabricated observed data.
- Placement duration follows question count. Flashcard goal completion uses API goal metadata rather than a fixed twenty-word threshold.

Read-only production verification on this task found the new home sections (`continue-heading`, `review-heading`, `profile-heading`) in the served lesson-home JavaScript and no old activity block. GitHub reported successful CI and deploy for `4830f0e`. This verifies the server response; it does not prove that an already-open browser tab has loaded the new bundle.
