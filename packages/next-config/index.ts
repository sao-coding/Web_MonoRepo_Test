import type { NextConfig } from "next";

/**
 * 基礎設定：所有專案都會繼承這些
 */
const baseConfig: NextConfig = {
  // 核心：開啟 Standalone 模式 (對 Docker 部署最重要)
  output: "standalone",

  // 嚴格模式，有助於抓出 React 問題
  reactStrictMode: true,

  // 減少打包後的 Source Map 產生 (選用，可加速 Build 並節省空間)
  productionBrowserSourceMaps: false,

  // 圖片優化預設設定 (視需求調整)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // 允許所有來源 (開發方便)，正式環境建議縮限
      },
    ],
  },

  // 安全性 Headers (選用)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

/**
 * 合併設定的工具函式
 * @param appConfig個別 App 的特殊設定
 */
export const withMsiConfig = (appConfig: NextConfig = {}): NextConfig => {
  // 深層合併邏輯可根據需求擴充，這裡做淺層合併
  // 注意：如果是 plugins (如 withBundleAnalyzer)，通常會包在最外層
  const finalConfig: NextConfig = {
    ...baseConfig,
    ...appConfig,
    // 如果 appConfig 也有 images，這裡需要小心處理，避免直接覆蓋 baseConfig 的 images 物件
    images: {
      ...baseConfig.images,
      ...appConfig.images,
    },
  };

  return finalConfig;
};
