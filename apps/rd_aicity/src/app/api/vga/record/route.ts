import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

const Get_Comparison = async (Keyin: string) => {
  try {
    const result = await prisma.vGA_Record.findMany({
      where: {
        F_Keyin: Keyin,
        F_Stat: '1',
      },
    })
    return result
  }
  catch (error) {
    console.error('資料庫查詢錯誤:', error)
    return '查無資料'
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const Keyin = searchParams.get('Keyin')
  if (!Keyin) {
    return NextResponse.json({ error: '缺少 Keyin 參數' }, { status: 400 })
  }
  try {
    const Container = await Get_Comparison(Keyin)
    return NextResponse.json(Container)
  }
  catch (error) {
    console.error('資料庫錯誤：', error)
    return NextResponse.json({ error: '資料庫查詢錯誤' }, { status: 500 })
  }
}

// Insert
export async function POST(request: Request) {
  try {
    const { Keyin, Title } = await request.json()

    if (!Keyin) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 })
    }

    const newContainer = await prisma.vGA_Record.create({
      data: {
        F_CreateDate: new Date(),
        F_UpdateTime: new Date(),
        F_Stat: '1',
        F_Keyin: Keyin,
        F_Title: Title,
      },
    })

    return NextResponse.json(newContainer)
  }
  catch (error) {
    console.error('資料庫錯誤：', error)
    return NextResponse.json({ error: '資料庫新增錯誤' }, { status: 500 })
  }
}

// 刪除功能
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const SeqNo = searchParams.get('SeqNo')

    if (!SeqNo) {
      return NextResponse.json({ error: '缺少 SeqNo 參數' }, { status: 400 })
    }

    // 軟刪除：將 F_Stat 設為 '0'
    const result = await prisma.vGA_Record.updateMany({
      where: {
        F_SeqNo: Number(SeqNo),
        F_Stat: '1',
      },
      data: {
        F_Stat: '0',
        F_UpdateTime: new Date(),
      },
    })

    return NextResponse.json({ success: true, deletedCount: result.count })
  }
  catch (error) {
    console.error('刪除錯誤：', error)
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { SeqNo, Title } = body

    if (!SeqNo) {
      return NextResponse.json({ error: '缺少 SeqNo' }, { status: 400 })
    }

    // 更新標題
    if (Title !== undefined) {
      const updated = await prisma.vGA_Record.update({
        where: { F_SeqNo: Number(SeqNo) },
        data: {
          F_Title: Title,
          F_UpdateTime: new Date(),
        },
      })
      return NextResponse.json({
        success: true,
        message: '標題已更新',
        data: updated,
      })
    }
    return NextResponse.json({ error: '未指定更新內容' }, { status: 400 })
  }
  catch (error) {
    console.error('PATCH 錯誤:', error)
    return NextResponse.json({
      success: false,
      error: 'PATCH 發生錯誤',
      details: error,
    }, { status: 500 })
  }
  finally {
    await prisma.$disconnect()
  }
}
