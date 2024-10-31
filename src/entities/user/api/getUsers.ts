import { apiClient } from "@/api/client"
import { PaginationParams } from "@/api/types"

export default async function getUsers(params?: PaginationParams) {
  const response = await apiClient.GET("/api/users", { params: { query: params } })
  return response.data
} 
