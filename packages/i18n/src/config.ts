/**
 * i18n 共用設定常數
 * 定義支援的語系、預設語系、cookie 名稱等
 */

export type Locale = 'zh-TW' | 'en'

export const locales: Locale[] = ['zh-TW', 'en']
export const defaultLocale: Locale = 'zh-TW'
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE'

/**
 * 語系顯示名稱對照表
 */
export const localeNames: Record<Locale, string> = {
  'zh-TW': '繁體中文',
  'en': 'English',
}
