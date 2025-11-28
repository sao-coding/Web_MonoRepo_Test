import '@msi/ui/globals.css'

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='zh-Hant-TW'>
      <body>{children}</body>
    </html>
  )
}
