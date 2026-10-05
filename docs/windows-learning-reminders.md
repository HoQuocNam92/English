# Windows Server learning reminders

Windows Task Scheduler calls the API every minute. The API uses each learner's timezone and saved reminder time to create a persistent notification. A unique user/date constraint prevents duplicate in-web notifications, including concurrent scheduler calls. Delayed runs catch up for the current local day. Web polls every 30 seconds while visible; dismissing or clicking “Học ngay” marks the notification read across devices. Firebase remains optional for notifications outside the web.

## API deployment

1. Deploy the code, then run `pnpm --filter @techenglish/api db:generate` and `pnpm --filter @techenglish/api db:migrate:deploy`.
2. Set API environment variables:
   - `LEARNING_REMINDER_SCHEDULER=external` (disables the Nest minute cron).
   - `LEARNING_REMINDER_JOB_KEY=<random secret of at least 32 characters>`.
3. Restart the API. Without external mode, the existing Nest cron creates in-web notifications itself.

`POST /api/v1/internal/jobs/learning-reminders` requires the `x-scheduler-key` header. No learner JWT is used for this server job. Missing configuration rejects the call. The learner-facing `GET /api/v1/notifications/pending` and `PATCH /api/v1/notifications/:id/read` require the signed-in user's JWT and operate only on that user's records.

## Windows Server setup

Copy `scripts/windows` to a permanent directory on the server. Copy `learning-reminders.config.example.json` to a private config file outside the repository; fill in the API URL (including `/api/v1`) and the same secret as the API. Restrict access to SYSTEM and administrators; the key is never put in the browser or the task command line. Use HTTPS for remote calls.

Run PowerShell as Administrator:

```powershell
.\invoke-learning-reminders.ps1 -ConfigPath C:\TechEnglish\private\reminders.json
.\register-learning-reminders.ps1 -ConfigPath C:\TechEnglish\private\reminders.json
Get-ScheduledTaskInfo -TaskName TechEnglish-LearningReminders
```

Registration runs as SYSTEM even when no user is logged in and does not overwrite an existing task. Keep the runner and config paths accessible to SYSTEM. Check `LastTaskResult` for success (0); failures return a nonzero result. Follow your Windows execution policy for scripts.

A closed browser does not show an in-web banner: the reminder is stored and displayed on the next visit. System push notifications still need Firebase and browser permission. Scheduling does not grant that permission.

References: [Microsoft ScheduledTasks trigger](https://learn.microsoft.com/en-us/powershell/module/scheduledtasks/new-scheduledtasktrigger), [Prisma unique constraints](https://www.prisma.io/docs/orm/prisma-schema/data-model/indexes).
