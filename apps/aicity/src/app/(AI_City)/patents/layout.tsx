import LeftSidebar from './_components/left-sidebar'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-[100vh]">
      <div className="flex-1 flex overflow-hidden h-screen">
        <LeftSidebar />
        {children}
      </div>
    </div>
  )
}
