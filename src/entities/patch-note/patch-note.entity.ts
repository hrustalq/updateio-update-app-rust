import { PaginatedResponse } from "@/api/types"

export type PatchNote = {
  id: string
  title: string
  content: string
  version?: string
  releaseDate: string
  gameId: string
  appId: string
  createdAt: string
  updatedAt: string
}

export type GetPatchNotesResponse = PaginatedResponse<PatchNote>

export type CreatePatchNoteData = {
  title: string
  content: string
  version?: string
  releaseDate: string
  gameId: string
  appId: string
}

export type UpdatePatchNoteData = Partial<CreatePatchNoteData> 