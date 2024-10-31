import { apiClient } from "@/api/client"

export default async function getUser(id: string) {
  const response = await apiClient.GET("/api/users/{id}", { params: { path: { id } } })
  return response.data
} 
