import { apiClient } from "@/api/client"
import { CreateUpdateRequestData } from "../update.entity"

export default async function createUpdateRequest(data: CreateUpdateRequestData) {
  const response = await apiClient.POST("/api/updates/request", { body: data })
  return response.data
} 
