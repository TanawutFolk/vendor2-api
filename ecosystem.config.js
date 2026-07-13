module.exports = {
  apps: [
    {
      name: 'master-data-system-new-template-web-api-7035-expressjs',
      script: 'npm',
      args: 'run start:dev',
      env: {
        NODE_ENV: 'develpoment',
      },
      out_file: '/dev/null', // Prevent output logs
      error_file: '/dev/null', // Prevent error logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss', // Optional: Disable timestamps
    },
  ],
}
