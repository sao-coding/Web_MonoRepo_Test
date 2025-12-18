'use client'

import { AuthProvider } from '@msi/auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider logConfig={{ webSystem: 'rdraid5', subSystem: 'AI_City' }}>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default Providers
