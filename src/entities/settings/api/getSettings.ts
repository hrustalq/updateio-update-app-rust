import { apiClient } from "@/api/client"
import { PaginationParams } from "@/api/types"

export type GetSettingsParams = PaginationParams & {
  appId: string
  gameId: string
}

export default async function getSettings(params: GetSettingsParams) {
  const response = await apiClient.GET("/api/settings", { params: { query: params } })
  return response.data
} 
