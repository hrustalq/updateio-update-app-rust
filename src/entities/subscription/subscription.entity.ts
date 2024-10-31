import { PaginatedResponse } from "@/api/types"
import { App } from "../app/app.entity"
import { Game } from "../game/game.entity"

export type Subscription = {
  id: string
  isSubscribed: boolean
  app: App
  game: Game
}

export type GetSubscriptionsResponse = PaginatedResponse<Subscription>

export type CreateSubscriptionData = {
  gameId: string
  appId: string
  isSubscribed: boolean
}

export type UpdateSubscriptionData = Partial<CreateSubscriptionData> 