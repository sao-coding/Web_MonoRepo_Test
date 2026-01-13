import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const CHATGPT_REDIRECT_API = 'https://msi-chatgpt.msi.com/api/v1/auths/redirect'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { targetUrl } = body

    if (!targetUrl) {
      return NextResponse.json({ success: false, error: '缺少 targetUrl' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    // 嘗試多種可能的 token cookie 名稱
    const chatbotToken = cookieStore.get('chatbotToken')?.value
    const accessToken = cookieStore.get('accessToken')?.value

    // Debug 日誌
    console.warn('[Redirect API] Available cookies:', allCookies.map(c => c.name))
    console.warn('[Redirect API] chatbotToken found:', !!chatbotToken)
    console.warn('[Redirect API] accessToken found:', !!accessToken)
    console.warn('[Redirect API] targetUrl:', targetUrl)

    // 優先使用 chatbotToken，如果沒有則嘗試 accessToken
    const token = chatbotToken || accessToken

    if (!token) {
      return NextResponse.json({
        success: false,
        error: '尚未登入或 Token 已過期，請重新登入',
        debug: {
          availableCookies: allCookies.map(c => c.name),
          hasChatbotToken: !!chatbotToken,
          hasAccessToken: !!accessToken,
        },
      }, { status: 401 })
    }

    // 構建重導向 URL
    const redirectUrl = new URL(CHATGPT_REDIRECT_API)
    redirectUrl.searchParams.append('token', token)
    redirectUrl.searchParams.append('redirect_url', targetUrl)

    console.warn('[Redirect API] Redirect URL:', redirectUrl.toString())

    return NextResponse.json({
      success: true,
      redirectUrl: redirectUrl.toString(),
    })
  }
  catch (e) {
    console.error('[Redirect API] Error:', e)
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : '系統錯誤',
    }, { status: 500 })
  }
}
