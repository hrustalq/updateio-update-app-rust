import { apiClient } from "@/api/client"
import { PaginationParams } from "@/api/types"

export type GetAppsParams = PaginationParams & {
  name?: string
  gameId?: string
}

export default async function getApps(params?: GetAppsParams) {
  const response = await apiClient.GET('/api/apps', {
    query: params
  })
  return response.data
} 