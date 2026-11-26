# TechEnglish: monitoring, notification and S3 backup operations

Dashboard: https://techenglish.click/monitoring/

The running VPS stack is in `/home/ubuntu/techenglish-ops`, separate from the application Git checkout. Prometheus, Grafana, Loki, Alloy, Alertmanager and HTTPS probes run locally. Only Grafana is reverse-proxied publicly and requires login; other ports bind to loopback or stay on the internal Docker network.

## Current notification options

Edit `/home/ubuntu/techenglish-ops/notifications.json` as ubuntu:

```json
{
  "email": {"enabled": true, "to": "hoquocnam92@gmail.com", "use_app_smtp": true},
  "telegram": {"enabled": false, "chat_id": ""}
}
```

Email uses the application's existing SMTP settings. The SMTP password stays on the VPS in a file readable only by the notification process and administrator. It is never written into the public configuration or this repository.

To enable Telegram later, save the bot token in `/home/ubuntu/techenglish-ops/secrets/telegram-token`, set `telegram.enabled` to true, and set the intended Chat ID. Start the bot from that chat first. Leave email enabled to receive both channels, or disable it to receive Telegram only.

The `techenglish-notifications.path` unit watches these settings and credentials and applies valid changes automatically. Invalid settings keep the previous working Alertmanager configuration. To apply explicitly:

```bash
sudo systemctl start techenglish-notifications.service
```

## Automated S3 backup

- Bucket: `vps-backup-2026-unique`, region `ap-southeast-2`.
- Prefix: `techenglish/postgresql/`.
- Authentication: the existing EC2 IAM role; no static AWS keys are stored.
- Daily backup: 02:00 Asia/Bangkok (UTC+7).
- Failed or pending uploads are retried hourly.
- Weekly verification: Sunday 03:00 Asia/Bangkok, downloading the latest completed S3 snapshot and restoring both dump and SQL into isolated temporary databases.
- Objects use SSE-S3 AES256, an expected bucket owner check, SHA256 checksums, and immutable timestamped keys. A completed `latest.json` pointer is written only after the snapshot objects have been verified.
- Each snapshot contains `database.dump`, `database.sql.gz`, `manifest.json` and `SHA256SUMS`.
- Local VPS staging retains 14 daily, 8 weekly and 6 monthly snapshots. Existing S3 retention/public-access policies were not modified; the instance role does not grant those administrative read permissions. This deployment does not delete historical S3 objects.
- The dashboard and alerts use snapshot creation time for backup freshness, so an hourly connectivity check cannot make an old backup appear new.

The Windows `TechEnglishBackupSync` task has been removed. Existing files under `D:\` and `D:\TechEnglish_Backups` are preserved.

## Operational commands

```bash
sudo systemctl start techenglish-backup.service
sudo systemctl start techenglish-s3-sync.service
sudo systemctl start techenglish-restore.service
systemctl list-timers --all | grep techenglish
python3 ~/techenglish-ops/bin/verify-system.py
```

The restore verification command never replaces the production database. A production restoration requires a separate maintenance plan and protection of any newer writes.

## Scope and verification

The backups cover the PostgreSQL database, including all 44 restored tables. External media services and a full VPS disk image are outside this database backup. Application secrets remain in the existing VPS configuration and must be preserved separately for disaster recovery.

Metrics retain 15 days with a 1 GB TSDB limit; centralized logs retain 7 days. API/web Docker logs rotate at 20 MB with five files per container. Monitoring containers rotate their own logs at 10 MB with three files.

The deployed checks cover host resources, container health, PostgreSQL availability, HTTPS/certificate expiry, backup age/failure, S3 upload status and S3 restore verification. A monitor on the VPS cannot send an alert while the whole VPS is powered off; a separate external uptime monitor is required for that failure mode.

