'use client'

import { AuthProvider } from '@msi/auth'
import { getAppConfig } from '@msi/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = React.useState(() => new QueryClient())
  const config = React.useMemo(() => getAppConfig(), [])

  // authAdapterOptions={
  //   {
  //     debug: {
  //       enable: true,
  //       skipAuthGuard: true,
  //     },
  //   }
  // }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider
        logConfig={{ webSystem: 'rdraid5', subSystem: 'AI_City', title: 'AI City' }}
        loginApiUrl={config.NEXT_PUBLIC_LOGIN_API_URL}
      >
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default Providers
