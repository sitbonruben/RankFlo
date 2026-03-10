/**
 * RankFlo PM2 Scheduler Configuration
 *
 * PM2 is a production process manager for Node.js that handles:
 * - Automatic restarts on crash
 * - Cron scheduling
 * - Log management
 * - Process monitoring
 *
 * Installation:
 *   npm install -g pm2
 *
 * Usage:
 *   # Start the scheduler
 *   pm2 start pm2.config.js
 *
 *   # Monitor
 *   pm2 monit
 *
 *   # View logs
 *   pm2 logs rankflo-scheduler
 *
 *   # Stop
 *   pm2 stop rankflo-scheduler
 *
 *   # Restart
 *   pm2 restart rankflo-scheduler
 *
 *   # Save PM2 state for auto-start on reboot
 *   pm2 save
 *   pm2 startup
 *
 *   # Remove from PM2
 *   pm2 delete rankflo-scheduler
 */

module.exports = {
  apps: [
    {
      // Application name
      name: 'rankflo-scheduler',

      // Script to run (use tsx loader for TypeScript)
      script: 'scripts/cron-publish.ts',

      // Node.js executable
      exec_interpreter: 'node',

      // Arguments to pass to Node.js (enable tsx loader)
      args: '--loader tsx/esm',

      // Execution mode
      exec_mode: 'fork',

      // Cron schedule - every 5 minutes
      // Format: minute hour day month day_of_week
      // 0 0 * * * = daily at midnight
      // 0 */4 * * * = every 4 hours
      // */5 * * * * = every 5 minutes (default, most common)
      // * * * * * = every minute (if you need real-time publishing)
      cron_time: '*/5 * * * *',

      // Environment variables
      env: {
        DATABASE_URL: 'postgresql://user:password@localhost:5432/rankflo',
        LOG_LEVEL: 'info',
        NODE_ENV: 'production',
      },

      // Log files
      error_file: '/var/log/rankflo-scheduler-error.log',
      out_file: '/var/log/rankflo-scheduler.log',

      // Log date format
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Maximum memory allowed
      max_memory_restart: '500M',

      // Restart delay in milliseconds
      listen_timeout: 3000,

      // Kill timeout (time to wait for graceful shutdown before killing)
      kill_timeout: 5000,

      // Number of instances (use 1 for cron jobs)
      instances: 1,

      // Watch files for changes (disable for production cron jobs)
      watch: false,

      // Ignore watching certain files
      ignore_watch: ['node_modules', 'logs', '.git'],

      // Min uptime before considering the app crashed
      min_uptime: '10s',

      // Max number of restarts in a window before giving up
      max_restarts: 10,

      // Window for counting restarts
      autorestart: true,
    },

    // Optional: Add a health check endpoint (separate app)
    // Uncomment if you want to run a lightweight health check service
    /*
    {
      name: 'rankflo-scheduler-health',
      script: 'scripts/health-check.ts',
      args: '--loader tsx/esm',
      exec_interpreter: 'node',
      exec_mode: 'fork',
      instances: 1,
      env: {
        DATABASE_URL: 'postgresql://user:password@localhost:5432/rankflo',
        PORT: '3001',
        NODE_ENV: 'production',
      },
      error_file: '/var/log/rankflo-health-error.log',
      out_file: '/var/log/rankflo-health.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
    },
    */
  ],

  // PM2+ (optional - requires PM2+ account)
  // pm2_home: '/path/to/pm2/home',

  // Merge logs (combine all logs into one file)
  // merge_logs: true,
};

/**
 * Common Cron Schedules:
 *
 * Every minute:           * * * * *
 * Every 5 minutes:        */5 * * * *
 * Every 15 minutes:       */15 * * * *
 * Every 30 minutes:       */30 * * * *
 * Every hour:             0 * * * *
 * Every 2 hours:          0 */2 * * *
 * Every 4 hours:          0 */4 * * *
 * Every 12 hours:         0 */12 * * *
 * Daily at midnight:      0 0 * * *
 * Daily at 3 AM:          0 3 * * *
 * Daily at noon:          0 12 * * *
 * Every Monday:           0 0 * * 1
 * Every weekday (Mon-Fri): 0 0 * * 1-5
 * First day of month:     0 0 1 * *
 *
 * Format: minute hour day month dayOfWeek
 * Range: 0-59 0-23 1-31 1-12 0-6 (0 and 7 are Sunday)
 */

/**
 * Environment Variable Tips:
 *
 * 1. Security:
 *    - Store DATABASE_URL and secrets in environment
 *    - Never commit real credentials to git
 *    - Use separate credentials for dev/prod
 *
 * 2. Database:
 *    - PostgreSQL: postgresql://user:pass@host:5432/db
 *    - With socket: postgresql:///dbname?host=/var/run/postgresql
 *
 * 3. Logging:
 *    - debug: Very verbose, shows all database queries
 *    - info: Normal logging, shows what's happening
 *    - warn: Only warnings and errors
 *    - error: Only errors
 *
 * 4. Log Management:
 *    - Logs rotate automatically in PM2
 *    - View logs: pm2 logs rankflo-scheduler
 *    - Clear logs: pm2 flush
 */

/**
 * Systemd Integration (for auto-start on reboot):
 *
 * 1. Save PM2 state:
 *    pm2 save
 *
 * 2. Install startup hook:
 *    pm2 startup
 *
 * 3. Verify:
 *    pm2 startup -u your_username --hp /home/your_username
 *    sudo pm2 startup systemd -u your_username --hp /home/your_username
 *
 * 4. Check systemd status:
 *    systemctl status pm2-your_username
 */

/**
 * Monitoring and Alerting:
 *
 * View real-time metrics:
 *   pm2 monit
 *
 * Watch for errors:
 *   tail -f /var/log/rankflo-scheduler-error.log
 *
 * Monitor database connection:
 *   # Add a health check script that monitors database connectivity
 *
 * Set up alerts:
 *   - Monitor PM2 via PM2+ (pm2.io)
 *   - Configure email alerts for restarts/crashes
 *   - Use external monitoring (New Relic, DataDog, etc.)
 */
