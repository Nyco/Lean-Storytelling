# Quickstart & Deployment Guide: Lean Storytelling v0.3

**Branch**: `003-v03-public-app`
**Date**: 2026-03-27

---

## Prerequisites

- Docker and Docker Compose installed ([get Docker](https://docs.docker.com/get-docker/))
- A Resend account and API key ([resend.com](https://resend.com) — free tier is sufficient)
- For production: a VPS on Scaleway or OVH (1 CPU, 2 GB RAM minimum), with ports 80 and 443 open

---

## Local Setup (Ubuntu or macOS)

**1. Clone the repository and configure environment**

```bash
git clone https://github.com/your-org/lean-storytelling.git
cd lean-storytelling
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://ls_user:ls_password@db:5432/lean_storytelling
POSTGRES_DB=lean_storytelling
POSTGRES_USER=ls_user
POSTGRES_PASSWORD=change_me_local
JWT_SECRET=generate_a_long_random_string_here
RESEND_API_KEY=re_your_key_here
FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=http://localhost:3000
```

**2. Start the stack**

```bash
docker compose up --build
```

**3. Open the app**

Visit `http://localhost:3000` — the Story Builder loads immediately.

**To stop**: `Ctrl+C` then `docker compose down`
**To reset the database**: `docker compose down -v` (deletes all data)

---

## Production Deployment (VPS — Scaleway or OVH)

**1. Provision the VPS**

- OS: Ubuntu 24.04 LTS
- Size: 1 CPU / 2 GB RAM (DEV1-S on Scaleway or VPS Starter on OVH)
- Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

**2. Install Docker on the VPS**

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in for group membership to take effect
```

**3. Install Certbot for HTTPS (Let's Encrypt)**

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
```

Certificates are stored at `/etc/letsencrypt/live/yourdomain.com/`.

**4. Clone the repository and configure environment**

```bash
git clone https://github.com/your-org/lean-storytelling.git /opt/lean-storytelling
cd /opt/lean-storytelling
cp .env.example .env
```

Edit `.env` with production values:
```
DATABASE_URL=postgresql://ls_user:STRONG_PASSWORD@db:5432/lean_storytelling
POSTGRES_DB=lean_storytelling
POSTGRES_USER=ls_user
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
JWT_SECRET=LONG_RANDOM_STRING_MIN_32_CHARS
RESEND_API_KEY=re_your_production_key
FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

**5. Start the stack**

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

**6. Verify**

```bash
docker compose ps          # all containers should be "Up"
curl https://yourdomain.com  # should return the app HTML
```

---

## Automated Daily Backup

**Set up the backup cron job** (run on the VPS host):

```bash
sudo crontab -e
```

Add this line (runs daily at 3am):
```
0 3 * * * docker exec ls-db pg_dump -U ls_user lean_storytelling | gzip > /backups/$(date +\%F).sql.gz
```

Create the backup directory:
```bash
sudo mkdir -p /backups
```

Add cleanup to keep only the last 30 days:
```
0 4 * * * find /backups -name "*.sql.gz" -mtime +30 -delete
```

**Verify a backup was created**:
```bash
ls -lh /backups/
```

---

## Restore from Backup

**Stop the backend** (to prevent writes during restore):
```bash
docker compose stop backend
```

**Restore**:
```bash
gunzip -c /backups/YYYY-MM-DD.sql.gz | docker exec -i ls-db psql -U ls_user lean_storytelling
```

**Restart**:
```bash
docker compose start backend
```

---

## Updating the App

```bash
cd /opt/lean-storytelling
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Zero-downtime: the backend container restarts in a few seconds; the DB container is not restarted unless its image changed.

---

## Troubleshooting

| Problem | Command |
|---|---|
| Check container logs | `docker compose logs backend` |
| Check DB logs | `docker compose logs db` |
| Restart a service | `docker compose restart backend` |
| Connect to DB directly | `docker exec -it ls-db psql -U ls_user lean_storytelling` |
| Check HTTPS certificate | `sudo certbot certificates` |
| Renew certificate (auto) | `sudo certbot renew --dry-run` |
