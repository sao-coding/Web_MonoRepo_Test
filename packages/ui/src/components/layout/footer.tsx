

import Link from 'next/link'
import { IconMsi } from '@msi/ui/components/layout/icons/msi'

interface MenuItem {
  title: string
  href: string
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

interface FooterProps {
  showSystemMenu?: boolean
}

export default function Footer({ showSystemMenu = true }: FooterProps) {
  const currentYear = new Date().getFullYear()

  const menuSections: MenuSection[] = [
    {
      title: '品質',
      items: [
        { title: 'IMS', href: '/DQA/Code/IMS/MyIssue.aspx' },
        { title: 'IMS FAE', href: 'http://fae/' },
        { title: 'IMS MB', href: 'http://sdqa/Code/IMS_MB/C_ModelList_welcome.aspx' },
        { title: '工程變更系統', href: 'https://dqa.msi.com.tw/Code/ECIS/C_ECIS_welcome.aspx' },
        { title: '工廠生產彙報', href: 'https://dqa.msi.com.tw/Code/PM/C_Fac_Welcome.aspx' },
        { title: '能效實驗室認證系統', href: '/DQA/Code/EEL/FileCenter.aspx' },
        { title: '週報系統', href: 'https://dqa.msi.com.tw/Code/Report_welcome_noimages.aspx' },
        { title: '會議記錄系統', href: 'https://dqa.msi.com.tw/Code/Meeting/C_Meeting_Welcome.aspx' },
        { title: '實驗室中心', href: '/DQA/Code/NewLabCenter/NewLab_HomePage.aspx' },
      ],
    },
    {
      title: '服務',
      items: [
        { title: 'FAE系統(FAQ)', href: 'https://dqa.msi.com.tw/Code/FAQ/FAQ_Welcome.aspx' },
        { title: 'Global Flow', href: 'https://globalflow.msi.com/WebAgenda/' },
        { title: 'Global System', href: 'http://172.16.0.198/globalsys/System/Logon.aspx' },
        { title: 'Helpdesk', href: '#' },
        { title: '線上投稿', href: '#' },
        { title: '訪客預約系統', href: 'http://172.16.0.174/lbm/login.aspx' },
        { title: '每週菜單', href: 'http://eip/EIP/template_sample/list_detail?key=VElUTEVfTkxTPW1zaS5tZW51LlUwMDAwMTMmQ0FURUdPUllfSUQ9MjcyOSZBQ1RfUFJPR19DT0RFPVUwMDAwMTMmUEFSRU5UX1RBR19BRERSPWh0dHAlM0ElMkYlMkZlaXAlMkZFSVAlMkZ0ZW1wbGF0ZV9zYW1wbGUlMkZkZXB0X3N0eWxlXzElM0ZrZXklM0RWRWxVVEVWZlRreFRQVzF6YVM1dFpXNTFMbFV3TURBd01UTW1UMUpIWDBsRVBUTTBNemt5Sm5CeWIyZGZZMjlrWlQxVk1EQXdNREV6SmtGRFZGOVFVazlIWDBOUFJFVTlWVEF3TURBeE15Wm1iM0ozWVhKa1BXSnNZVzVyTG1wemNDVXpSbXRsZVNVelJDWnRaVzUxWDJ4dlkyRnNaV3RsZVQxdGMya3ViV1Z1ZFM1VU1Ea3dNREFtYldsa1BTWnRaVzUxYkhOcGRGOXJaWGs5TURBd01EQXdNREF5TUZVd01EQXdNVE0lM0Q=' },
      ],
    },
    {
      title: '研發',
      items: [
        { title: 'FA系統', href: '/DQA/Code/FA/FA_issue_Summary.aspx' },
        { title: 'Layout Web', href: '#' },
        { title: 'Lessons Learned', href: '/DQA/Code/Lesson_Learn/C_LL_Import_IMS.aspx' },
        { title: 'RD工作日誌', href: 'https://dqa.msi.com.tw/Code/RSS/C_WorkNote_Tax_List.aspx' },
        { title: 'SA系統', href: '/SA/Default.aspx' },
        { title: '工程問題確認系統', href: '#' },
        { title: '工作報告系統', href: 'https://dqa.msi.com.tw/Code/RSS/RSS_welcome.aspx' },
        { title: '工單系統', href: 'https://dqa.msi.com.tw/Code/TCS/C_Request_Welcome.aspx' },
        { title: '產品認證', href: '/DQA/Code/Certification_Center/Progress_Query.aspx' },
        { title: '需求單系統', href: 'https://dqa.msi.com.tw/Code/TCS/C_RequestForm_List.aspx?Mode=My' },
      ],
    },
    {
      title: '管理',
      items: [
        { title: 'AVL', href: 'https://dqa.msi.com.tw/Code/PM/C_AVL_PartNo_Welcome.aspx' },
        { title: 'Thunderbolt', href: '/DQA/Code/Thunderbolt/Thunderbolt_Homepage.aspx' },
        { title: '元件管理', href: 'https://dqa.msi.com.tw/Code/PM/C_Com_Welcome.aspx' },
        { title: '出缺勤系統', href: 'https://dqa.msi.com.tw/Code/AAS/C_AAS_Welcome.aspx' },
        { title: '專案管理', href: 'https://dqa.msi.com.tw/Code/PM/C_PM_List.aspx' },
        { title: '軟體品質管理(SQC)', href: '/DQA/Code/SQC/SQC_Status.aspx' },
        { title: '部門管理系統', href: 'https://dqa.msi.com.tw/Code/ORG/Dept_Welcome.aspx' },
        { title: '報表分析', href: '/DQA/Code/Report_Analysis/test_BU.aspx' },
        { title: '資產管理系統', href: '/DQA/Code/MMC/Welcome.aspx' },
      ],
    },
    {
      title: '資源',
      items: [
        { title: '多媒體管理', href: 'https://dqa.msi.com.tw/Code/Doc/C_So_M_Index.aspx' },
        { title: '社團活動', href: 'https://eip.msi.com/EIP/template_sample/org_group_style_1' },
        { title: '員購網', href: 'https://eip.msi.com/EIP/portal_frame' },
        { title: '特約商店', href: 'https://eip.msi.com/EIP/template_sample/list_style_4' },
        { title: '討論區', href: 'https://dqa.msi.com.tw/Code/Doc/C_Dis_Welcome.aspx' },
        { title: '健康管理', href: 'http://172.16.0.219/UUHMST/Common/Login.aspx' },
        { title: '微星大學', href: 'https://msiu.msi.com/dist/#/index' },
        { title: '績效考核', href: 'http://pms.msi.com/msi_dist/#/index' },
        { title: '薪資查詢系統', href: 'https://sal.msi.com/' },
        { title: '攤位訊息', href: 'https://eip.msi.com/EIP/calendar/calendar_week' },
      ],
    },
  ]

  return (
    <footer className="bg-background">
      {/* System Menu Section */}
      {showSystemMenu && (
        <div className="relative w-full">
          {/* 背景圖層 */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url(https://dqa.msi.com.tw/Code/New_ORG/img/SystemBG.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* 液態玻璃層 */}
          <div className="relative py-6 px-8">
            <div className="container mx-auto">
              <div className="relative p-4 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-2xl border border-white/30">
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-transparent to-blue-500/20 blur-3xl animate-[spin_15s_linear_infinite]"></div>
                <div className="relative grid grid-cols-5 gap-8">
                  {menuSections.map((section, index) => (
                    <div key={index} className="flex flex-col">
                      <h3 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-red-600 pb-2">
                        {section.title}
                      </h3>
                      <div className="flex flex-col space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <Link
                            key={itemIndex}
                            href={item.href}
                            target="_blank"
                            className="text-gray-700 hover:text-red-600 transition-colors duration-200 text-sm"
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Copyright Section inside System Menu */}
                <div className="mt-6 container mx-auto flex pt-6 pb-2 items-center justify-between px-4 text-sm text-muted-foreground border-t">
                  <div className="flex items-center gap-2">
                    <IconMsi className="h-4 w-auto opacity-70" />
                    <span>{currentYear} 版權為微星科技所有</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span>#01-1.0-R_EN</span>
                    <span>Taiwan / 繁體中文</span>
                    <a href="#" className="hover:text-foreground transition-colors">
                      系統團隊
                    </a>
                    <a href="#" className="hover:text-foreground transition-colors">
                      流量查詢
                    </a>
                    <a href="#" className="hover:text-foreground transition-colors">
                      聯絡數位平台發展部
                    </a>
                    <span>Powered by 數位平台發展部</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copyright Section - 當沒有 SystemMenu 時單獨顯示，但保留背景圖 */}
      {!showSystemMenu && (
        <div className="relative w-full">
          {/* 背景圖層 */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: 'url(https://dqa.msi.com.tw/Code/New_ORG/img/SystemBG.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* 版權資訊 */}
          <div className="relative py-2 px-8">
            <div className="container mx-auto">
              <div className="relative px-4 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-2xl border border-white/30">
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-transparent to-blue-500/20 blur-3xl animate-[spin_15s_linear_infinite]"></div>
               
                {/* Copyright Section inside System Menu */}
                <div className="container mx-auto flex pt-4 pb-2 items-center justify-between px-4 text-sm text-muted-foreground border-t">
                  <div className="flex items-center gap-2">
                    <IconMsi className="h-4 w-auto opacity-70" />
                    <span>{currentYear} 版權為微星科技所有</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span>#01-1.0-R_EN</span>
                    <span>Taiwan / 繁體中文</span>
                    <a href="#" className="hover:text-foreground transition-colors">
                      系統團隊
                    </a>
                    <a href="#" className="hover:text-foreground transition-colors">
                      流量查詢
                    </a>
                    <a href="#" className="hover:text-foreground transition-colors">
                      聯絡數位平台發展部
                    </a>
                    <span>Powered by 數位平台發展部</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
