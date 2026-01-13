import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/jwt'

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams
  const AIforce_token = searchParams.get('AIforce_token')
  const AIforce_username = searchParams.get('AIforce_username')
  const accessToken = searchParams.get('accessToken')
  const redirect = searchParams.get('redirect') || process.env.NEXT_PUBLIC_RD_SITE_URL as string

  if (!AIforce_token || !AIforce_username || !accessToken) {
    return NextResponse.json({
      status: 'error',
      message: '缺少必要的參數',
      data: null,
    }, { status: 400 })
  }

  if (await verifyJwt(accessToken) === null) {
    return NextResponse.json({
      status: 'error',
      message: '無效的訪問令牌',
      data: null,
    }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('AIforce_token', AIforce_token, {
    maxAge: 60 * 60 * 24 * 3,
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: false,
  })
  cookieStore.set('AIforce_username', AIforce_username, {
    maxAge: 60 * 60 * 24 * 3,
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: false,
  })
  cookieStore.set('accessToken', accessToken, {
    maxAge: 60 * 60 * 24 * 3,
    domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: false,
  })

  // 跳轉到 redirect 指定的網址
  return NextResponse.redirect(redirect)
}
