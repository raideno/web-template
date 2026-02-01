import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import {
  Button,
  Callout,
  Card,
  Container,
  Flex,
  Heading,
  Text,
} from '@radix-ui/themes'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import z from 'zod'

import {
  REDIRECT_TO_SEARCH_PARAM_NAME,
  REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME,
} from '@/constants/search'
import { api } from '@/convex/_generated/api'
import { convex } from '@/main'

export const Route = createFileRoute('/(main)/dashboard/subscribe')({
  validateSearch: z.object({
    redirect: z.enum(['onboarding', 'whatsapp', 'dashboard']).optional(),
    isNew: z.boolean().optional(),
  }),
  beforeLoad: async ({ context, search }) => {
    if (!context.user.isAuthenticated || !context.user.user) {
      throw redirect({
        to: '/',
        search: {
          [REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME]: true,
          [REDIRECT_TO_SEARCH_PARAM_NAME]: '/dashboard',
        },
      })
    }

    const mapping = {
      onboarding: '/dashboard/onboardings',
      whatsapp: '/dashboard/whatsapp',
      dashboard: '/dashboard',
    }

    const response = await convex.action(api.stripe.subscribe, {
      // TODO: replace with default priceId
      priceId: 'price_1NExxSGXq8Y5kX6Y2YhY1KzL',
      successRedirectUrl: `${window.location.origin}${
        mapping[search.redirect || 'dashboard']
      }`,
      cancelRedirectUrl: `${window.location.origin}/dashboard`,
    })

    if (response.url) {
      window.location.href = response.url
      return
    }
  },
  errorComponent: ({ error }) => {
    return (
      <Container size="4">
        <Flex direction="column" gap="4" mt="6">
          <Card className="w-full" size="4">
            <Flex direction="column" gap="3">
              <Heading>Subscribe</Heading>
              <Callout.Root color="red">
                <Callout.Icon>
                  <ExclamationTriangleIcon />
                </Callout.Icon>
                <Callout.Text>
                  An unexpected error occurred: {error.message}
                </Callout.Text>
              </Callout.Root>
              <Flex gap="3" className="w-full!">
                <Link to="/dashboard" className="w-full!">
                  <Button variant="classic" className="w-full!">
                    Go to dashboard
                  </Button>
                </Link>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </Container>
    )
  },
  pendingComponent: () => {
    return (
      <Container size="4">
        <Flex direction="column" gap="4" mt="6">
          <Card size="4">
            <Flex direction="column" gap="3" align="center">
              <Flex direction="column" justify={'center'} align="center">
                <Heading>Preparing checkout…</Heading>
                <Text color="gray">
                  Please wait while we prepare your secure payment link.
                </Text>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </Container>
    )
  },
  component: () => {
    return (
      <Container size="4">
        <Flex direction="column" gap="4" mt="6">
          <Card size="4">
            <Flex direction="column" gap="3" align="center">
              <Flex direction="column" justify={'center'} align="center">
                <Heading>Preparing checkout…</Heading>
                <Text color="gray">
                  Please wait while we prepare your secure payment link.
                </Text>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </Container>
    )
  },
})
