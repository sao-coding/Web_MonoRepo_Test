import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { AIforce_token, AIforce_username } = await req.json()

  // https://aiforce.msi.com/api/auth/verify-token
  try {
    const res = await fetch('https://aiforce.msi.com/api/auth/verify-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        AIforce_token,
        AIforce_username,
      }),
    })

    const data = await res.json()

    // {
    //   "data": {
    //     "success": true,
    //     "valid": true,
    //     "user": {
    //       "username": "jeterluan",
    //       "region": "MSIHQ"
    //     },
    //     "expiresAt": "2025-05-09T05:19:23.000Z",
    //     "remainingTime": 250123
    //   }
    // }

    if (data?.success) {
      return NextResponse.json({
        status: 'success',
        message: '驗證成功',
        data,
      })
    }
    else {
      return NextResponse.json({
        status: 'error',
        message: `${data?.message} | ${data?.debug.error}`,
      }, { status: 401 })
    }
  }
  catch (error) {
    console.error('驗證失敗', error)
    return NextResponse.json({
      status: 'error',
      message: '驗證失敗',
    }, { status: 500 })
  }
}
