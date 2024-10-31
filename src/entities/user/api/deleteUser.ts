import { apiClient } from "@/api/client"

export default async function deleteUser(id: string) {
  const response = await apiClient.DELETE("/api/users/{id}", { params: { path: { id } } })
  return response.data
} 
