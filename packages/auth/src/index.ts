// @msi/auth - 主要導出
// 注意：provider.ts 和 use-auth.ts 都有 useAuth，
// 但 provider.ts 的 useAuth 是基於 context 的（需要 AuthProvider 包裹）
// use-auth.ts 的 useAuth 是獨立的 hook（不需要 Provider）

// 只導出 provider.ts 的內容（包含 AuthProvider 和 context-based useAuth）
export { AuthProvider, useAuth } from "./provider";
export type {
  AuthProviderProps,
  AuthStatus,
  LoginCredentials,
  LoginResponse,
  LogConfig,
  UseAuthReturn,
  User,
} from "./provider";

// 可選：導出其他輔助模組
export { useAuthAdapter } from "./auth-adapter";
export { useAuthLogger } from "./auth-logger";
