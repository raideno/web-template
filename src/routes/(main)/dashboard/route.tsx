import { Outlet, createFileRoute } from '@tanstack/react-router'

import { loadOnboardingsContext } from '@/contexts/tanstack/onboardings'
import { loadSubscriptionContext } from '@/contexts/tanstack/subscription'
import { loadUserContext } from '@/contexts/tanstack/user'

export const Route = createFileRoute('/(main)/dashboard')({
  beforeLoad: async () => {
    const [userContext, subscriptionContext, onboardingsContext] =
      await Promise.all([
        loadUserContext(),
        loadSubscriptionContext(),
        loadOnboardingsContext(),
      ])

    return {
      user: userContext,
      subscription: subscriptionContext,
      onboardings: onboardingsContext,
    }
  },
  component: () => {
    return <Outlet />
  },
})
