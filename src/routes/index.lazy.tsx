import { createLazyFileRoute } from '@tanstack/react-router'
import Separator from '@/components/ui/separator'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Plus, RefreshCw, Search, Edit, Calendar, LoaderCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import getGames from '@/entities/game/api/getGames'
import getApps from '@/entities/app/api/getApps'
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from '@/components/ui/card'
import Skeleton from '@/components/ui/skeleton'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import getPatchNotes from '@/entities/patch-note/api/getPatchNotes'
import getSubscriptions from '@/entities/subscription/api/getSubscriptions'
import { ensureSteamCmd } from '@/entities/steamcmd/api/ensureSteamCmd'
import getUpdates from '@/entities/update/api/getUpdates'
import { useToast } from '@/hooks/use-toast'
import { useState } from "react"
import SteamAuthModal from '@/components/steam-auth-modal'
import UpdateGameModal from '@/components/update-game-modal'
import { clearSteamCredentials } from '@/entities/steam/storage'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  const { toast } = useToast()

  const isGamesVisible = useIntersectionObserver('games')
  const isAppsVisible = useIntersectionObserver('apps')
  const isPatchNotesVisible = useIntersectionObserver('patch-notes')
  const isSubscriptionsVisible = useIntersectionObserver('subscriptions')
  const isUpdatesVisible = useIntersectionObserver('updates')
  const isSettingsVisible = useIntersectionObserver('settings')

  const [currentAppAndGameIdPair, setCurrentAppAndGameIdPair] = useState<{ game: { id: string, name: string }, app: { id: string, name: string } } | null>(null)

  const { data: games, isLoading: gamesLoading } = useQuery({
    queryKey: ['games'],
    queryFn: () => getGames(),
    enabled: isGamesVisible,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })

  const { data: apps, isLoading: appsLoading } = useQuery({
    queryKey: ['apps'],
    queryFn: () => getApps(),
    enabled: isAppsVisible,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })

  const { data: patchNotes, isLoading: patchNotesLoading } = useQuery({
    queryKey: ['patchNotes'],
    queryFn: () => getPatchNotes(),
    enabled: isPatchNotesVisible,
  })

  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => getSubscriptions(),
    enabled: isSubscriptionsVisible,
  })

  const { data: updates, isLoading: updatesLoading } = useQuery({
    queryKey: ['updates'],
    queryFn: () => getUpdates(),
    enabled: isUpdatesVisible,
  })

  const { data: steamCmdStatus, isLoading: steamCmdStatusLoading } = useQuery({
    queryKey: ['steamCmdStatus'],
    queryFn: () => ensureSteamCmd(),
    enabled: isSettingsVisible,
  })

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [linkedAccount, setLinkedAccount] = useState<string | null>(null)

  const [isUpdateGameModalOpen, setIsUpdateGameModalOpen] = useState(false)
  const handleUpdateButtonClick = async (gameId: string) => {
    try {
      const apps = await getApps({ gameId })
      const app = apps?.data[0]
      const game = games?.data.find((game) => game.id === gameId)
      if (!app || !game) {
       toast({
         title: 'Ошибка',
         description: 'Не удалось найти игру или приложение',
       })
       return
      }
      setCurrentAppAndGameIdPair({ app, game })
      setIsUpdateGameModalOpen(true)
     } catch (error) {
       toast({
         title: 'Ошибка',
         description: 'Не удалось обновить данные',
       })
     }
  }

  return (
    <div className="h-screen overflow-scroll px-4 pb-0 snap-y snap-mandatory">      
      <section id="games" className="min-h-svh space-y-4 py-8 snap-start">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Игры</h2>
          <Button>
            <Plus className="size-4" />
            Добавить игру
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Поиск игр..." />
        </div>
        <div className="rounded-lg border flex-1">
          {gamesLoading ? (
            <div className="p-4 text-center text-muted-foreground grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {
                Array.from({ length: 12 }).map((_, index) => (
                  <Skeleton key={index} className="w-full animate-pulse h-40" />
                ))
              }
            </div>
          ) : games?.data.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Нет доступных игр
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {games?.data.map((game) => (
                <Card key={game.id} className="flex flex-col relative overflow-hidden">
                  <CardHeader className="relative min-h-20">
                    {game.image && <img className='h-12 w-12 place-content-center absolute top-1/2 -translate-y-1/2 right-2 opacity-90 backdrop-blur-sm rounded-full' src={game.image} alt={game.name} width={100} height={30} />}
                    <CardTitle>{game.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-y-2 grow z-10">
                    <ul className="flex flex-col gap-y-1 w-full items-start">
                      <li className='grid grid-cols-[auto_1fr]'>
                        <span className="font-bold text-sm min-w-20 text-left">ID:</span>
                        <span className="font-mono text-muted-foreground text-sm">{game.id}</span>
                      </li>
                      <li className='grid grid-cols-[auto_1fr]'>
                        <span className="font-bold text-sm min-w-20 text-left">Название:</span>
                        <span className="text-muted-foreground text-sm">{game.name}</span>
                      </li>
                      {game.version && (
                        <li className='grid grid-cols-[auto_1fr]'>
                          <span className="font-bold text-sm min-w-20 text-left">Версия:</span>
                          <span className="text-muted-foreground text-sm">{game.version}</span>
                        </li>
                      )}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => handleUpdateButtonClick(game.id)}
                      disabled={isUpdateGameModalOpen}
                    >
                      <RefreshCw className='size-4' />
                      Обновить
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Separator className="my-8" />

      <section id="apps" className="min-h-svh space-y-4 py-8 snap-start">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Приложения</h2>
          <Button>
            <Plus className="size-4" />
            Добавить приложение
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Поиск приложений..." />
        </div>
        <div className="rounded-lg border flex-1">
          {appsLoading ? (
            <div className="p-4 text-center text-muted-foreground grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {
                Array.from({ length: 12 }).map((_, index) => (
                  <Skeleton key={index} className="w-full animate-pulse h-40" />
                ))
              }
            </div>
          ) : apps?.data.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Нет доступных приложений
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps?.data.map((app) => (
                <Card key={app.id} className="flex flex-col relative overflow-hidden">
                  <CardHeader className="relative min-h-20">
                    {app.image && <img className='h-12 w-12 place-content-center absolute top-1/2 -translate-y-1/2 right-2 opacity-90 backdrop-blur-sm rounded-full' src={app.image} alt={app.name} width={100} height={30} />}
                    <CardTitle>{app.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-y-2 grow z-10">
                    <ul className="flex flex-col gap-y-1 w-full items-start">
                      <li className='grid grid-cols-[auto_1fr]'>
                        <span className="font-bold text-sm min-w-20 text-left">ID:</span>
                        <span className="font-mono text-muted-foreground text-sm">{app.id}</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="outline">
                      <Edit className="size-4" />
                      Редактировать
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Separator className="my-8" />

      <section id="patch-notes" className="min-h-svh space-y-4 py-8 snap-start">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Патч-ноты</h2>
          <Button>
            <Plus className="size-4" />
            Добавить патч-нот
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Поиск патч-нотов..." />
        </div>
        <div className="rounded-lg border flex-1">
          {patchNotesLoading ? (
            <div className="p-4 text-center text-muted-foreground grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {
                Array.from({ length: 12 }).map((_, index) => (
                  <Skeleton key={index} className="w-full animate-pulse h-40" />
                ))
              }
            </div>
          ) : patchNotes?.data.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Нет доступных патч-нотов
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {patchNotes?.data.map((patchNote) => (
                <Card key={patchNote.id} className="flex flex-col relative overflow-hidden">
                  <CardHeader>
                    <CardTitle>{patchNote.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patchNote.content}
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button variant="outline">
                      <Calendar className="size-4" />
                      {new Date(patchNote.releaseDate).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Separator className="my-8" />

      <section
        id="subscriptions"
        className="min-h-svh space-y-4 py-8 snap-start"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Подписки</h2>
          <Button>
            <Plus className="size-4" />
            Добавить подписку
          </Button>
        </div>
        <div className="rounded-lg border flex-1">
          {subscriptionsLoading ? (
            <div className="p-4 text-center text-muted-foreground grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {
                Array.from({ length: 12 }).map((_, index) => (
                  <Skeleton key={index} className="w-full animate-pulse h-40" />
                ))
              }
            </div>
          ) : subscriptions?.data.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Нет активных подписок
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscriptions?.data.map((subscription) => (
                <Card key={subscription.id} className="flex flex-col relative overflow-hidden">
                  <CardHeader>
                    <CardTitle>{subscription.id}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="flex flex-col gap-y-1 w-full items-start">
                      <li className='grid grid-cols-[auto_1fr]'>
                        <span className="font-bold text-sm min-w-32 text-left">ID:</span>
                        <span className="font-mono text-muted-foreground text-sm">{subscription.app.id}</span>
                      </li>
                      <li className='grid grid-cols-[auto_1fr]'>
                        <span className="font-bold text-sm min-w-32 text-left">Приложение:</span>
                        <span className="text-muted-foreground text-sm">{subscription.app.name}</span>
                      </li>
                      <li className='grid grid-cols-[auto_1fr]'>
                        <span className="font-bold text-sm min-w-32 text-left">Игра:</span>
                        <span className="text-muted-foreground text-sm">{subscription.game.name}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Separator className="my-8" />

      <section id="updates" className="min-h-svh space-y-4 py-8 snap-start">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Обновления</h2>
          <Button>
            <RefreshCw className="size-4" />
            Проверить обновления
          </Button>
        </div>
        <div className="rounded-lg border flex-1">
          {updatesLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <LoaderCircle className="animate-spin text-primary size-12" />
            </div>
          ) : updates?.data && updates?.data?.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Нет доступных обновлений
            </div>
          ) : (
            <ul>
              {updates?.data?.map((update) => (
                <li key={update.id}>{update.status}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Separator className="my-8" />

      <section id="settings" className="min-h-svh space-y-4 py-8 snap-start">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Настройки</h2>
        </div>
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
                {linkedAccount ? `Подключен как ${linkedAccount}` : 'Не подключен'}
              </p>
            </div>
            <div className="flex gap-2">
              {linkedAccount && (
                <Button
                  variant="outline"
                  onClick={() => {
                    clearSteamCredentials();
                    setLinkedAccount(null);
                    toast({
                      title: 'Успех',
                      description: 'Аккаунт Steam отвязан',
                    });
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
      </section>
      {currentAppAndGameIdPair && (
        <UpdateGameModal
          open={isUpdateGameModalOpen}
          onOpenChange={setIsUpdateGameModalOpen}
          app={currentAppAndGameIdPair.app}
          game={currentAppAndGameIdPair.game}
        />
      )}
    </div>
  )
}
