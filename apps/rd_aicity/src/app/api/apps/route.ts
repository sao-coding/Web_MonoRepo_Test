import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET 處理函數
export async function GET(_req: NextRequest) {
  try {
    // 嘗試查詢數據
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
        link: true,
        update_required: true,
        app_type: true,
      },
      orderBy: {
        app_id: 'asc',
      },
    })

    // 返回查詢結果
    return NextResponse.json(apps, { status: 200 })
  }
  catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知錯誤'

    // 返回簡化的錯誤信息
    return NextResponse.json(
      {
        error: '取得應用數據時發生錯誤',
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
