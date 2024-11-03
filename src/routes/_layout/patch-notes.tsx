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
import getPatchNotes from '@/entities/patch-note/api/getPatchNotes'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Calendar, Search } from 'lucide-react'

export const Route = createFileRoute('/_layout/patch-notes')({
  component: PatchNotes,
  beforeLoad: () => {
    return {
      header: 'Новости обновлений',
    }
  },
})

function PatchNotes() {
  const { data: patchNotes, isLoading: patchNotesLoading } = useQuery({
    queryKey: ['patchNotes'],
    queryFn: () => getPatchNotes(),
  })

  return (
    <div className="h-full flex flex-col gap-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Поиск патч-нотов..." />
        </div>
        <div className="rounded-lg border flex-1">
          {patchNotesLoading ? (
            <div className="p-4 text-center text-muted-foreground grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <Skeleton key={index} className="w-full animate-pulse h-40" />
              ))}
            </div>
          ) : patchNotes?.data.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Нет доступных патч-нотов
            </div>
          ) : (
          <div className="p-4 text-center text-muted-foreground grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {patchNotes?.data.map((patchNote) => (
              <Card
                key={patchNote.id}
                className="flex flex-col relative overflow-hidden"
              >
                <CardHeader>
                  <CardTitle>{patchNote.title}</CardTitle>
                </CardHeader>
                <CardContent>{patchNote.content}</CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline">
                    <Calendar className="size-4" />
                    {new Date(patchNote.releaseDate).toLocaleDateString(
                      'ru-RU',
                      { year: 'numeric', month: 'long', day: 'numeric' },
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
