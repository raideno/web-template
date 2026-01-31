import { Box, Card, Heading, Text } from '@radix-ui/themes'
import { createFileRoute, redirect } from '@tanstack/react-router'

import {
  REDIRECT_TO_SEARCH_PARAM_NAME,
  REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME,
} from '@/constants/search'

export const Route = createFileRoute('/(main)/dashboard/whatsapp')({
  beforeLoad: ({ context }) => {
    if (!context.authentication.isAuthenticated || !context.authentication.user)
      throw redirect({
        to: '/',
        search: {
          [REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME]: true,
          [REDIRECT_TO_SEARCH_PARAM_NAME]: '/dashboard',
        },
      })

    const href = `https://wa.me/${context.phone.phone}`

    window.location.href = href

    return
  },
  pendingComponent: () => {
    return (
      <Card className="p-0!" size="4">
        <Box p="4">
          <Heading size="5">Redirecting...</Heading>
          <Text color="gray" size="2">
            Please wait while we redirect you to WhatsApp.
          </Text>
        </Box>
      </Card>
    )
  },
  component: () => {
    return (
      <Card className="p-0!" size="4">
        <Box p="4">
          <Heading size="5">Redirecting...</Heading>
          <Text color="gray" size="2">
            Please wait while we redirect you to WhatsApp.
          </Text>
        </Box>
      </Card>
    )
  },
})
