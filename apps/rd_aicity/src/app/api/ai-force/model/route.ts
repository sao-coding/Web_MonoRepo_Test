import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export const POST = async (req: NextRequest) => {
  const accessToken = req.headers.get('authorization')?.replace('Bearer ', '') || ''
  const payload = await verifyJwt(accessToken)

  if (payload === null) {
    return NextResponse.json({
      status: 'error',
      message: '無效的訪問令牌',
      data: null,
    }, { status: 401 })
  }

  // const { userId, deptId } = payload

  // // 首先查詢所有 app_type = 3 的應用程式
  // const allApps = await prisma.aI_App_List.findMany({
  //   where: {
  //     app_type: 3,
  //   },
  //   select: {
  //     app_id: true,
  //     name: true,
  //     description: true,
  //     link: true,
  //     logo: true,
  //     F_IsPermissions: true,
  //   },
  // })

  // if (allApps.length === 0) {
  //   return NextResponse.json({ data: [] })
  // }

  // // 分類應用程式根據權限設定
  // const noPermissionApps = allApps.filter(app => app.F_IsPermissions === '0')
  // const restrictedApps = allApps.filter(app => app.F_IsPermissions === '1')
  // const partiallyRestrictedApps = allApps.filter(app => app.F_IsPermissions === '2')

  // const allowedApps = [...noPermissionApps] // 無權限限制的應用程式直接加入

  // // 處理需要權限檢查的應用程式
  // if (restrictedApps.length > 0 || partiallyRestrictedApps.length > 0) {
  //   const appIdsToCheck = [
  //     ...restrictedApps.map(app => app.app_id),
  //     ...partiallyRestrictedApps.map(app => app.app_id),
  //   ].filter((id): id is string => id !== null)

  //   if (appIdsToCheck.length > 0) {
  //     // 查詢個人權限
  //     const userAuthorities = await prisma.c_User_Authority.findMany({
  //       where: {
  //         F_Stat: '1',
  //         F_Type: 'User',
  //         F_Keyin: String(userId),
  //         F_SYSID: { in: appIdsToCheck },
  //       },
  //       select: {
  //         F_SYSID: true,
  //         F_IsAllow: true,
  //       },
  //     })

  //     // 查詢群組權限
  //     const groupAuthorities = await prisma.c_User_Authority.findMany({
  //       where: {
  //         F_Stat: '1',
  //         F_Type: 'Group',
  //         F_Keyin: String(deptId),
  //         F_SYSID: { in: appIdsToCheck },
  //       },
  //       select: {
  //         F_SYSID: true,
  //         F_IsAllow: true,
  //       },
  //     })

  //     // 建立權限映射
  //     const userPermissions = new Map<string, string>()
  //     const groupPermissions = new Map<string, string>()

  //     userAuthorities.forEach((auth) => {
  //       if (auth.F_SYSID) {
  //         userPermissions.set(auth.F_SYSID, auth.F_IsAllow || '')
  //       }
  //     })

  //     groupAuthorities.forEach((auth) => {
  //       if (auth.F_SYSID) {
  //         groupPermissions.set(auth.F_SYSID, auth.F_IsAllow || '')
  //       }
  //     })

  //     // 處理僅部分開放的應用程式 (F_IsPermissions = '1')
  //     restrictedApps.forEach((app) => {
  //       if (!app.app_id)
  //         return

  //       const userPerm = userPermissions.get(app.app_id)
  //       const groupPerm = groupPermissions.get(app.app_id)

  //       // 個人權限優先：如果個人明確拒絕，則拒絕
  //       if (userPerm === 'N')
  //         return

  //       // 如果個人允許或群組允許，則加入
  //       if (userPerm === 'Y' || groupPerm === 'Y') {
  //         allowedApps.push(app)
  //       }
  //     })

  //     // 處理僅部分不開放的應用程式 (F_IsPermissions = '2')
  //     partiallyRestrictedApps.forEach((app) => {
  //       if (!app.app_id)
  //         return

  //       const userPerm = userPermissions.get(app.app_id)
  //       const groupPerm = groupPermissions.get(app.app_id)

  //       // 個人權限優先：如果個人明確拒絕，則拒絕
  //       if (userPerm === 'N')
  //         return

  //       // 如果群組明確拒絕且個人沒有明確允許，則拒絕
  //       if (groupPerm === 'N' && userPerm !== 'Y')
  //         return

  //       // 否則允許
  //       allowedApps.push(app)
  //     })
  //   }
  // }

  // return NextResponse.json({
  //   data: allowedApps.map(app => ({
  //     id: app.name,
  //     object: 'app',
  //     created: 1697036400, // 模擬用，如果你有實際建立時間可以改這裡
  //     owend_by: 'dad',
  //     permissions: null,
  //     name: app.name,
  //     url: `${process.env.NEXT_PUBLIC_RD_SITE_URL}${app.link}`,
  //     info: {
  //       params: null,
  //       meta: {
  //         profile_image_url: app.logo,
  //         description: app.description,
  //         capabilities: null,
  //       },
  //     },
  //   })),
  // })
  const appList = await prisma.aI_App_List.findMany({
    where: {
      app_type: 3,
    },
    select: {
      name: true,
      description: true,
      link: true,
      logo: true,
    },
  })

  return NextResponse.json({
    data: appList.map(app => ({
      id: app.name,
      object: 'app',
      created: 1697036400,
      owend_by: 'dad',
      permissions: null,
      name: app.name,
      url: `${process.env.NEXT_PUBLIC_RD_SITE_URL}${app.link}`,
      info: {
        params: null,
        meta: {
          profile_image_url: app.logo,
          description: app.description,
          capabilities: null,
        },
      },
    })),
  })
}
