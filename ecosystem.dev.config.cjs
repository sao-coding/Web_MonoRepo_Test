// Development Environment - 10.16.20.11 (測試機)
const path = require('path')

const HOST = '10.16.20.11'

module.exports = {
  apps: [
    {
      name: 'rd-aicity',
      script: 'node_modules/next/dist/bin/next',
      args: `start -H ${HOST} -p 3001`,
      cwd: path.join(__dirname, 'apps', 'rd_aicity'),
      max_restarts: 3,
      min_uptime: '10s',
      restart_delay: 5000,
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: 'development',
        APP_ENV: 'development',
        PORT: 3001
      }
    },
    {
      name: 'product-spec',
      script: 'node_modules/next/dist/bin/next',
      args: `start -H ${HOST} -p 3002`,
      cwd: path.join(__dirname, 'apps', 'product-spec'),
      max_restarts: 3,
      min_uptime: '10s',
      restart_delay: 5000,
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: 'development',
        APP_ENV: 'development',
        PORT: 3002
      }
    }
  ]
}
