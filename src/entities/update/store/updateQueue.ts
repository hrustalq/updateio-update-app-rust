import { create } from 'zustand'

export type UpdateStatus = 'pending' | 'updating' | 'completed' | 'failed'

export interface QueuedUpdate {
  id: string
  gameId: string
  gameName: string
  status: UpdateStatus
  message?: string
  timestamp: number
}

interface UpdateQueueStore {
  queue: QueuedUpdate[]
  addToQueue: (update: Omit<QueuedUpdate, 'timestamp'>) => void
  updateStatus: (id: string, status: UpdateStatus, message?: string) => void
  removeFromQueue: (id: string) => void
  clearCompleted: () => void
}

export const useUpdateQueue = create<UpdateQueueStore>((set) => ({
  queue: [],
  addToQueue: (update) => set((state) => ({
    queue: [...state.queue, {
      ...update,
      timestamp: Date.now()
    }]
  })),
  updateStatus: (id, status, message) => set((state) => ({
    queue: state.queue.map(update => 
      update.id === id ? { ...update, status, message } : update
    )
  })),
  removeFromQueue: (id) => set((state) => ({
    queue: state.queue.filter(update => update.id !== id)
  })),
  clearCompleted: () => set((state) => ({
    queue: state.queue.filter(update => 
      !['completed', 'failed'].includes(update.status)
    )
  }))
})) 