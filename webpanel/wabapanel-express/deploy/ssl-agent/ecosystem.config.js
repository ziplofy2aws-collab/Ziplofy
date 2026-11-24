// PM2 process for the SSL provisioning worker — runs ON the storefront
// gateway (nginx + certbot host), not the API server.
//   pm2 start deploy/ssl-agent/ecosystem.config.js
//   pm2 save && pm2 startup
module.exports = {
  apps: [
    {
      name: 'webpanel-ssl-worker',
      script: 'src/ssl/worker.js',
      cwd: '/home/ubuntu/Ziplofy/webpanel/wabapanel-express',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 20,
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
