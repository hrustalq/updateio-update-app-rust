import { apiClient } from "@/api/client"
import { CreateUserData } from "../user.entity"

export default async function createUser(data: CreateUserData) {
  const response = await apiClient.POST("/api/users", { body: data })
  return response.data
} 