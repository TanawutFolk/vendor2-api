const fs = require('fs')
const path = require('path')

// Log folder lives next to this file. Created here (not by hand on the server)
// because WinSCP does not upload empty folders, and PM2 fails to boot with
// ENOENT if out_file/error_file point into a folder that does not exist.
const LOG_DIR = path.join(__dirname, 'logs')
fs.mkdirSync(LOG_DIR, { recursive: true })

module.exports = {
  apps: [
    {
      name: 'master-data-system-new-template-web-api-7035-expressjs',
      script: 'npm',
      args: 'run start:dev',

      // src/config/env.ts reads './.env' relative to cwd, so cwd must be pinned
      // to the project root or the app throws ".env file not found" after a
      // `pm2 restart` issued from another directory.
      cwd: __dirname,

      env: {
        NODE_ENV: 'development',
      },

      // * Logs -> ./logs/*.txt
      out_file: path.join(LOG_DIR, 'out.txt'),
      error_file: path.join(LOG_DIR, 'error.txt'),
      merge_logs: true,
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // * Crash-loop guards: stop after 5 failed boots instead of burning
      // through the default 15, so the real stack trace stays near the tail
      // of error.txt instead of being buried under repeated restarts.
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s',
      restart_delay: 3000,
    },
  ],
}
