import type { SidebarItem } from '@msi/ui/components/layout/sidebar/app-sidebar'

// 根据路径前缀匹配不同的 sidebar 配置
export const SIDEBAR_CONFIG: Record<string, SidebarItem[]> = {
  // 首页的 sidebar
  '/': [
    { title: '認證平台', url: '/pcb/ca' },
    { title: '失效分析 (FA)', url: '/pcb/fa' },
    { title: '訊號整合 (SA)', url: '/pcb/sa' },
    { title: '能效實驗室', url: '/pcb/lab' },
    { title: '產品認證中心', url: '/pcb/certification' },
    { title: '實驗室中心', url: '/pcb/lab-center' },
    { title: '專案管理', url: '/pcb/project' },
    { title: 'Footprint Properties', url: '/pcb/footprint' },

    { title: '產品問題判定AI(β)', url: '/pcb/ai' },
    { title: 'Knowledge Base', url: '/pcb/kb' },

    { title: 'GNP', url: '/pcb/gnp' },
    { title: 'NB', url: '/pcb/nb' },
    { title: 'CND', url: '/pcb/cnd' },
    { title: '企業知識庫', url: '/pcb/knowledge' },
    { title: '資訊新聞', url: '/pcb/news' },
    { title: '智慧財產權週報', url: '/pcb/ip-report' }
  ],

  // PCB 相关页面的 sidebar
  '/export': [
    { title: '匯出', url: '/pcb/export' },
    { title: '設定', url: '/pcb/settings' }
  ],

  // 分析相关页面的 sidebar
  '/analysis': [
    { title: '數據總覽', url: '/pcb/analysis' },
    { title: '使用率分析', url: '/pcb/analysis/usagerate' },
    { title: '點擊率分析', url: '/pcb/analysis/clickrate' }
  ]
}

// 获取当前路径对应的 sidebar items
export function getSidebarItems(pathname: string): SidebarItem[] {
  // 移除 basePath
  const pathWithoutBase = pathname.replace(/^\/pcb/, '') || '/'

  // 找到匹配的配置
  for (const [path, items] of Object.entries(SIDEBAR_CONFIG)) {
    if (pathWithoutBase.startsWith(path) && path !== '/') {
      return items
    }
  }

  // 默认返回首页的 sidebar
  return SIDEBAR_CONFIG['/']
}
