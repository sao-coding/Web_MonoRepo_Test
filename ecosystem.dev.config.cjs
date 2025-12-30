module.exports = {
  apps: [
    {
      name: 'rd-aicity-dev',  // 名稱加上 -dev 以示區別
      script: 'C:\\Windows\\System32\\cmd.exe',
      args: '/c pnpm run pm2:dev:aicity',
      interpreter: 'none',
      env: {
        NODE_ENV: 'development',
        PORT: 3001 // 指定開發環境的 Port，避免與預設 3000 衝突
      }
    },
    {
      name: 'product-spec-dev',
      script: 'C:\\Windows\\System32\\cmd.exe',
      args: '/c pnpm run pm2:dev:product',
      interpreter: 'none',
      env: {
        NODE_ENV: 'development',
        PORT: 3002
      }
    }
  ]
}
