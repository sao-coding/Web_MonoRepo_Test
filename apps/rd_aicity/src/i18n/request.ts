import type { Locale } from '@msi/i18n/config'
import { defaultLocale, LOCALE_COOKIE_NAME, locales } from '@msi/i18n/config'
import { getRequestConfig } from 'next-intl/server'

import { cookies } from 'next/headers'

/**
 * next-intl Server 端設定
 * 從 cookie 讀取語系偏好，無 URL routing
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value

  // 驗證語系是否有效，無效則使用預設值
  const locale: Locale = cookieLocale && locales.includes(cookieLocale as Locale)
    ? (cookieLocale as Locale)
    : defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
