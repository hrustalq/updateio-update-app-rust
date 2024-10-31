import apiClient from "@/api/client"

export default async function getUpdates() {
  const response = await apiClient.GET('/api/updates')
  return response.data
}
