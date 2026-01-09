"use client";

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
    // 檢查是否在登入頁 (相容不同 basePath)
    const isLoginPage = pathname === "/login" || pathname.endsWith("/login");

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
      // 使用 window.location 導向到 rd_aicity 的登入頁，避免 basePath 問題
      const { protocol, hostname, port } = window.location;
      // 保留當前 port（Docker 環境可能是 8080，PM2 可能是 3000）
      const portSuffix = port ? `:${port}` : '';
      window.location.href = `${protocol}//${hostname}${portSuffix}/AI_City/login`;
    }
  }, [pathname, router, status, isAuthenticated, logout]);
}
