import {
  createContext,
  type ReactNode,
  use
} from 'react'

import { type AuthAdapterOptions, useAuthAdapter } from './auth-adapter'
import { type LogConfig, useAuthLogger } from './auth-logger'
import AuthMonitor from './auth-monitor'
import {
  type AuthStatus,
  type LoginCredentials,
  type LoginResponse,
  useAuth as useAuthSource,
  type UseAuthReturn,
  type User
} from './use-auth'

// Re-export types
export type { AuthStatus, LogConfig, LoginCredentials, LoginResponse, UseAuthReturn, User }

const AuthContext = createContext<UseAuthReturn | null>(null)
AuthContext.displayName = 'AuthContext'

export interface AuthProviderProps {
  children: ReactNode;
  logConfig?: LogConfig;
  loginApiUrl?: string;
  authAdapterOptions?: AuthAdapterOptions;
}

/**
 * AuthProvider - 提供認證上下文
 */
export function AuthProvider({ children, logConfig, loginApiUrl, authAdapterOptions }: AuthProviderProps) {
  const auth = useAuthSource({ loginApiUrl })

  useAuthAdapter(auth, authAdapterOptions)
  useAuthLogger(auth.user, auth.status, logConfig)

  return (
    <AuthContext value={auth}>
      {children}
      {authAdapterOptions?.debug?.enable && (
        <AuthMonitor auth={auth} />
      )}
    </AuthContext>
  )
}

/**
 * useAuth - 獲取認證上下文
 */
export function useAuth(): UseAuthReturn {
  const context = use(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
