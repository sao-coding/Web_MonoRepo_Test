/**
 * AI Forum 跨網域登入工具
 *
 * 使用 Form POST 方式將認證資訊傳遞到 AI Forum
 * 因為瀏覽器同源政策限制，無法直接讀取跨網域的 LocalStorage
 */

// 可透過環境變數設定，預設為正式環境
const AI_FORUM_AUTH_URL = process.env.NEXT_PUBLIC_AI_FORUM_AUTH_URL || 'https://aiforum.msi.com.tw/auth'

export interface ForumAuthParams {
  token: string
  username: string
  region: string
}

/**
 * 從 localStorage 獲取認證資訊
 */
export const getForumAuthParams = (): ForumAuthParams | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const token = localStorage.getItem('AIforce_token')
  const username = localStorage.getItem('AIforce_username')
  const region = localStorage.getItem('AIforce_region')

  if (!token || !username || !region) {
    return null
  }

  return { token, username, region }
}

/**
 * 重導向到 AI Forum 並自動登入
 *
 * 使用 Form POST 方式傳遞認證資訊：
 * 1. 建立隱藏表單
 * 2. 填入認證參數
 * 3. 提交表單到 AI Forum
 * 4. 清理表單
 */
export const redirectToForum = (): boolean => {
  const authParams = getForumAuthParams()

  if (!authParams) {
    console.error('[Forum Redirect] 缺少認證信息，無法跳轉到 AI Forum')
    return false
  }

  // 建立表單
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = AI_FORUM_AUTH_URL
  form.target = '_blank'
  form.style.display = 'none'

  // 填入參數
  const params: Record<string, string> = {
    AIforce_token: authParams.token,
    AIforce_username: authParams.username,
    AIforce_region: authParams.region,
  }

  Object.entries(params).forEach(([key, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = value
    form.appendChild(input)
  })

  // 提交表單
  document.body.appendChild(form)
  form.submit()

  // 清理表單
  document.body.removeChild(form)

  return true
}

/**
 * 檢查是否可以跳轉到 AI Forum
 */
export const canRedirectToForum = (): boolean => {
  return getForumAuthParams() !== null
}
