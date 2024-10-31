import { apiClient } from "@/api/client"
import { PaginationParams } from "@/api/types"

export default async function getSubscriptions(params?: PaginationParams) {
  const response = await apiClient.GET("/api/subscriptions", { params: { query: params } })
  return response.data
} 
