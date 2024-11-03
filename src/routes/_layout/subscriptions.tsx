import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Skeleton from '@/components/ui/skeleton'
import getSubscriptions from '@/entities/subscription/api/getSubscriptions'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/subscriptions')({
  component: Subscriptions,
  beforeLoad: () => {
    return {
      header: 'Подписки',
    }
  },
})

function Subscriptions() {
  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => getSubscriptions(),
  })

  return (
    <div className="h-full flex flex-col gap-y-6">
      <div className="rounded-lg border flex-1">
        {subscriptionsLoading ? (
            <div className="p-4 text-center text-muted-foreground grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <Skeleton key={index} className="w-full animate-pulse h-40" />
              ))}
            </div>
          ) : subscriptions?.data.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Нет активных подписок
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subscriptions?.data.map((subscription) => (
                <Card
                  key={subscription.id}
                  className="flex flex-col relative overflow-hidden"
                >
                  <CardHeader>
                    <CardTitle>{subscription.id}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="flex flex-col gap-y-1 w-full items-start">
                      <li className="grid grid-cols-[auto_1fr]">
                        <span className="font-bold text-sm min-w-32 text-left">
                          ID:
                        </span>
                        <span className="font-mono text-muted-foreground text-sm">
                          {subscription.app.id}
                        </span>
                      </li>
                      <li className="grid grid-cols-[auto_1fr]">
                        <span className="font-bold text-sm min-w-32 text-left">
                          Приложение:
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {subscription.app.name}
                        </span>
                      </li>
                      <li className="grid grid-cols-[auto_1fr]">
                        <span className="font-bold text-sm min-w-32 text-left">
                          Игра:
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {subscription.game.name}
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
    </div>
  )
}
