import { createFileRoute, redirect } from '@tanstack/react-router'

import {
  REDIRECT_TO_SEARCH_PARAM_NAME,
  REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME,
} from '@/constants/search'

export const Route = createFileRoute('/(main)/dashboard/onboardings/')({
  beforeLoad: ({ context }) => {
    if (!context.user.isAuthenticated || !context.user.user) {
      throw redirect({
        to: '/',
        search: {
          [REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME]: true,
          [REDIRECT_TO_SEARCH_PARAM_NAME]: '/dashboard/onboardings',
        },
      })
    }

    const onboardings = context.onboardings.onboardings

    if (onboardings) {
      const pending = onboardings.filter((o) => !o.completed || o.outdated)

      if (pending.length > 0) {
        const sorted = [...pending].sort((a, b) => {
          if (a.required && !b.required) return -1
          if (!a.required && b.required) return 1
          return 0
        })

        const next = sorted[0]

        const pathMap: Record<string, string> = {
          agent: '/dashboard/onboardings/agent',
          profile: '/dashboard/onboardings/profile',
        }
        const to = pathMap[next.id]
        if (to) {
          throw redirect({ to })
        }
      }
    }

    throw redirect({ to: '/dashboard' })
  },
})
