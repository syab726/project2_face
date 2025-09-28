module.exports = {
  apps: [
    {
      name: 'face_wisdom_qa',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/face_wisdom_qa',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      log_file: '/var/log/pm2/face_wisdom_qa.log',
      out_file: '/var/log/pm2/face_wisdom_qa.out.log',
      error_file: '/var/log/pm2/face_wisdom_qa.error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'webhook_qa',
      script: 'webhook-qa.js',
      cwd: '/var/www/face_wisdom_qa',
      env: {
        NODE_ENV: 'production',
        GITHUB_WEBHOOK_SECRET_QA: 'your-qa-webhook-secret'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '256M',
      log_file: '/var/log/pm2/webhook_qa.log',
      out_file: '/var/log/pm2/webhook_qa.out.log',
      error_file: '/var/log/pm2/webhook_qa.error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};