'use client'

import { useAuth } from '@msi/auth'
import { Button } from '@msi/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@msi/ui/components/card'
import { Input } from '@msi/ui/components/input'
import { Label } from '@msi/ui/components/label'
import { Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

const LoginPage = () => {
  const { login, status } = useAuth()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const credentials = {
      userName: formData.get('userName') as string,
      password: formData.get('password') as string
    }

    const result = await login(credentials)
    if (result.success) {
      window.location.href = '/'
    } else {
      toast.error(result.error ?? '登入失敗')
    }
  }

  // 按鈕載入狀態只顯示在實際登入操作中，不含初始檢查
  const isLoading = status === 'loading'

  return (
    <div className='flex flex-1 items-center justify-center'>
      <Card className='w-11/12 max-w-sm md:w-full'>
        <CardHeader>
          <CardTitle>登入</CardTitle>
          <CardDescription>請輸入您的帳號和密碼以登入系統。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <div className='grid gap-3'>
              <Label htmlFor='userName'>帳號</Label>
              <Input
                id='userName'
                name='userName'
                type='text'
                required
                disabled={status === 'loading'}
              />
            </div>
            <div className='grid gap-3'>
              <Label htmlFor='password'>密碼</Label>
              <Input
                id='password'
                name='password'
                type='password'
                required
                disabled={status === 'loading'}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2Icon className='animate-spin' />
                    登入中...
                  </>
                ) : (
                  '登入'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
