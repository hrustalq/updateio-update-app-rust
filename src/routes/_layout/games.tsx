import Button from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Input from '@/components/ui/input'
import Skeleton from '@/components/ui/skeleton'
import UpdateGameModal from '@/components/update-game-modal'
import getGames from '@/entities/game/api/getGames'
import getApps from '@/entities/app/api/getApps'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { LoaderCircle, RefreshCw, Search } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export const Route = createFileRoute('/_layout/games')({
  component: Games,
  beforeLoad: () => {
    return {
      header: 'Игры',
    }
  },
})

function Games() {
  const { toast } = useToast()
  const [gameGameId, setGameGameId] = useState<string | null>(null)

  const { data: games, isLoading: gamesLoading } = useQuery({
    queryKey: ['games'],
    queryFn: () => getGames(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
  const { data: apps, isLoading: appsLoading, refetch: refetchApps } = useQuery({
    queryKey: ['apps', gameGameId],
    queryFn: () => getApps({ gameId: gameGameId! }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled: !!gameGameId,
  })

  const [currentAppAndGameIdPair, setCurrentAppAndGameIdPair] = useState<{
    game: { id: string; name: string }
    app: { id: string; name: string }
  } | null>(null)

  const [isUpdateGameModalOpen, setIsUpdateGameModalOpen] = useState(false)
  const handleUpdateButtonClick = async (gameId: string) => {
    setGameGameId(gameId)
    try {
      await refetchApps()
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
    } finally {
      setGameGameId(null)
    }
  }

  return (
    <div className="grow w-full flex flex-col gap-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Поиск приложений..." />
      </div>
      <div className="rounded-lg border flex-1 w-full">
        {gamesLoading ? (
          <div className="p-4 text-center text-muted-foreground grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
                <Skeleton key={index} className="w-full animate-pulse h-40" />
              ))}
          </div>
        ) : games?.data.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
              Нет доступных игр
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {games?.data.map((game) => (
                <Card
                  key={game.id}
                  className="flex flex-col relative overflow-hidden"
                >
                  <CardHeader className="relative min-h-20">
                    {game.image && (
                      <img
                        className="h-12 w-12 place-content-center absolute top-1/2 -translate-y-1/2 right-2 opacity-90 backdrop-blur-sm rounded-full"
                        src={game.image}
                        alt={game.name}
                        width={100}
                        height={30}
                      />
                    )}
                    <CardTitle>{game.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-y-2 grow z-10">
                    <ul className="flex flex-col gap-y-1 w-full items-start">
                      <li className="grid grid-cols-[auto_1fr]">
                        <span className="font-bold text-sm min-w-20 text-left">
                          ID:
                        </span>
                        <span className="font-mono text-muted-foreground text-sm">
                          {game.id}
                        </span>
                      </li>
                      <li className="grid grid-cols-[auto_1fr]">
                        <span className="font-bold text-sm min-w-20 text-left">
                          Название:
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {game.name}
                        </span>
                      </li>
                      {game.version && (
                        <li className="grid grid-cols-[auto_1fr]">
                          <span className="font-bold text-sm min-w-20 text-left">
                            Версия:
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {game.version}
                          </span>
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
                      <RefreshCw className="size-4" />
                      {appsLoading ? (
                        <LoaderCircle className="animate-spin size-4" />
                      ) : (
                        'Обновить'
                      )}
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
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
