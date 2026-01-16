'use client'

import { useAuth } from '@msi/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@msi/ui/components/avatar'
import { Button } from '@msi/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@msi/ui/components/dropdown-menu'
import { LogOutIcon } from 'lucide-react'
import { toast } from 'sonner'

export function UserAvatar() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    const success = logout()
    if (success) {
      toast.success('已登出')
      const { protocol, hostname, port } = window.location
      const portSuffix = port ? `:${port}` : ''
      const redirectUrl = `${protocol}//${hostname}${portSuffix}/aiforce/login`
      window.location.href = redirectUrl
    } else {
      toast.error('登出失敗')
    }
  }

  const userName = user?.name ?? '使用者'
  const userId = user?.userId

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='rounded-full'>
          <Avatar className='size-8'>
            <AvatarImage
              src='https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/user.png'
              alt={userName}
            />
            <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel className='hover:bg-accent rounded-sm'>
          <div className='flex items-center gap-2'>
            <Avatar>
              <AvatarImage src='https://rd_service.msi.com.tw/sdqaFile/VSS/DQA/icon/user.png' />
              <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className='font-medium'>{userName}</h3>
              {userId && <p className='text-muted-foreground text-sm'>{userId}</p>}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOutIcon className='mr-2 size-4' />
          登出
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
