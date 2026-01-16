'use client'

import { useAuth } from '@msi/auth'
import { getAppConfig } from '@msi/config/env'
import { Button } from '@msi/ui/components/button'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useLanguage } from '@/context/Language'

interface NavbarItem {
  category: number
  name: string
  language: string
  isShow: number
  icon: string
}

interface AppNavbarProps {
  activeCategory: number
  onCategoryChange: (category: number) => void
}

const AppNavbar = ({ activeCategory, onCategoryChange }: AppNavbarProps) => {
  const { user, status } = useAuth()
  const { langCode } = useLanguage()
  const [navItems, setNavItems] = useState<NavbarItem[]>([])

  useEffect(() => {
    // 確保 auth 已完成載入且 user 存在
    if (status !== 'success' || !user?.userId) {
      return
    }

    const fetchNavbar = async () => {
      try {
        const res = await fetch(`${getAppConfig().NEXT_PUBLIC_AIforce_API_URL}/api/AIForce/Navbar?userId=${user.userId}&deptId=${user.deptId}&lang=${langCode}`, {
          method: 'GET',
        })
        if (res.ok) {
          const data = await res.json()
          setNavItems(data)
        }
      }
      catch (err) {
        console.error('無法獲取導覽清單:', err)
        toast.error('無法獲取導覽清單')
      }
    }

    fetchNavbar()
  }, [langCode, status, user])

  return (
    <div className="flex flex-wrap gap-2 justify-center items-center my-6">
      {navItems && navItems.map((item: NavbarItem) => {
        return (
          <Button
            key={item.category}
            variant="ghost"
            onClick={() => onCategoryChange(item.category)}
            className={`group flex items-center gap-2 transition-all mr-0
              ${activeCategory === item.category
            ? 'bg-foreground text-background font-bold'
            : 'bg-muted text-foreground hover:bg-foreground hover:text-background hover:font-bold dark:hover:bg-white dark:hover:text-black'}`}
          >
            {item.icon && (
              <Image
                src={item.icon}
                alt={item.name}
                width="15"
                height="15"
                className={`object-contain transition-all ${activeCategory === item.category
                  ? 'invert dark:invert-0'
                  : 'dark:invert group-hover:invert group-hover:dark:invert-0'
                }`}
                unoptimized
              />
            )}
            {item.name}
          </Button>
        )
      })}
    </div>
  )
}

export default AppNavbar
