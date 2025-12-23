module.exports = {
  apps: [
    {
      name: 'rd-aicity',
      // 1. 指定執行 Windows 的命令提示字元
      script: 'C:\\Windows\\System32\\cmd.exe',
      // 2. 使用 /c 參數來執行指令 (請確保 package.json 裡有設定 pm2:aicity)
      args: '/c pnpm run pm2:aicity',
      // 3. 關鍵：告訴 PM2 不要用 Node 去解析這個 script
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
    },
    {
      name: 'product-spec',
      script: 'C:\\Windows\\System32\\cmd.exe',
      args: '/c pnpm run pm2:product',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
    },
  ],
}
