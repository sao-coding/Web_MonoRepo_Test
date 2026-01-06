'use client'

import { useAuth } from '@msi/auth/src/provider'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
  const { user } = useAuth()
  const { langCode } = useLanguage()
  const [navItems, setNavItems] = useState<NavbarItem[]>([])

  useEffect(() => {
    const fetchNavbar = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_AIforce_API_URL}/api/AIForce/Navbar?userId=${user?.userId}&deptId=${user?.deptId}&lang=${langCode}`, {
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
  }, [langCode, user?.userId, user?.deptId])

  return (
    <div className="flex flex-wrap gap-2 justify-center items-center my-6">
      {navItems && navItems.map((item: NavbarItem) => {
        return (
          <Button
            key={item.category}
            variant="ghost"
            onClick={() => onCategoryChange(item.category)}
            className={`flex items-center transition-all mr-0
              ${activeCategory === item.category
            ? 'invert bg-white font-bold'
            : 'bg-gray-100 hover:invert hover:font-bold'}`}
          >
            {item.icon && (
              <Image
                src={item.icon}
                alt={item.name}
                width="15"
                height="15"
                // 翻轉圖片顏色
                className="object-contain"
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
