# Account suspension and soft-delete recovery

No new application tables. Migration `20261025090000_user_suspension_reason` adds one nullable `users.suspension_reason` column in both migration histories. Existing suspended users remain blocked and receive a contact-admin fallback if no reason was recorded.

## Admin actions

- Users → status **Đã khóa**: view the stored public reason and choose **Mở khóa**.
- Locking requires a trimmed 3–500 character reason, prohibits self/admin suspension, and revokes refresh tokens. Unlocking clears the current reason and does not revive revoked tokens.
- Users → status **Đã xóa**: separately lists soft-deleted records, showing deletion date and **Khôi phục** when the original email is still reserved.
- Restore preserves the original user ID, password, roles and learning history; it does not create a new identity. It clears deletion/suspension status and requires signing in again.
- Restore is allowed while the old email remains reserved, including after the initial 30-day registration delay if nobody has reclaimed it. Once registration releases the original email and tombstones the old identity, restore is rejected and the original email is not reassigned from the new account.
- Serializable transactions and conditional writes protect restoration against concurrent re-registration. Ordinary activation cannot restore a deleted record. General profile updates cannot change account status.

## Learner messaging

Password login, verified Google login, refresh and JWT-protected requests report the saved suspension reason. The web Google callback redirects back to login with this message. Native password/Google login already displays shared API messages through its error UI.

## Validation

API tests cover reason validation, role/self protections, token revocation, separate lists, unchanged identity/history, blocked released-email restoration, concurrent conflicts, reason consistency on password/Google login and no status bypass through profile updates. Run API/web builds, Prisma validation, and web/native regression suites. The deployment script backs up the database before applying the migration.
