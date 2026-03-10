# RankFlo Scheduler - Quick Start Guide

Get your content scheduler running in 5 minutes.

## Choose Your Setup

### Option A: Serverless (Recommended for Vercel/Netlify)

1. **Generate a secret token:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Save this somewhere safe!

2. **Add to your environment:**
   ```bash
   # For Vercel
   vercel env add CRON_SECRET
   # Paste your generated token

   # Or add to .env.local
   echo "CRON_SECRET=your_token_here" >> .env.local
   ```

3. **Deploy and test:**
   ```bash
   pnpm build
   pnpm start

   # In another terminal, test the endpoint
   curl -X GET http://localhost:3000/api/cron/publish \
     -H "Authorization: Bearer your_token_here"
   ```

4. **Set up external cron (choose one):**

   **GitHub Actions (Free)**
   ```yaml
   # .github/workflows/scheduler.yml
   name: RankFlo Scheduler
   on:
     schedule:
       - cron: '*/5 * * * *'
   jobs:
     publish:
       runs-on: ubuntu-latest
       steps:
         - run: |
             curl -X POST https://your-domain.com/api/cron/publish \
               -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
   ```

   **cron-job.org (Free)**
   - Visit https://cron-job.org/
   - Create new job
   - URL: `https://your-domain.com/api/cron/publish`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_TOKEN`
   - Schedule: Every 5 minutes

### Option B: Self-Hosted (Docker/Linux/VPS)

1. **Add to package.json:**
   ```json
   {
     "scripts": {
       "cron:publish": "ts-node scripts/cron-publish.ts"
     }
   }
   ```

2. **Quick test:**
   ```bash
   pnpm cron:publish
   ```

3. **Set up scheduler (choose one):**

   **System Cron (simplest)**
   ```bash
   crontab -e
   # Add this line:
   */5 * * * * cd /path/to/rankflo && pnpm cron:publish
   ```

   **PM2 (production-grade)**
   ```bash
   npm install -g pm2

   # Create pm2.config.js
   cat > pm2.config.js << 'EOF'
   module.exports = {
     apps: [{
       name: 'rankflo-scheduler',
       script: 'scripts/cron-publish.ts',
       exec_interpreter: 'node',
       args: '--loader tsx/esm',
       cron_time: '*/5 * * * *',
       env: {
         DATABASE_URL: 'postgresql://...',
         LOG_LEVEL: 'info'
       }
     }]
   };
   EOF

   # Start it
   pm2 start pm2.config.js
   pm2 logs rankflo-scheduler
   ```

## Verify It's Working

```bash
# Check for pending items
curl -X GET https://your-domain.com/api/cron/publish \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response should show pending count:
# {
#   "success": true,
#   "data": {
#     "pendingPostsCount": 0,
#     "pendingSocialPostsCount": 0,
#     "totalPending": 0
#   }
# }
```

## Test With a Scheduled Post

1. **Create a post scheduled for 1 minute ago:**
   ```sql
   UPDATE posts
   SET status = 'SCHEDULED',
       scheduled_at = NOW() - interval '1 minute'
   WHERE id = 'your_post_id';
   ```

2. **Run the scheduler:**
   ```bash
   # Serverless
   curl -X POST https://your-domain.com/api/cron/publish \
     -H "Authorization: Bearer YOUR_TOKEN"

   # Self-hosted
   pnpm cron:publish
   ```

3. **Check if published:**
   ```sql
   SELECT status, published_at FROM posts WHERE id = 'your_post_id';
   -- Should show status = 'PUBLISHED' with recent published_at
   ```

## Troubleshooting

**401 Unauthorized?**
- Check your CRON_SECRET is correct
- Verify it's in the Authorization header as `Bearer YOUR_TOKEN`

**No posts publishing?**
- Run: `SELECT COUNT(*) FROM posts WHERE status = 'SCHEDULED' AND scheduled_at <= NOW();`
- Should show pending posts

**Script error?**
- Check database connection: `echo $DATABASE_URL`
- Check logs: `LOG_LEVEL=debug pnpm cron:publish`

## Full Documentation

See `/docs/SCHEDULER.md` for complete documentation including:
- Database schema details
- All configuration options
- Monitoring and alerting
- Performance tuning
- Platform-specific setup guides

## Support

Stuck? Try:
1. Check the error message in logs
2. Run with `LOG_LEVEL=debug` to see details
3. Try test mode: `DRY_RUN=true pnpm cron:publish`
4. Review full docs at `/docs/SCHEDULER.md`
