# File storage for operational state

PostgreSQL retains 43 public tables, including `_prisma_migrations`.
MFA enrollment, audit events, audit alerts and measured study-time sessions are
stored as four collections in `state.json` under `TECHENGLISH_STATE_DIR`.
Compose mounts the persistent `file_state` volume at `/var/lib/techenglish-state`
in both the migration and API containers. Do not remove this volume.

The directory is private and files use mode 0600. MFA secrets remain encrypted
and recovery codes remain hashed. The server's existing encryption key must be
retained when restoring the files to a new host.

File operations use a PostgreSQL advisory transaction lock, and updates write
an fsynced journal containing the PostgreSQL transaction ID before committing.
After commit, the journal is atomically renamed into the current state. Recovery
checks PostgreSQL's transaction outcome: committed changes are applied and
aborted changes are discarded. Corrupt files or unresolved transactions fail
closed rather than replacing data with an empty file.

The deployment stops the old API before exporting the legacy four tables.
The exporter writes the complete data to the persistent volume before migration.
The migration rejects populated tables without a verified export marker and row
count. Historical migration SQL is retained; existing histories are not rewritten.
Fresh installs finish with the same 43-table schema.

A SQL dump now backs up PostgreSQL only. A complete backup must also include a
checkpointed `state.json` from the API volume. Restore both the SQL and the state
file, retain the encryption key, and start the API only after both are present.
Do not restore a raw `pending.json` into another database: transaction IDs belong
to the original PostgreSQL cluster. Use the checkpoint export script instead.
