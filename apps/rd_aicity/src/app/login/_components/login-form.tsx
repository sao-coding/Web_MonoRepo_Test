'use client'

import type { AppConfig } from '@msi/config/env'
import { useAuth } from '@msi/auth'
import { Button } from '@msi/ui/components/button'
import { Checkbox } from '@msi/ui/components/checkbox'
import { Input } from '@msi/ui/components/input'
import { Label } from '@msi/ui/components/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@msi/ui/components/select'
import { EyeIcon, EyeOffIcon, Loader2Icon, RefreshCwIcon, UserIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useI18n } from '@/lib/i18n'
import { CapsLockIndicator } from './language-switcher'

// 區域選項
const REGIONS = ['MSIHQ', 'MSIK', 'MSIS', 'MSIPRC', 'MSIAM', 'MSIEMEA'] as const
type Region = (typeof REGIONS)[number]

// 生成驗證碼
function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 20) + 1
  const num2 = Math.floor(Math.random() * 20) + 1
  return { num1, num2, answer: num1 + num2 }
}

interface LoginFormProps {
  config: AppConfig
}

/**
 * 登入表單組件
 * 包含區域選擇、帳號、密碼、驗證碼輸入和記住帳號功能
 */
export function LoginForm({ config }: LoginFormProps) {
  const { login, status } = useAuth()
  const { t } = useI18n()

  // States
  const [region, setRegion] = useState<Region>('MSIHQ')
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [captchaInput, setCaptchaInput] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [captcha, setCaptcha] = useState(() => generateCaptcha())
  const [capsLockOn, setCapsLockOn] = useState(false)

  // 初始化 - 讀取記住的帳號
  useEffect(() => {
    const storedUser = localStorage.getItem('rd-ai-city-remembered-username')
    const storedRegion = localStorage.getItem('rd-ai-city-remembered-region') as Region

    if (storedUser) {
      setUserName(storedUser)
      setRememberMe(true)
    }
    if (storedRegion && REGIONS.includes(storedRegion)) {
      setRegion(storedRegion)
    }
  }, [])

  // 監聽 Caps Lock 狀態
  const handlePasswordKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState('CapsLock'))
  }

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha())
    setCaptchaInput('')
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (Number.parseInt(captchaInput, 10) !== captcha.answer) {
      toast.error(t('login.captchaError'))
      refreshCaptcha()
      return
    }

    if (rememberMe) {
      localStorage.setItem('rd-ai-city-remembered-username', userName)
      localStorage.setItem('rd-ai-city-remembered-region', region)
    }
    else {
      localStorage.removeItem('rd-ai-city-remembered-username')
      localStorage.removeItem('rd-ai-city-remembered-region')
    }

    const result = await login({ userName, password })
    if (result.success) {
      window.location.href = config.NEXT_PUBLIC_BASE_PATH_URL
    }
    else {
      toast.error(result.error || t('login.loginFailed'))
      refreshCaptcha()
    }
  }

  const isLoading = status === 'loading'

  // 使用 Tailwind 變數支援深色模式的輸入框樣式 - 512x50 px
  const inputClassName = 'h-[50px] w-[512px] max-w-full bg-secondary/80 dark:bg-secondary/60 border border-border rounded-full px-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
      {/* 區域選擇 - 強制 50px 高度 */}
      <Select value={region} onValueChange={value => setRegion(value as Region)}>
        <SelectTrigger className={`${inputClassName} !h-[50px] justify-between`}>
          <SelectValue placeholder={t('login.selectRegion')} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{t('login.selectRegion')}</SelectLabel>
            {REGIONS.map(r => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* 帳號 */}
      <div className="relative group w-[512px] max-w-full">
        <Input
          id="userName"
          name="userName"
          type="text"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          placeholder={t('login.usernamePlaceholder')}
          required
          disabled={isLoading}
          autoComplete="username"
          className={`${inputClassName} pr-12`}
        />
        <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
      </div>

      {/* 密碼 */}
      <div className="relative group w-[512px] max-w-full">
        <Input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handlePasswordKeyEvent}
          onKeyUp={handlePasswordKeyEvent}
          placeholder={t('login.passwordPlaceholder')}
          required
          disabled={isLoading}
          autoComplete="current-password"
          className={`${inputClassName} pr-16`}
        />
        {/* Caps Lock 提示 */}
        <div className="absolute right-11 top-1/2 -translate-y-1/2">
          <CapsLockIndicator show={capsLockOn} />
        </div>
        {/* 顯示/隱藏密碼按鈕 */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>

      {/* 驗證碼區塊 - 所有元素在 512px 寬度內 */}
      <div className="flex gap-2 items-center w-[512px] max-w-full h-[50px]">
        <Input
          id="captcha"
          name="captcha"
          type="text"
          value={captchaInput}
          onChange={e => setCaptchaInput(e.target.value)}
          placeholder={t('login.captchaPlaceholder')}
          required
          disabled={isLoading}
          autoComplete="off"
          className="h-[50px] flex-1 bg-secondary/80 dark:bg-secondary/60 border border-border rounded-full px-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all text-left tracking-widest"
        />

        <div className="flex items-center gap-1 px-3 h-[50px] bg-secondary/80 dark:bg-secondary/60 border border-border rounded-full justify-center select-none shrink-0">
          <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{captcha.num1}</span>
          <span className="text-muted-foreground text-sm">+</span>
          <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{captcha.num2}</span>
          <span className="text-muted-foreground text-sm">=</span>
          <span className="text-red-500 dark:text-red-400 font-bold text-sm">?</span>
        </div>

        <button
          type="button"
          onClick={refreshCaptcha}
          className="p-2 h-[50px] w-[50px] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent rounded-full transition-all shrink-0"
          title="刷新驗證碼"
        >
          <RefreshCwIcon className="h-4 w-4" />
        </button>
      </div>

      {/* 記住帳號 - checkbox 深色用白邊框、淺色用黑邊框 */}
      <div className="flex items-center gap-2 px-1 w-[512px] max-w-full">
        <Checkbox
          id="rememberMe"
          checked={rememberMe}
          onCheckedChange={checked => setRememberMe(checked === true)}
          className="border-foreground/50 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
        />
        <Label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
          {t('login.rememberMe')}
        </Label>
      </div>

      {/* 登入按鈕 */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-[512px] max-w-full h-[50px] bg-foreground hover:bg-foreground/90 text-background rounded-full font-medium text-base tracking-[0.3em] shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 mt-2"
      >
        {isLoading
          ? (
              <>
                <Loader2Icon className="animate-spin mr-2" />
                {t('login.submitting')}
              </>
            )
          : t('login.submit')}
      </Button>
    </form>
  )
}
