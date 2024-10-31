import { PaginatedResponse } from "@/api/types"

export type Game = {
  id: string
  name: string
  image: string | null
  version?: number
}

export type GetGamesResponse = PaginatedResponse<Game>

export type CreateGameData = {
  name: string
  appIds: string[]
  version?: number
  image?: File
}

export type UpdateGameData = Partial<CreateGameData> 