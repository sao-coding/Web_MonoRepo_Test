import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { type UseAuthReturn } from "./use-auth";

/**
 * 認證適配器 Hook - 處理路由守衛邏輯
 */
export function useAuthAdapter(auth: UseAuthReturn) {
  const { status, isAuthenticated, logout } = auth;
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isLoginPage = pathname === "/login";

    // 等待認證初始化完成
    if (status === "initializing") return;

    // 登入頁面：已認證則重定向到首頁
    if (isLoginPage) {
      if (isAuthenticated) {
        router.replace("/");
      }
      return;
    }

    // 非登入頁面：未認證則重定向到登入頁
    if (!isAuthenticated) {
      // 認證失敗時清除 token
      if (status === "error") {
        logout();
      }
      router.replace("/login");
    }
  }, [pathname, router, status, isAuthenticated, logout]);
}
