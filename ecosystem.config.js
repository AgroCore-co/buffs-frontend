module.exports = {
  apps: [
    {
      name: 'buffs-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/root/buffs-frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
