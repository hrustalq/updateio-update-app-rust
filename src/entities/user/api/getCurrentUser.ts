import { apiClient } from "@/api/client"

export default async function getCurrentUser() {
  const response = await apiClient.GET("/api/users/me")
  return response.data
} 
