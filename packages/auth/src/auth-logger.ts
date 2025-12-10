import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { type AuthStatus, type User } from "./use-auth";

export interface LogConfig {
  webSystem: string;
  subSystem: string;
  title: string;
}

/**
 * 認證日誌 Hook - 處理頁面訪問日誌記錄
 */
export function useAuthLogger(
  user: User | null,
  status: AuthStatus,
  logConfig?: LogConfig
) {
  const pathname = usePathname();

  useEffect(() => {
    // 避免在認證狀態不穩定時執行
    if (status === "initializing" || status === "loading" || !logConfig) {
      return;
    }

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
}
