import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Button from './ui/button'
import Input from './ui/input'
import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useToast } from '@/hooks/use-toast'
import { LoaderCircle } from 'lucide-react'

export default function SteamGuardCodeModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const onOpenChange = (open: boolean) => setOpen(open)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setLoading(true)
      await invoke('submit_2fa_code', { code: e.currentTarget.code.value })
      setOpen(false)
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить код двухфакторной аутентификации',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Введите код двухфакторной аутентификации
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="text" placeholder="Код" />
          <Button type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="animate-spin" /> : 'Отправить'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
