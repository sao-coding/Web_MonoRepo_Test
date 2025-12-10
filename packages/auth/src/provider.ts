import {
  createContext,
  createElement,
  useContext,
  type ReactElement,
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
 * 內部 Provider 組件 - 整合認證邏輯、路由守衛和日誌記錄
 */
function AuthProviderInternal({ children, logConfig }: AuthProviderProps) {
  const auth = useAuthSource();

  // 路由守衛
  useAuthAdapter(auth);

  // 日誌記錄
  useAuthLogger(auth.user, auth.status, logConfig);

  return createElement(AuthContext.Provider, { value: auth }, children);
}

/**
 * AuthProvider - 提供認證上下文
 *
 * @example
 * ```tsx
 * <AuthProvider logConfig={{ webSystem: "app", subSystem: "main", title: "App" }}>
 *   <YourApp />
 * </AuthProvider>
 * ```
 */
export function AuthProvider(props: AuthProviderProps): ReactElement {
  return createElement(AuthProviderInternal, props);
}

/**
 * useAuth - 獲取認證上下文
 *
 * @throws {Error} 如果在 AuthProvider 外部使用
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 * ```
 */
export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
