import { apiClient } from "@/api/client"
import { PaginationParams } from "@/api/types"

export type GetGamesParams = PaginationParams & {
  appId?: string
  appName?: string
  name?: string
}

export default async function getGames(params?: GetGamesParams) {
  const response = await apiClient.GET("/api/games", { params: { query: params } })
  return response.data
} 
