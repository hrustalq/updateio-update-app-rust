import { apiClient } from "@/api/client"
import { CreateSettingsData } from "../settings.entity"

export default async function createSettings(data: CreateSettingsData) {
  const response = await apiClient.POST("/api/settings", { body: data })
  return response.data
} 
