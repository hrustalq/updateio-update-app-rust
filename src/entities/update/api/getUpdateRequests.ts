import { apiClient } from "@/api/client"
import { PaginationParams } from "@/api/types"

export default async function getUpdateRequests(params?: PaginationParams) {
  const response = await apiClient.GET("/api/updates", { params: { query: params } })
  return response.data
} 
