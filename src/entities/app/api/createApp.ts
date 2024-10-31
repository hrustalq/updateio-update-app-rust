import { apiClient } from "@/api/client"
import { App, CreateAppData } from "../app.entity"

export default async function createApp(data: CreateAppData): Promise<App> {
  const formData = new FormData()
  formData.append('name', data.name)
  if (data.image) {
    formData.append('image', data.image)
  }
  
  const response = await apiClient.post('/apps', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.json()
} 