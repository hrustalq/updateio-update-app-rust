import { apiClient } from "@/api/client"
import { CreateUpdateRequestWithSystemData } from "../update.entity"

export default async function createUpdateRequestWithSystem(data: CreateUpdateRequestWithSystemData) {
  const response = await apiClient.POST("/api/updates/request_system", { body: data })
  return response.data
} 
