import { apiClient } from "@/api/client"

export default async function generateQRCode() {
  const response = await apiClient.POST("/api/auth/qr-code/generate")
  return response.data
} 
