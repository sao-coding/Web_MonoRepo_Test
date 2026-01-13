import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const CHATGPT_REDIRECT_API = 'https://msi-chatgpt.msi.com/api/v1/auths/redirect'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({})) // 防止 json 解析失敗崩潰
    const { targetUrl } = body

    if (!targetUrl) {
      return NextResponse.json({ success: false, error: '缺少 targetUrl' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const tokenObj = cookieStore.get('chatbotToken')
    const token = tokenObj?.value

    // 印出所有 Cookie 與 Token 狀態
    console.warn('[Debug Redirect] All Cookies:', cookieStore.getAll().map(c => c.name))
    console.warn('[Debug Redirect] Token found:', !!token)
    console.warn('token', token)

    if (!token) {
      return NextResponse.json({ success: false, error: '尚未登入 (Token Missing)' }, { status: 401 })
    }

    const redirectUrl = new URL(CHATGPT_REDIRECT_API)
    redirectUrl.searchParams.append('token', token)
    redirectUrl.searchParams.append('redirect_url', targetUrl)

    return NextResponse.json({
      success: true,
      redirectUrl: redirectUrl.toString(),
    })
  }
  catch (e) {
    console.error('[redirect] error', e)
    return NextResponse.json({ success: false, error: '系統錯誤' }, { status: 500 })
  }
}
