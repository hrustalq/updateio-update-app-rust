import { apiClient } from "@/api/client"

export default async function loginWithQRCode(code: string) {
  const response = await apiClient.POST("/api/auth/qr-code/login", { body: { code } })
  return response.data
} 
