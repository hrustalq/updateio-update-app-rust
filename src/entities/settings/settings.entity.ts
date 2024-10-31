import { PaginatedResponse } from "@/api/types"

export type Settings = {
  id: string
  appId: string
  gameId: string
  executorName: string
  updateCommand: string
}

export type GetSettingsResponse = PaginatedResponse<Settings>

export type CreateSettingsData = {
  appId: string
  gameId: string
  executorName: string
  updateCommand: string
}

export type UpdateSettingsData = Partial<CreateSettingsData> 