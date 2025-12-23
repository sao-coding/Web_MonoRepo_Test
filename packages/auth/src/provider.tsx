"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useAuthAdapter } from "./auth-adapter";
import { useAuthLogger, type LogConfig } from "./auth-logger";
import {
  type AuthStatus,
  type LoginCredentials,
  useAuth as useAuthSource,
  type UseAuthReturn,
  type User,
} from "./use-auth";

// Re-export types
export type { AuthStatus, LoginCredentials, LogConfig, UseAuthReturn, User };

const AuthContext = createContext<UseAuthReturn | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
  logConfig?: LogConfig;
}

/**
 * AuthProvider - 提供認證上下文
 */
export function AuthProvider({ children, logConfig }: AuthProviderProps) {
  const auth = useAuthSource();

  // 路由守衛
  useAuthAdapter(auth);

  // 日誌記錄
  useAuthLogger(auth.user, auth.status, logConfig);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth - 獲取認證上下文
 */
export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
