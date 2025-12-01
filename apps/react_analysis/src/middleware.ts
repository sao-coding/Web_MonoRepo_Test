import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export const middleware = async (request: NextRequest) => {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-url', request.url)
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // 取得請求的來源
  const origin = request.headers.get('origin') || ''

  // 添加 CORS 標頭
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')

  // 處理預檢請求
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next).*)'], // 排除 _next 路徑
}
