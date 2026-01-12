import LeftSidebar from './_components/left-sidebar'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="bg-gray-50 flex w-full space-x-4 p-4 gap-4" style={{ maxHeight: 'calc(100vh - 64px)' }}>
      <div className="bg-white border w-80 rounded-xl flex flex-col m-0">
        <LeftSidebar />
      </div>
      {children}
    </div>
  )
}
