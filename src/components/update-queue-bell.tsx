import { Bell } from 'lucide-react'
import { useUpdateQueue } from '@/entities/update/store/updateQueue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

const statusMap = {
  'pending': 'В очереди',
  'updating': 'Обновляется',
  'completed': 'Завершено',
  'failed': 'Ошибка'
} as const

export function UpdateQueueBell() {
  const { queue, clearCompleted } = useUpdateQueue()
  const pendingUpdates = queue.filter(u => ['pending', 'updating'].includes(u.status))
  
  if (queue.length === 0) return null

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="relative">
        <Bell className="size-6 hover:scale-110 transition-transform relative" />
        {pendingUpdates.length > 0 && (
          <Badge 
            variant="default"
            className="absolute -top-2 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center"
          >
            {pendingUpdates.length}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {queue.map((update) => (
          <DropdownMenuItem key={update.id} className="flex flex-col items-start p-4">
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{update.gameName}</span>
              <Badge variant={
                update.status === 'completed' ? 'default' :
                update.status === 'failed' ? 'destructive' :
                update.status === 'updating' ? 'secondary' :
                'outline'
              }>
                {statusMap[update.status]}
              </Badge>
            </div>
            {update.message && (
              <span className="text-sm text-muted-foreground">{update.message}</span>
            )}
          </DropdownMenuItem>
        ))}
        {queue.some(u => ['completed', 'failed'].includes(u.status)) && (
          <DropdownMenuItem onSelect={clearCompleted} className="justify-center text-sm cursor-pointer">
            Очистить завершенные
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 