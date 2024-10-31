import { PaginatedResponse } from "@/api/types"

export type App = {
  id: string
  name: string
  image: string | null
}

export type GetAppsResponse = PaginatedResponse<App>

export type CreateAppData = {
  name: string
  image?: File
}

export type UpdateAppData = Partial<CreateAppData> 