import { Container, Flex } from '@radix-ui/themes'
import { Outlet, createFileRoute } from '@tanstack/react-router'

import { PageHeaderCardSkeleton } from '@/components/layout/page-header-card'
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
  /**
   * TODO: read below
   * pendingComponent is made for the loader.
   * there isn't an equivalent for the beforeLoad.
   * avoid using beforeLoad if you can use load instead.
   */
  pendingComponent: () => {
    return (
      <Container size="4">
        <Flex direction="column" gap="4">
          <PageHeaderCardSkeleton />
        </Flex>
      </Container>
    )
  },
  component: () => {
    return <Outlet />
  },
})
