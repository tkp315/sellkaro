module.exports = {
  apps: [
    {
      name: 'olx-server',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env_production: {
        NODE_ENV: 'prod',
      },
      error_file: '/home/ubuntu/.pm2/logs/olx-server-error.log',
      out_file: '/home/ubuntu/.pm2/logs/olx-server-out.log',
      merge_logs: true,
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
