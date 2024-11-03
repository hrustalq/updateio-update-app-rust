import SteamAuthModal from '@/components/steam-auth-modal'
import Button from '@/components/ui/button'
import { ensureSteamCmd } from '@/entities/steamcmd/api/ensureSteamCmd'
import { useToast } from '@/hooks/use-toast'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { clearSteamCredentials } from '@/entities/steam/storage'

export const Route = createFileRoute('/_layout/settings')({
  component: Settings,
})

function Settings() {
  const { toast } = useToast()

  const { data: steamCmdStatus, isLoading: steamCmdStatusLoading } = useQuery({
    queryKey: ['steamCmdStatus'],
    queryFn: () => ensureSteamCmd(),
  })
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [linkedAccount, setLinkedAccount] = useState<string | null>(null)

  return (
    <div>
      <div className="rounded-lg border flex-1 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">SteamCMD</h3>
            <p className="text-sm text-muted-foreground">
              {steamCmdStatusLoading ? (
                <LoaderCircle className="animate-spin inline mr-2" />
              ) : steamCmdStatus ? (
                'Установлен'
              ) : (
                'Не установлен'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Аккаунт Steam</h3>
            <p className="text-sm text-muted-foreground">
              {linkedAccount
                ? `Подключен как ${linkedAccount}`
                : 'Не подключен'}
            </p>
          </div>
          <div className="flex gap-2">
            {linkedAccount && (
              <Button
                variant="outline"
                onClick={() => {
                  clearSteamCredentials()
                  setLinkedAccount(null)
                  toast({
                    title: 'Успех',
                    description: 'Аккаунт Steam отвязан',
                  })
                }}
              >
                Отвязать
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsAuthModalOpen(true)}
            >
              {linkedAccount ? 'Изменить' : 'Подключить'}
            </Button>
          </div>
        </div>
      </div>

      <SteamAuthModal
        open={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        onSuccess={(username) => {
          setLinkedAccount(username)
          toast({
            title: 'Успех',
            description: `Аккаунт Steam успешно подключен как ${username}`,
          })
        }}
      />
    </div>
  )
}
