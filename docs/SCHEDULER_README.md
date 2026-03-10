# RankFlo Scheduler

Automatic publishing of scheduled posts and social posts when their scheduled time arrives.

## Overview

RankFlo Scheduler automatically publishes:
- **Blog Posts** with `status = "SCHEDULED"` when `scheduledAt <= now()`
- **Social Posts** with `status = "SCHEDULED"` when `scheduledAt <= now()`

It also logs all publications to the audit trail for compliance and visibility.

## Quick Start

### 1. Get Started Immediately (5 minutes)

See [SCHEDULER_QUICKSTART.md](./SCHEDULER_QUICKSTART.md) for fastest setup.

### 2. Detailed Setup (15 minutes)

See [SCHEDULER.md](./SCHEDULER.md) for comprehensive documentation.

### 3. Deployment Checklist

See [SCHEDULER_DEPLOYMENT.md](./SCHEDULER_DEPLOYMENT.md) for production setup.

## Files Overview

### Core Implementation

```
packages/api/src/services/scheduler.ts
├── publishScheduledContent()      - Main scheduler logic
├── getPendingScheduledCount()     - Check pending items
└── getUpcomingScheduled()         - Preview upcoming items

apps/web/src/app/api/cron/publish/route.ts
├── POST /api/cron/publish        - Trigger scheduler (secured)
└── GET /api/cron/publish         - Health check endpoint

scripts/cron-publish.ts
└── Standalone Node.js script for self-hosted deployments
```

### Documentation

```
docs/
├── SCHEDULER.md                  - Complete documentation
├── SCHEDULER_QUICKSTART.md       - 5-minute quick start
├── SCHEDULER_DEPLOYMENT.md       - Deployment checklist
├── systemd-scheduler.service.example
├── systemd-scheduler.timer.example
└── SCHEDULER_README.md           - This file

.env.scheduler.example            - Environment variables
pm2.config.example.js             - PM2 configuration
```

### Testing & Utilities

```
scripts/
├── cron-publish.ts              - Standalone scheduler script
└── test-scheduler.ts            - Testing & debugging utility
```

## Deployment Options

Choose based on your hosting:

### Serverless (Vercel, Netlify, AWS Lambda)
- Use API route: `/api/cron/publish`
- Secured with `CRON_SECRET` token
- Call from external cron service
- See: SCHEDULER_QUICKSTART.md → Option A

### Self-Hosted (Docker, VPS, On-Premise)
- Use standalone script: `scripts/cron-publish.ts`
- Run via system cron, PM2, or systemd
- See: SCHEDULER_QUICKSTART.md → Option B

## Common Tasks

### Create Scheduled Post

```sql
UPDATE posts
SET status = 'SCHEDULED',
    scheduled_at = NOW() + interval '1 hour'
WHERE id = 'your_post_id';
```

### Check Pending Items

```bash
# Serverless
curl -X GET https://your-domain.com/api/cron/publish \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Self-hosted
pnpm cron:publish  # (will show summary at end)
```

### Test Without Making Changes

```bash
DRY_RUN=true pnpm cron:publish
```

### View Published History

```sql
SELECT * FROM audit_logs
WHERE action IN ('post.auto_published', 'social_post.auto_published')
ORDER BY timestamp DESC
LIMIT 20;
```

### Create Test Data

```bash
# Create test posts
ts-node scripts/test-scheduler.ts test-post
ts-node scripts/test-scheduler.ts test-social

# Publish them
ts-node scripts/test-scheduler.ts publish

# Clean up
ts-node scripts/test-scheduler.ts cleanup
```

## Configuration

### Required

| Variable | Use | Example |
|----------|-----|---------|
| `DATABASE_URL` | Database connection | `postgresql://user:pass@localhost/rankflo` |
| `CRON_SECRET` | API authentication (serverless only) | Generated token (32+ chars) |

### Optional

| Variable | Default | Options |
|----------|---------|---------|
| `LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error` |
| `DRY_RUN` | `false` | `true` or `false` |
| `NODE_ENV` | `development` | `development`, `production` |

## Monitoring

### Health Check

```bash
# Serverless
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-domain.com/api/cron/publish

# Self-hosted
# Check PM2 status: pm2 status rankflo-scheduler
# Check systemd: systemctl status rankflo-scheduler.timer
```

### View Logs

```bash
# API route (Next.js logs)
pnpm dev

# Standalone script
tail -f /var/log/rankflo-scheduler.log

# PM2
pm2 logs rankflo-scheduler

# Systemd
journalctl -u rankflo-scheduler -f
```

### Database Monitoring

```sql
-- Check pending
SELECT COUNT(*) FROM posts WHERE status = 'SCHEDULED' AND scheduled_at <= NOW();

-- Check recent publications
SELECT * FROM audit_logs
WHERE action LIKE '%auto_published%'
ORDER BY timestamp DESC
LIMIT 10;
```

## Troubleshooting

### Nothing is Publishing

1. **Check for pending items:**
   ```sql
   SELECT COUNT(*) FROM posts
   WHERE status = 'SCHEDULED' AND scheduled_at <= NOW();
   ```

2. **Check logs:**
   ```bash
   LOG_LEVEL=debug pnpm cron:publish  # Self-hosted
   # Or check /api/cron/publish endpoint logs for serverless
   ```

3. **Verify database:**
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

### Authorization Errors (Serverless)

1. Verify `CRON_SECRET` is set
2. Check token matches in cron service
3. Try curl test:
   ```bash
   curl -v https://your-domain.com/api/cron/publish \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Cron Job Not Running

**PM2:**
```bash
pm2 status rankflo-scheduler
pm2 restart rankflo-scheduler
```

**Systemd:**
```bash
systemctl status rankflo-scheduler.timer
journalctl -u rankflo-scheduler -n 50
```

**System Cron:**
```bash
crontab -l              # View your crons
tail -f /var/log/syslog | grep CRON  # Check logs
```

## Performance

### Recommended Schedules

- **Real-time publishing:** Every 1 minute
- **Standard:** Every 5 minutes (default)
- **Low traffic:** Every 15-30 minutes
- **Light load:** Every hour

### Database Impact

- Each run: ~2-3 database queries
- Minimal indexes already present
- Scales well to 1000s of scheduled items

## Security

### Best Practices

1. Generate strong CRON_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Rotate token quarterly
3. Use environment variables for secrets
4. Don't commit CRON_SECRET to git
5. Monitor API access logs

### Database Access

- Only executes published INSERT/UPDATE operations
- Never deletes posts
- Logs all changes to audit_logs table
- User isolation via organizationId

## Architecture

### Data Flow

```
Scheduled Item in Database
          ↓
Scheduler checks every N minutes
          ↓
If scheduledAt <= now() :
  - Update status to PUBLISHED
  - Set publishedAt = now()
  - Log to audit_logs
          ↓
Content is now live
```

### Models

**Posts**
- `status: SCHEDULED` + `scheduledAt <= now()` → `PUBLISHED`
- `publishedAt` set to current time
- Maintains all other fields

**SocialPosts**
- `status: SCHEDULED` + `scheduledAt <= now()` → `PUBLISHED`
- `publishedAt` set to current time
- Note: Actual social platform posting requires integration (TODO in code)

## Integration Points

### Audit Trail

All publications logged with:
- Action: `post.auto_published` or `social_post.auto_published`
- Entity ID and type
- Timestamp
- Organization ID
- Metadata (scheduled time, etc.)

### Webhooks

Future enhancement - currently not triggered on auto-publish.

### Social Platform APIs

Placeholder for real platform integration:
- Twitter/X
- LinkedIn
- Facebook
- Instagram
- Threads
- Bluesky
- Mastodon

## Next Steps

1. **Choose deployment:** Serverless or Self-Hosted
2. **Follow quickstart:** [SCHEDULER_QUICKSTART.md](./SCHEDULER_QUICKSTART.md)
3. **Test it:** Create test posts and verify publishing
4. **Deploy to production:** Follow [SCHEDULER_DEPLOYMENT.md](./SCHEDULER_DEPLOYMENT.md)
5. **Monitor:** Set up logging and alerting
6. **Iterate:** Optimize schedule and settings

## Support

### Documentation

- [Quick Start](./SCHEDULER_QUICKSTART.md) - 5 min setup
- [Full Docs](./SCHEDULER.md) - Complete reference
- [Deployment](./SCHEDULER_DEPLOYMENT.md) - Production checklist

### Testing

```bash
# Test utility
ts-node scripts/test-scheduler.ts help
```

### Debugging

```bash
# Enable debug logging
LOG_LEVEL=debug pnpm cron:publish

# Dry run (no changes)
DRY_RUN=true pnpm cron:publish
```

## FAQ

**Q: How often should I run the scheduler?**
A: Every 5 minutes is standard. Every 1 minute for real-time needs, every 15-30 minutes for low traffic.

**Q: What if scheduler crashes?**
A: Posts won't publish until fixed. Review logs and restart. Consider PM2 for auto-restart.

**Q: Does it work with multiple organizations?**
A: Yes - automatically handles org isolation via organizationId.

**Q: Can I schedule posts months in advance?**
A: Yes - scheduler only publishes when time arrives.

**Q: What about timezone?**
A: Scheduler uses database server timezone. Ensure consistent timezone across system.

**Q: Can I undo a published post?**
A: No - scheduler marks as PUBLISHED. Unpublish via UI if needed.

## License

Part of RankFlo - see LICENSE file for details.
