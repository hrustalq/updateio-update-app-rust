import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import Button from "@/components/ui/button";
import getSettings from "@/entities/settings/api/getSettings";
import { useMutation, useQuery } from "@tanstack/react-query";
import { updateGame } from "@/entities/game/api/updateGame";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";
import { useUpdateQueue } from '@/entities/update/store/updateQueue'

interface UpdateGameModalProps {
  open: boolean
  app: {
    name: string
    id: string
  }
  game: {
    name: string
    id: string
  }
  onOpenChange: (open: boolean) => void
}

export default function UpdateGameModal({ open, onOpenChange, app, game }: UpdateGameModalProps) {
  const { addToQueue, updateStatus } = useUpdateQueue()
  const { toast } = useToast()

  const { data: settings } = useQuery({
    queryKey: ['settings', app.id, game.id],
    queryFn: () => getSettings({ appId: app.id, gameId: game.id })
  })

  const updateGameMutation = useMutation({
    mutationFn: async (command: number) => {
      // Create queue item and get its ID
      const queueId = crypto.randomUUID();
      addToQueue({
        id: queueId, // Add ID explicitly
        gameId: game.id,
        gameName: game.name,
        status: 'pending'
      });
      
      try {
        const result = await updateGame(command);
        updateStatus(queueId, 'completed', result);
        return result;
      } catch (error) {
        if (error instanceof Error) {
          updateStatus(queueId, 'failed', error.message);
        } else {
          updateStatus(queueId, 'failed', 'Неизвестная ошибка');
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Успех',
        description: 'Игра добавлена в очередь обновлений',
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: `Не удалось обновить игру: ${error}`,
      });
    }
  });

  const handleUpdateGame = () => {
    const command = settings?.data[0]?.updateCommand
    if (!command) return
    updateGameMutation.mutate(+command)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogDescription>
        Обновление игры может занять некоторое время, поэтому будьте терпеливы.
      </DialogDescription>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Обновление игры {game.name}</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Button onClick={handleUpdateGame} disabled={updateGameMutation.isPending}>
                {updateGameMutation.isPending ? <LoaderCircle className="animate-spin" /> : 'Обновить'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
