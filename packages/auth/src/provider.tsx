"use client";

import Cookies from "js-cookie";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { createContext, useContext, useEffect } from "react";
import {
  AuthStatus,
  LoginCredentials,
  useAuth as useAuthSource,
  UseAuthReturn,
  User,
} from "./use-auth";

export type { AuthStatus, LoginCredentials, UseAuthReturn, User };

const AuthContext = createContext<UseAuthReturn | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  logConfig?: {
    webSystem: string;
    subSystem: string;
    title: string;
  };
}

export const AuthProvider = ({ children, logConfig }: AuthProviderProps) => {
  const auth = useAuthSource();
  const { user, status, isAuthenticated, logout } = auth;

  const pathname = usePathname();
  const router = useRouter();

  // 認證檢查邏輯
  useEffect(() => {
    const checkAuthentication = () => {
      const isLoginPage = pathname === "/login";

      // 等待認證初始化完成
      if (status === "initializing") return;

      // 登入頁面處理
      if (isLoginPage) {
        if (isAuthenticated) {
          router.replace("/");
        }
        return;
      }

      // 其他頁面需要驗證
      if (!isAuthenticated) {
        // 如果認證失敗，確保清除 token 並導向登入頁
        if (status === "error") {
          logout();
        }
        router.replace("/login");
      }
    };

    checkAuthentication();
  }, [pathname, router, status, isAuthenticated, logout]);

  // log 紀錄
  useEffect(() => {
    // 避免在認證狀態不穩定時執行
    if (status === "initializing" || status === "loading" || !logConfig) return;

    const writeLog = async () => {
      const logData = {
        ...logConfig,
        url: `${process.env.NEXT_PUBLIC_BASE_PATH_URL}${pathname}`,
      };

      try {
        await fetch(`${process.env.NEXT_PUBLIC_LOGIN_API_URL}/api/logs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
          body: JSON.stringify(logData),
        });
      } catch (error) {
        console.error("Failed to write log:", error);
      }
    };
    writeLog();
  }, [pathname, user, status, logConfig]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
