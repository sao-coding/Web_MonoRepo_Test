import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

const Get_Detail = async (Keyin: string, MasterID: string) => {
  try {
    const result = await prisma.vGA_Record_Detail.findMany({
      where: {
        F_Keyin: Keyin,
        F_Stat: '1',
        F_Master_ID: MasterID,
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
  const MasterID = searchParams.get('MasterID')
  if (!Keyin || !MasterID) {
    return NextResponse.json({ error: '缺少 Keyin 參數' }, { status: 400 })
  }
  try {
    const Container = await Get_Detail(Keyin, MasterID)
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
    const { Keyin, MasterID, Question, Answer } = await request.json()

    if (!Keyin || !MasterID || !Question || !Answer) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 })
    }

    const newContainer = await prisma.vGA_Record_Detail.create({
      data: {
        F_CreateDate: new Date(),
        F_UpdateTime: new Date(),
        F_Stat: '1',
        F_Keyin: Keyin,
        F_Master_Table: 'VGA_Record',
        F_Master_ID: MasterID.toString(),
        F_Question: Question,
        F_Answer: Answer,
      },
    })

    return NextResponse.json(newContainer)
  }
  catch (error) {
    console.error('資料庫錯誤：', error)
    return NextResponse.json({ error: '資料庫新增錯誤' }, { status: 500 })
  }
}
