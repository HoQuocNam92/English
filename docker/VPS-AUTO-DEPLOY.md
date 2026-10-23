# Auto deploy on the existing VPS

Push to main runs CI and container delivery. Only a successful push run triggers
Deploy containers, using the exact tested commit's GHCR images. PRs do not deploy.
The deploy workflow must be merged into the default branch to activate workflow_run.

## One-time GitHub setup

Repository Settings > Secrets and variables > Actions > Variables:

- NEXT_PUBLIC_API_URL = https://api.techenglish.click/api/v1

Settings > Environments > production > Secrets:

- DEPLOY_HOST = 52.65.21.143
- DEPLOY_USER = ubuntu
- DEPLOY_SSH_KEY = a dedicated deployment private SSH key whose public key is in
  /home/ubuntu/.ssh/authorized_keys
- DEPLOY_KNOWN_HOSTS = verified SSH known_hosts entry for the VPS

For fully automatic releases, do not enable required reviewers or wait timers on
the production environment. Restrict deployment branches to main as appropriate.
For manual SHA releases, choose a commit whose CI images have already passed.

## One-time VPS setup

The default checkout is /home/ubuntu/apps/English. Keep .env.compose and
apps/api/.env there, with permissions 600. Git must be able to fetch origin main
noninteractively and ubuntu must be able to run Docker without sudo.

If GHCR packages are private, run docker login ghcr.io as ubuntu using a token
with read:packages and access to those packages. Prefer --password-stdin.
Make sure the workflow's published packages are visible to that account.

Do not copy a local .env.compose over the live one: preserve the live database
password and HTTPS URLs. The script overrides API_IMAGE and WEB_IMAGE with the
release SHA without altering the env file. SMTP and OAuth settings remain on VPS.

Before the first automatic release, reconcile tracked changes on the VPS. The
script fails on modified tracked files rather than discarding them. It checks out
the release in detached HEAD mode; this is expected.

Confirm the SSH host key fingerprint over your existing trusted SSH session:

```bash
sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

On Windows, obtain the corresponding known_hosts entry and compare its fingerprint
before storing it in DEPLOY_KNOWN_HOSTS:

```powershell
ssh-keyscan -t ed25519 52.65.21.143 2>$null | Set-Content -Encoding ascii vps-known-hosts.txt
ssh-keygen -lf vps-known-hosts.txt
Get-Content vps-known-hosts.txt
```

SSH port 22 must be reachable from the Actions runner. Do not remove existing SSH
access rules without a replacement; runners do not have one fixed outbound IP.

## Release behavior and recovery

The server pulls images, starts PostgreSQL if needed, backs up the database to
~/techenglish-backups, runs migrations, and recreates only API/web. Nginx, TLS,
env files, and the PostgreSQL volume remain in place. Monitor backup disk usage;
this script does not delete backups automatically. Migration and startup can
briefly affect availability; this is not a zero-downtime deployment.

A failed migration stops deployment; failed application health checks fail the
workflow and need investigation. There is no automatic database rollback. Use
the manual Deploy containers workflow with a previous published SHA only if its
code remains compatible with the current database schema. The older
docker/deploy.sh uses /opt/techenglish and is not used by this VPS workflow.
