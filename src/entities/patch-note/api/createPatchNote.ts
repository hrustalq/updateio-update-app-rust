import { apiClient } from "@/api/client"
import { CreatePatchNoteData } from "../patch-note.entity"

export default async function createPatchNote(data: CreatePatchNoteData) {
  const response = await apiClient.POST("/api/patch-notes", { body: data })
  return response.data
} 
