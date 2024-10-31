import { apiClient } from "@/api/client"
import { UpdateUserData } from "../user.entity"

export default async function updateUser(id: string, data: UpdateUserData) {
  const response = await apiClient.PATCH("/api/users/{id}", { body: data, params: { path: { id } } })
  return response.data
} 
