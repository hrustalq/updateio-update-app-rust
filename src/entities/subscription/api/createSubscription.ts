import { apiClient } from "@/api/client"
import { CreateSubscriptionData } from "../subscription.entity"

export default async function createSubscription(data: CreateSubscriptionData) {
  const response = await apiClient.POST("/api/subscriptions", { body: data })
  return response.data
} 
