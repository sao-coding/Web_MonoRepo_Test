import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export const POST = async (req: NextRequest) => {
  const { user, password } = await req.json()
  const _ip = req.headers.get('x-forwarded-for')?.replace('::ffff:', '')?.split(':')[0] || 'unknown'

  const res = await fetch(`${process.env.NEXT_PUBLIC_LOGIN_API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userName: user, password, system: 'AIforce' }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: '登入失敗，請檢查帳號或密碼' }, { status: 401 })
  }

  const data = await res.json()

  const userInfo = {
    id: data.userId,
    name: data.name,
    token: data.accessToken,
    token_type: 'Bearer',
    expires_at: 3 * 24 * 60 * 60, // 3 days in seconds
  }

  return NextResponse.json(userInfo)
}
