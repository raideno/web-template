import { convexQuery } from '@convex-dev/react-query'
import { ChevronDownIcon, ExternalLinkIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  IconButton,
  Progress,
  Separator,
  Text,
} from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { useAction } from 'convex/react'
import React from 'react'

import type { SubscriptionContextType } from '@/contexts/tanstack/subscription'

import { PORTAL_RETURN_URL } from '@/constants/redirect'
import { api } from '@/convex.generated/api'
import { useLocalStorageState } from '@/hooks/local-stroage-state'
import { cn } from '@/lib/utils'

interface SubscriptionCardProps {
  subscription: NonNullable<SubscriptionContextType['subscription']>
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
}) => {
  const portal = useAction(api.stripe.portal)

  const [isOpen, setIsOpen] = useLocalStorageState(
    'subscription-card.is-open',
    false,
  )

  const { data: usage } = useQuery(
    convexQuery(api.usage.get, {
      billingId: subscription.billingId,
    }),
  )

  const [isLoading, setIsLoading] = React.useState<string | null>(null)

  const handlePortal = async () => {
    setIsLoading('portal')
    try {
      const result = await portal({
        returnRedirectUrl: PORTAL_RETURN_URL,
      })
      if (result.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error('Portal error:', error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <Card size="4" className="p-0!">
      <Box
        p="4"
        className="cursor-pointer transition-all hover:backdrop-brightness-95 active:backdrop-brightness-90"
        onClick={() => setIsOpen((old) => !old)}
      >
        <Flex justify="between" align="center" gap="2">
          <Box>
            <Heading>Subscription</Heading>
            <Text color="gray" className="line-clamp-1">
              Here are the details of your current active subscription.
            </Text>
          </Box>
          <IconButton
            color="gray"
            type="button"
            variant="outline"
            className="pointer-events-none"
          >
            <ChevronDownIcon
              className={cn('transition-[rotate]', !isOpen && 'rotate-90')}
            />
          </IconButton>
        </Flex>
      </Box>

      {isOpen && (
        <>
          <Separator size="4" orientation="horizontal" className="w-full!" />

          <Box p="4">
            <Grid columns={{ initial: '1', sm: '3' }} gap="4">
              <Flex direction="column" gap="2">
                <Text size="2" color="gray">
                  Plan
                </Text>
                <Text size="3" weight="medium">
                  {subscription.price.nickname || 'Current Plan'}
                </Text>
              </Flex>
              <Flex direction="column" gap="2">
                <Text size="2" color="gray">
                  Pricing
                </Text>
                <Text size="3" weight="medium">
                  ${(subscription.price.unit_amount || 0) / 100}/
                  {subscription.price.recurring?.interval || 'month'}
                </Text>
              </Flex>
              {subscription.cancel_at_period_end ? (
                <Flex direction="column" gap="2">
                  <Text size="2" color="red">
                    Cancels on
                  </Text>
                  <Text size="3" weight="medium" color="red">
                    {new Date(
                      subscription.current_period_end * 1000,
                    ).toLocaleDateString()}
                  </Text>
                </Flex>
              ) : (
                <Flex direction="column" gap="2">
                  <Text size="2" color="gray">
                    Next Billing
                  </Text>
                  <Text size="3" weight="medium">
                    {new Date(
                      subscription.current_period_end * 1000,
                    ).toLocaleDateString()}
                  </Text>
                </Flex>
              )}
            </Grid>
          </Box>

          <Separator size="4" orientation="horizontal" className="w-full!" />

          <Box p="4">
            {/* TODO: Implement usage metrics component */}
            <Flex align={'center'} justify={'between'}>
              <Text size="2" color="gray">
                Usage
              </Text>
              <Text size="2" color="gray">
                {usage?.messages.current}/{usage?.messages.limit}
              </Text>
            </Flex>
            <Progress
              value={
                ((usage?.messages.current || 0) /
                  (usage?.messages.limit || 0)) *
                  100 || 0
              }
              className="my-2 w-full"
            />
            <Flex align={'center'} justify={'between'}>
              <Text align={'left'} size="2" color="gray">
                {(usage?.messages.limit || 0) - (usage?.messages.current || 0)}{' '}
                messages remaining.
              </Text>
              <Text align={'right'} size="2" color="gray">
                Resets{' '}
                {new Date(
                  subscription.current_period_end * 1000,
                ).toLocaleDateString()}
                .
              </Text>
            </Flex>
          </Box>

          <Separator size="4" orientation="horizontal" className="w-full!" />

          <Box p="4">
            <Button
              variant="outline"
              className="w-full!"
              onClick={handlePortal}
              disabled={isLoading === 'portal'}
              loading={isLoading === 'portal'}
            >
              <ExternalLinkIcon />
              Manage Subscription
            </Button>
          </Box>
        </>
      )}
    </Card>
  )
}
