// Development Environment - 10.16.20.11 (測試機)
const path = require('path')

const HOST = '10.16.20.11'

module.exports = {
  apps: [
    {
      name: 'aiforce',
      script: path.join(__dirname, 'apps', 'aiforce', 'node_modules', 'next', 'dist', 'bin', 'next'),
      args: `start -H ${HOST} -p 3001`,
      cwd: path.join(__dirname, 'apps', 'aiforce'),
      interpreter: 'none',
      max_restarts: 3,
      min_uptime: '10s',
      restart_delay: 5000,
      watch: false,
      autorestart: true,
      windowsHide: true,
      env: {
        NODE_ENV: 'development',
        APP_ENV: 'development',
        PORT: 3001
      }
    },
    {
      name: 'product-spec',
      script: path.join(__dirname, 'apps', 'product-spec', 'node_modules', 'next', 'dist', 'bin', 'next'),
      args: `start -H ${HOST} -p 3012`,
      cwd: path.join(__dirname, 'apps', 'product-spec'),
      interpreter: 'none',
      max_restarts: 3,
      min_uptime: '10s',
      restart_delay: 5000,
      watch: false,
      autorestart: true,
      windowsHide: true,
      env: {
        NODE_ENV: 'development',
        APP_ENV: 'development',
        PORT: 3012
      }
    },
    {
      name: 'asr',
      script: path.join(__dirname, 'apps', 'asr', 'node_modules', 'next', 'dist', 'bin', 'next'),
      args: `start -H ${HOST} -p 3014`,
      cwd: path.join(__dirname, 'apps', 'asr'),
      interpreter: 'none',
      max_restarts: 3,
      min_uptime: '10s',
      restart_delay: 5000,
      watch: false,
      autorestart: true,
      windowsHide: true,
      env: {
        NODE_ENV: 'development',
        APP_ENV: 'development',
        PORT: 3014
      }
    }
  ]
}
