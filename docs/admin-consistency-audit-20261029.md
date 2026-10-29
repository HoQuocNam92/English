# Admin consistency and account identity audit

## Changes

- Permissions use “nhóm chức năng”, “quyền hạn” and “vai trò”. Searching permissions includes Vietnamese labels, and switching tabs clears filters from the previous tab. Permission identifiers and assignments are preserved.
- Shared pagination no longer provides a typed page jump. Numbered pages, previous/next controls and page-size selection remain; controls wrap on narrow screens.
- Admin list pages use the shared `admin-page-stack` with 24px section gaps (16px below 768px). Direct section margins no longer add to the gap. Internal card/table spacing is independent.
- Dashboard and reports read active specialties from the database. The catalog is editable at `/admin/domains`: code is unique and stable; names, descriptions and activity state can be edited. Retired specialties remain available in catalog management and historical certificate structures.
- A data migration retires eight known seed/sample specialties and certificate blueprint areas from general choices. The three existing specialties CLOUD, CYBERSEC and SOFTWARE_ENG remain active; future custom specialties are not disabled. This is a database catalog change, not a hardcoded three-item UI.
- Specialty charts derive counts and percentages from the returned records, including an empty period. Links open the underlying content editors. Report completion totals use compact cards and a horizontal comparison of actual completed-item counts.
- Certificate scores use horizontal bars. A real zero score remains a scored result; a certificate with no attempts appears separately as “chưa có lượt thi”.
- Reporting level totals now honor the date/domain/certificate filters rather than using lifetime relation counts. Only submitted/graded attempts contribute to scores. Certificate score rows honor the selected domain.

## Identity rules

- Email comparison is trimmed and case insensitive, enforced by a PostgreSQL expression index as well as existing API checks.
- Optional phone numbers share a canonical form: punctuation/spaces are removed, `00` becomes an international prefix, and ten-digit Vietnamese `0…` numbers match `+84…` numbers. An expression index also protects legacy formatting and concurrent requests.
- Null/empty phone numbers may repeat. Updating one's own phone is allowed. Conflicts return a readable HTTP 409 message.
- Personal display names may repeat. Existing unique codes, slugs and relationship keys remain enforced by the schema; no blanket uniqueness is applied to human names or ordinary content titles.
- Migration preflight refuses existing normalized duplicates. It does not merge, delete or silently rewrite accounts.

## Verification

- Read-only audit of the configured database: zero duplicate normalized-email groups; zero duplicate normalized-phone groups; two shared display-name groups. Eleven specialties were still marked active before migration. This audit did not change that database.
- Fresh migration history applied successfully to an isolated local PostgreSQL 18 QA database; Prisma reported no schema difference.
- PostgreSQL integration checks confirmed normalized email/phone collisions, concurrent email creation, own-number updates, repeated names, optional empty phones, retirement of legacy domains, preservation of future custom domains, and real reporting queries with combined filters.
- The integration check is included in CI against its PostgreSQL service. Both existing-install and fresh-install migration histories contain the same new SQL.
- Web tests and API service/regression tests passed. A production web build passed. Desktop/mobile chart fixtures were rendered using the compiled CSS and checked for section gaps and horizontal overflow; this is not authenticated production-browser verification.

The public website changes only after the pushed version is deployed and its migrations complete. Older seed scripts can reactivate sample categories if manually rerun; use catalog management to control active specialties.
