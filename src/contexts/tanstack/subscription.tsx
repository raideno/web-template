import type { FunctionReturnType } from 'convex/server'

import { api } from '@/convex.generated/api'
import { convex } from '@/main'

export interface SubscriptionContextType {
  subscription:
    | FunctionReturnType<typeof api.stripe.subscription>
    | null
    | undefined
  isSubscribed: boolean
  isLoading: boolean
  // TODO: add subscription related functions
  // TODO: expose more derived states from subscription
}

export async function loadSubscriptionContext(): Promise<SubscriptionContextType> {
  const subscription = await convex.query(api.stripe.subscription, {})

  const isSubscribed = Boolean(subscription && subscription.status === 'active')

  return {
    subscription,
    isSubscribed,
    isLoading: false,
  }
}
