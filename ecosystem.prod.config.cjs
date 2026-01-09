// Production Environment - 10.16.20.36 (正式機)
const path = require('path')

const HOST = '10.16.20.36'

module.exports = {
  apps: [
    {
      name: 'rd-aicity',
      script: path.join(__dirname, 'apps', 'rd_aicity', 'node_modules', 'next', 'dist', 'bin', 'next'),
      args: `start -H ${HOST} -p 3001`,
      cwd: path.join(__dirname, 'apps', 'rd_aicity'),
      interpreter: 'none',
      max_restarts: 3,
      min_uptime: '10s',
      restart_delay: 5000,
      watch: false,
      autorestart: true,
      windowsHide: true,
      env: {
        NODE_ENV: 'production',
        APP_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'product-spec',
      script: path.join(__dirname, 'apps', 'product-spec', 'node_modules', 'next', 'dist', 'bin', 'next'),
      args: `start -H ${HOST} -p 3002`,
      cwd: path.join(__dirname, 'apps', 'product-spec'),
      interpreter: 'none',
      max_restarts: 3,
      min_uptime: '10s',
      restart_delay: 5000,
      watch: false,
      autorestart: true,
      windowsHide: true,
      env: {
        NODE_ENV: 'production',
        APP_ENV: 'production',
        PORT: 3002
      }
    },
    {
      name: 'asr',
      script: path.join(__dirname, 'apps', 'asr', 'node_modules', 'next', 'dist', 'bin', 'next'),
      args: `start -H ${HOST} -p 3003`,
      cwd: path.join(__dirname, 'apps', 'asr'),
      interpreter: 'none',
      max_restarts: 3,
      min_uptime: '10s',
      restart_delay: 5000,
      watch: false,
      autorestart: true,
      windowsHide: true,
      env: {
        NODE_ENV: 'production',
        APP_ENV: 'production',
        PORT: 3003
      }
    }
  ]
}
