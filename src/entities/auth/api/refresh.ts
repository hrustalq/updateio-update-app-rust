import { apiClient } from "@/api/client"

export default async function refresh() {
  return await apiClient.POST("/api/auth/refresh")
} 
