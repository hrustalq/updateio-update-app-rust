import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import { LoaderCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { invoke } from '@tauri-apps/api/core'
import { useToast } from '@/hooks/use-toast'
import { saveSteamCredentials } from '@/entities/steam/storage'

interface SteamAuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (username: string) => void
}

type AuthState = 'initial' | 'two_factor' | 'authenticating'

export default function SteamAuthModal({
  open,
  onOpenChange,
  onSuccess,
}: SteamAuthModalProps) {
  const { toast } = useToast()
  const [authState, setAuthState] = useState<AuthState>('initial')
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    two_factor_code: "",
  })

  // Reset form when modal is closed
  useEffect(() => {
    if (!open) {
      setCredentials({
        username: "",
        password: "",
        two_factor_code: "",
      })
      setAuthState('initial')
    }
  }, [open])

  // Focus on 2FA input when it appears
  useEffect(() => {
    if (authState === 'two_factor') {
      const input = document.getElementById("twoFactorCode")
      if (input) {
        input.focus()
      }
    }
  }, [authState])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthState('authenticating')

    try {
      const result = await invoke('authenticate_steam', {
        credentials: {
          username: credentials.username,
          password: credentials.password,
          two_factor_code: authState === 'two_factor' ? credentials.two_factor_code : undefined
        }
      }) as string

      const username = result.match(/as (.+)$/)?.[1]
      if (username) {
        saveSteamCredentials({
          username: credentials.username,
          password: credentials.password
        })
        onSuccess(username)
        onOpenChange(false)
      }
    } catch (error: any) {
      if (error.toString().includes("Steam Guard code required")) {
        setAuthState('two_factor')
        toast({
          title: 'Требуется двухфакторная аутентификация',
          description: 'Пожалуйста, введите код из приложения Steam Guard',
        })
        return
      }

      toast({
        title: 'Ошибка',
        description: `Не удалось привязать аккаунт: ${error}`,
      })
      setAuthState('initial')
    }
  }

  const handleInputChange = (field: keyof typeof credentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value
    
    // Special handling for 2FA code
    if (field === 'two_factor_code') {
      value = value.replace(/[^0-9A-Za-z]/g, '').toUpperCase()
    }
    
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isLoading = authState === 'authenticating'
  const isTwoFactor = authState === 'two_factor'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isTwoFactor ? 'Двухфакторная аутентификация' : 'Привязать аккаунт Steam'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isTwoFactor ? (
            <>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Имя пользователя
                </label>
                <Input
                  id="username"
                  value={credentials.username}
                  onChange={handleInputChange('username')}
                  required
                  autoComplete="username"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Пароль
                </label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleInputChange('password')}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label htmlFor="twoFactorCode" className="text-sm font-medium">
                Код Steam Guard
              </label>
              <Input
                id="twoFactorCode"
                value={credentials.two_factor_code}
                onChange={handleInputChange('two_factor_code')}
                placeholder="XXXXX"
                maxLength={5}
                required
                className="text-center tracking-widest font-mono text-lg"
                autoComplete="one-time-code"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Введите код из приложения Steam Guard
              </p>
            </div>
          )}
          <DialogFooter>
            {isTwoFactor && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setAuthState('initial')}
                disabled={isLoading}
              >
                Назад
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading
                ? (isTwoFactor ? 'Проверка...' : 'Подключение...')
                : (isTwoFactor ? 'Подтвердить' : 'Подключить')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 