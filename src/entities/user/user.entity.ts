import { PaginatedResponse } from "@/api/types"

export type UserRole = 'ADMIN' | 'USER' | 'GUEST'

export type User = {
  id: string
  username: string
  firstName: string
  lastName: string | null
  languageCode: string | null
  isBot: boolean | null
  allowsWriteToPm: boolean | null
  addedToAttachMenu: boolean | null
  role: UserRole
  apiKey: string
}

export type GetUsersResponse = PaginatedResponse<User>

export type CreateUserData = {
  id: string
  firstName: string
  lastName: string
  username: string
  password?: string
  languageCode: string
  isPremium: boolean
  isBot: boolean
  addedToAttachMenu: boolean
  allowsWriteToPm: boolean
  role: UserRole
}

export type UpdateUserData = Partial<CreateUserData> 