import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// app_id/app_folder → 實際路由的映射 (不使用資料庫的 link)
const APP_ROUTE_MAP: Record<string, string> = {
  product_spec: '/AI_City/ProductSpec',
  asr: '/AI_City/asr',
  // 新增其他 app 時在此添加映射
}

// GET 處理函數
export async function GET(_req: NextRequest) {
  try {
    // 從資料庫取得 app 資訊 (但不使用 link 欄位)
    const apps = await prisma.aI_App_List.findMany({
      where: {
        app_type: 2,
        F_Stat: {
          not: '0',
        },
      },
      select: {
        F_SeqNo: true,
        F_CreateTime: true,
        F_UpdateTime: true,
        F_Stat: true,
        app_id: true,
        name: true,
        app_folder: true,
        description: true,
        version: true,
        logo: true,
        // link: true, // 不再使用資料庫的 link
        update_required: true,
        app_type: true,
      },
      orderBy: {
        app_id: 'asc',
      },
    })

    // 使用靜態映射表設定 link
    const appsWithStaticLinks = apps.map(app => ({
      ...app,
      link: APP_ROUTE_MAP[app.app_id ?? ''] || APP_ROUTE_MAP[app.app_folder ?? ''] || '#',
    }))

    return NextResponse.json(appsWithStaticLinks, { status: 200 })
  }
  catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知錯誤'

    return NextResponse.json(
      {
        error: '取得應用數據時發生錯誤',
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
