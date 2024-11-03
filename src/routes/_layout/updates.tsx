import getUpdates from '@/entities/update/api/getUpdates'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { LoaderCircle } from 'lucide-react'

export const Route = createFileRoute('/_layout/updates')({
  component: Updates,
  beforeLoad: () => {
    return {
      header: 'Обновления',
    }
  },
})

function Updates() {
  const { data: updates, isLoading: updatesLoading } = useQuery({
    queryKey: ['updates'],
    queryFn: () => getUpdates(),
  })

  return (
    <div className="h-full flex flex-col gap-y-6">
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
    </div>
  )
}
