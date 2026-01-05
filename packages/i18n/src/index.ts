/**
 * @msi/i18n - 共用國際化套件
 *
 * 提供即時語系切換功能，無需頁面重整
 */

// 設定常數
export type { Locale } from './config'
export {
  defaultLocale,
  LOCALE_COOKIE_NAME,
  localeNames,
  locales,
} from './config'

// Provider 和 Hooks
export { I18nProvider, useI18n } from './provider'

// Re-export next-intl hooks
export { useLocale, useMessages, useTranslations } from 'next-intl'
