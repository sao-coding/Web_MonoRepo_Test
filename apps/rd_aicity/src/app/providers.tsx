'use client'

import { AuthProvider } from '@msi/auth'
import { getAppConfig } from '@msi/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'

import { I18nProvider } from '@/lib/i18n'

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = React.useState(() => new QueryClient())
  const config = React.useMemo(() => getAppConfig(), [])

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider
          logConfig={{ webSystem: 'rdraid5', subSystem: 'AI_City', title: 'AI City' }}
          loginApiUrl={config.NEXT_PUBLIC_LOGIN_API_URL}
        >
          {children}
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  )
}

export default Providers
