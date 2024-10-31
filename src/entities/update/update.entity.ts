import { PaginatedResponse } from "@/api/types"

export type UpdateRequestStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export type UpdateRequest = {
  id: string
  status: UpdateRequestStatus
  gameId: string
  appId: string
  userId: string
  createdAt: string
  updatedAt: string
}

export type GetUpdateRequestsResponse = PaginatedResponse<UpdateRequest>

export type CreateUpdateRequestData = {
  gameId: string
  appId: string
}

export type CreateUpdateRequestWithSystemData = CreateUpdateRequestData & {
  userId: string
} 