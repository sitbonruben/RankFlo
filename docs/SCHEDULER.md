# RankFlo Scheduled Content Publisher

The RankFlo scheduler automatically publishes posts and social posts when their scheduled time arrives. It provides two implementations: a Next.js API route for serverless environments and a standalone Node script for self-hosted deployments.

## Table of Contents

- [Architecture](#architecture)
- [Setup](#setup)
  - [Serverless Setup (Next.js API Route)](#serverless-setup-nextjs-api-route)
  - [Self-Hosted Setup (Standalone Script)](#self-hosted-setup-standalone-script)
- [Usage](#usage)
- [Configuration](#configuration)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Architecture

### Core Components

1. **Scheduler Service** (`packages/api/src/services/scheduler.ts`)
   - Core logic for finding and publishing scheduled content
   - Supports both posts and social posts
   - Logs all publications to audit trail

2. **API Route** (`apps/web/src/app/api/cron/publish/route.ts`)
   - Next.js API endpoint for serverless environments
   - Secured with CRON_SECRET token
   - Supports health checks and status monitoring

3. **Standalone Script** (`scripts/cron-publish.ts`)
   - Node.js script for self-hosted deployments
   - Can be run via system cron, pm2, or other job schedulers
   - Supports dry-run mode for testing

### Database Schema

The scheduler works with two main models:

**Posts** (`status: "SCHEDULED"`, `scheduledAt <= now()`)
- Changes status from `SCHEDULED` to `PUBLISHED`
- Sets `publishedAt` to current timestamp
- Creates audit log entry

**Social Posts** (`status: "SCHEDULED"`, `scheduledAt <= now()`)
- Changes status from `SCHEDULED` to `PUBLISHED`
- Sets `publishedAt` to current timestamp
- Creates audit log entry with platform details

## Setup

### Prerequisites

- Node.js >= 20.0.0
- PostgreSQL database with RankFlo schema
- Environment variables configured (see [Configuration](#configuration))

### Serverless Setup (Next.js API Route)

Best for: Vercel, Netlify, AWS Lambda, or other serverless platforms

#### 1. Generate a Secure Token

```bash
# Generate a random 32-character secret
openssl rand -hex 16
# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2. Set Environment Variable

Add `CRON_SECRET` to your deployment environment:

**Vercel:**
```bash
vercel env add CRON_SECRET
# Paste your generated secret
```

**Environment file:**
```bash
# .env.local
CRON_SECRET=your_generated_secret_here
```

#### 3. Configure External Cron Service

Use any of these services to call the endpoint:

**Option A: cron-job.org (Free)**

1. Visit https://cron-job.org/
2. Sign up and create a new cron job
3. Configure:
   - URL: `https://your-domain.com/api/cron/publish`
   - Method: `POST`
   - Schedule: Every 5 minutes (or your preference)
   - Headers:
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     Content-Type: application/json
     ```

**Option B: GitHub Actions (Free)**

Add this to `.github/workflows/scheduler.yml`:

```yaml
name: RankFlo Scheduler

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger scheduled publishing
        run: |
          curl -X POST https://your-domain.com/api/cron/publish \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

**Option C: AWS EventBridge**

1. Create a Lambda function that makes the HTTP request:

```javascript
export const handler = async (event) => {
  const response = await fetch('https://your-domain.com/api/cron/publish', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};
```

2. Create an EventBridge rule that triggers this Lambda every 5 minutes

**Option D: Datadog (or similar monitoring services)**

Most monitoring services offer cron job scheduling:

```bash
# Datadog Synthetics - Create a scheduled API test
curl -X POST "https://api.datadoghq.com/api/v1/synthetics/tests" \
  -H "DD-API-KEY: $DD_API_KEY" \
  -H "DD-APPLICATION-KEY: $DD_APP_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "api",
    "url": "https://your-domain.com/api/cron/publish",
    "frequency": 300,
    ...
  }'
```

#### 4. Test the Endpoint

```bash
# Check health
curl -X GET https://your-domain.com/api/cron/publish \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Trigger publishing (use actual secret)
curl -X POST https://your-domain.com/api/cron/publish \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

### Self-Hosted Setup (Standalone Script)

Best for: Docker, Linux servers, VPS, or on-premise deployments

#### 1. Add npm Script

Update `package.json` in the root:

```json
{
  "scripts": {
    "cron:publish": "ts-node scripts/cron-publish.ts"
  }
}
```

Or use compiled JavaScript if you prefer:

```json
{
  "scripts": {
    "cron:publish": "node --loader tsx/esm scripts/cron-publish.ts"
  }
}
```

#### 2. Option A: System Cron

Edit your crontab:

```bash
crontab -e
```

Add entries for your preferred schedule:

```bash
# Every 5 minutes
*/5 * * * * cd /path/to/rankflo && pnpm cron:publish

# Every minute (more frequent updates)
* * * * * cd /path/to/rankflo && pnpm cron:publish

# Every hour
0 * * * * cd /path/to/rankflo && pnpm cron:publish
```

Make sure to use absolute paths and set proper environment variables:

```bash
# Complete crontab entry with env vars
*/5 * * * * source /home/user/.bashrc && cd /path/to/rankflo && DATABASE_URL="postgresql://..." pnpm cron:publish >> /var/log/rankflo-scheduler.log 2>&1
```

#### 2. Option B: PM2 (Recommended for production)

Install PM2:

```bash
npm install -g pm2
```

Create `pm2.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'rankflo-scheduler',
      script: 'scripts/cron-publish.ts',
      exec_interpreter: 'node',
      exec_mode: 'fork',
      args: '--loader tsx/esm',
      cron_time: '*/5 * * * *',  // Every 5 minutes
      env: {
        DATABASE_URL: 'postgresql://...',
        LOG_LEVEL: 'info',
        NODE_ENV: 'production',
      },
      error_file: '/var/log/rankflo-scheduler-error.log',
      out_file: '/var/log/rankflo-scheduler.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
```

Start PM2:

```bash
# Start the scheduler
pm2 start pm2.config.js

# Monitor it
pm2 monit

# View logs
pm2 logs rankflo-scheduler

# Save PM2 config for auto-restart
pm2 save
pm2 startup
```

#### 2. Option C: Docker with Cron

Create a Dockerfile:

```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY . .

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install

# Install cron utilities
RUN apk add --no-cache dcron

# Create cron job
RUN echo '*/5 * * * * cd /app && pnpm cron:publish >> /var/log/rankflo-scheduler.log 2>&1' \
    > /etc/crontabs/root

# Run cron daemon in foreground
CMD ["crond", "-f", "-l", "2"]
```

Or use a systemd timer (more modern):

Create `/etc/systemd/system/rankflo-scheduler.service`:

```ini
[Unit]
Description=RankFlo Scheduler
After=network.target
Requires=rankflo-scheduler.timer

[Service]
Type=oneshot
WorkingDirectory=/path/to/rankflo
ExecStart=/usr/bin/pnpm cron:publish
Environment="DATABASE_URL=postgresql://..."
Environment="LOG_LEVEL=info"
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/rankflo-scheduler.timer`:

```ini
[Unit]
Description=RankFlo Scheduler Timer
Requires=rankflo-scheduler.service

[Timer]
OnBootSec=1min
OnUnitActiveSec=5min
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable rankflo-scheduler.timer
sudo systemctl start rankflo-scheduler.timer
sudo systemctl status rankflo-scheduler.timer
```

## Usage

### Publish Scheduled Content

**Serverless (API Route):**

```bash
curl -X POST https://your-domain.com/api/cron/publish \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**Self-Hosted (Direct script):**

```bash
pnpm cron:publish
```

### Check Pending Items

**Serverless (API Route):**

```bash
curl -X GET https://your-domain.com/api/cron/publish \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Response:
# {
#   "success": true,
#   "timestamp": "2024-03-09T12:00:00.000Z",
#   "data": {
#     "pendingPostsCount": 2,
#     "pendingSocialPostsCount": 5,
#     "totalPending": 7
#   }
# }
```

### Dry Run (Test without changes)

```bash
DRY_RUN=true pnpm cron:publish
```

### Debug Logging

```bash
LOG_LEVEL=debug pnpm cron:publish
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `CRON_SECRET` | Yes (API) | - | Authorization token for API route |
| `LOG_LEVEL` | No | `info` | Log verbosity: `debug`, `info`, `warn`, `error` |
| `DRY_RUN` | No | `false` | Test mode without making changes |
| `NODE_ENV` | No | `development` | Environment: `development`, `production` |

### Example .env Configuration

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rankflo

# Scheduler
CRON_SECRET=your_super_secret_token_here_32_chars_min

# Logging
LOG_LEVEL=info

# Node.js
NODE_ENV=production
```

## Monitoring

### View Published Content

Check the audit logs:

```sql
SELECT * FROM audit_logs
WHERE action LIKE 'post.auto_published' OR action LIKE 'social_post.auto_published'
ORDER BY timestamp DESC
LIMIT 20;
```

### Check Scheduled Queue

```sql
-- Pending blog posts
SELECT id, title, scheduled_at FROM posts
WHERE status = 'SCHEDULED' AND scheduled_at <= NOW()
ORDER BY scheduled_at ASC;

-- Pending social posts
SELECT sp.id, sp.content, sp.scheduled_at, sa.platform, sa.account_name
FROM social_posts sp
JOIN social_accounts sa ON sp.social_account_id = sa.id
WHERE sp.status = 'SCHEDULED' AND sp.scheduled_at <= NOW()
ORDER BY sp.scheduled_at ASC;
```

### Upcoming Scheduled Content

```sql
-- Posts scheduled in the next 7 days
SELECT id, title, scheduled_at FROM posts
WHERE status = 'SCHEDULED' AND scheduled_at > NOW() AND scheduled_at <= NOW() + interval '7 days'
ORDER BY scheduled_at ASC;
```

### API Monitoring

Monitor the scheduler API endpoint:

**Uptime monitoring:**
- StatusPage.io
- Pingdom
- UptimeRobot

**Example with UptimeRobot:**
1. Add a new monitor
2. Monitor type: HTTP(s)
3. URL: `https://your-domain.com/api/cron/publish`
4. HTTP method: GET
5. Custom headers: `Authorization: Bearer YOUR_CRON_SECRET`
6. Check interval: Every 5 minutes

## Troubleshooting

### No Content Being Published

**Check 1: Database Connection**

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM posts WHERE status = 'SCHEDULED';"
```

**Check 2: Pending Items**

```bash
# Check if there are any pending scheduled items
curl -X GET https://your-domain.com/api/cron/publish \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Or directly:
pnpm cron:publish
```

**Check 3: Logs**

```bash
# API route logs (check Next.js output)
LOG_LEVEL=debug pnpm dev

# Script logs
LOG_LEVEL=debug pnpm cron:publish

# PM2 logs
pm2 logs rankflo-scheduler
```

### Authorization Fails

**Verify token:**

```bash
# Extract token from .env
echo $CRON_SECRET

# Test API with correct token
curl -v -X GET https://your-domain.com/api/cron/publish \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Should return 200 with pending counts
```

### Script Exits with Error Code 1

**Check environment variables:**

```bash
echo $DATABASE_URL
echo $LOG_LEVEL
```

**Run with debug logging:**

```bash
LOG_LEVEL=debug DATABASE_URL="postgresql://..." pnpm cron:publish
```

### Cron Job Not Triggering

**For system cron:**

```bash
# Check cron logs
tail -f /var/log/syslog | grep CRON

# Verify cron entry
crontab -l

# Test cron environment
env | grep -E "PATH|HOME|SHELL"
```

**For PM2:**

```bash
pm2 logs rankflo-scheduler
pm2 status rankflo-scheduler
pm2 describe rankflo-scheduler
```

**For GitHub Actions:**

1. Check Actions tab in your repository
2. Look for workflow execution history
3. View logs for any failures

### Database Connection Pool Issues

If you see connection pool errors with frequent runs:

**Add connection pooling:**

```bash
# Use PgBouncer or pgpool for connection pooling
# Then update DATABASE_URL to point to the pooling layer
DATABASE_URL=postgresql://user:password@pgbouncer-host:6432/rankflo
```

**Or reduce run frequency:**

```bash
# Change from every 5 minutes to every 30 minutes
*/30 * * * * pnpm cron:publish
```

### High Memory Usage

**Reduce batch size in scheduler.ts if needed:**

Add pagination to the scheduler for large datasets:

```typescript
// Process in batches of 100
const batchSize = 100;
let skip = 0;
while (true) {
  const posts = await db.post.findMany({
    where: { status: 'SCHEDULED', scheduledAt: { lte: now } },
    skip,
    take: batchSize,
  });

  if (posts.length === 0) break;

  // Process posts...
  skip += batchSize;
}
```

## Performance Considerations

### Optimal Schedule

- **Every 1 minute**: For real-time publishing requirements (higher DB load)
- **Every 5 minutes**: Good balance for most use cases
- **Every 15 minutes**: For lower-traffic applications
- **Every hour**: Minimal overhead, less precise timing

### Database Indexes

The Prisma schema already includes optimal indexes:

```
@@index([organizationId, status, publishedAt(sort: Desc)])  // Posts
@@index([scheduledAt])  // Posts
@@index([organizationId, status])  // Social posts
@@index([organizationId, scheduledAt])  // Social posts
```

### Database Optimization

For large deployments with many scheduled items:

1. Add connection pooling (PgBouncer)
2. Use read replicas for monitoring queries
3. Archive old audit logs periodically
4. Monitor database query performance

## Next Steps

1. Choose your deployment approach (serverless or self-hosted)
2. Generate a secure CRON_SECRET
3. Configure your cron service
4. Test the endpoint with pending items
5. Monitor audit logs for successful publications
6. Set up monitoring and alerting
