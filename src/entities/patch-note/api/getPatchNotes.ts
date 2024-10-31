import { apiClient } from "@/api/client"
import { PaginationParams } from "@/api/types"

export type GetPatchNotesParams = PaginationParams & {
  gameId?: string
  appId?: string
}

export default async function getPatchNotes(params?: GetPatchNotesParams) {
  const response = await apiClient.GET("/api/patch-notes", { params: { query: params } })
  return response.data
} 
