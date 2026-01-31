import { redirect } from '@tanstack/react-router'

import type { FunctionReturnType } from 'convex/server'

import type { api } from '@/convex.generated/api'

import {
  REDIRECT_TO_SEARCH_PARAM_NAME,
  REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME,
} from '@/constants/search'

export type OnboardingItem = NonNullable<
  FunctionReturnType<typeof api.onboardings.list>
>[number]

export type OnboardingPath =
  | '/dashboard/onboardings/agent'
  | '/dashboard/onboardings/profile'

export const resolveOnboardingPath = (
  id: OnboardingItem['id'],
): OnboardingPath => {
  if (id === 'agent') return '/dashboard/onboardings/agent'
  if (id === 'profile') return '/dashboard/onboardings/profile'
  throw new Error(`Unknown onboarding id: ${id}`)
}

/**
 * Find the next onboarding that should be shown to the user.
 * Only considers onboardings that are:
 * - Not the current one
 * - Either not completed OR outdated
 * - NOT optIn (optIn onboardings are skipped unless user explicitly opts in)
 *
 * Prioritizes required onboardings first.
 */
export const nextOnboardingPath = (
  list: Array<OnboardingItem>,
  currentId: string,
): string | undefined => {
  const remaining = list.filter(
    (o) => o.id !== currentId && (!o.completed || o.outdated) && !o.optIn, // Skip optIn onboardings in the flow
  )
  if (!remaining.length) return undefined
  const required = remaining.filter((o) => o.required)
  const next = required[0] ?? remaining[0]
  return resolveOnboardingPath(next.id)
}

/**
 * Check if user is authenticated and handle onboarding flow redirects.
 *
 * @param isAuthenticated - Whether the user is authenticated
 * @param user - The authenticated user or null
 * @param onboardings - List of onboarding items
 * @param currentOnboardingId - The ID of the current onboarding page
 * @param currentPath - The path of the current onboarding page
 */
export const handleOnboardingBeforeLoad = (
  isAuthenticated: boolean,
  user: any,
  onboardings: Array<OnboardingItem> | undefined | null,
  currentOnboardingId: string,
  currentPath: string,
) => {
  if (!isAuthenticated || !user) {
    throw redirect({
      to: '/',
      search: {
        [REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME]: true,
        [REDIRECT_TO_SEARCH_PARAM_NAME]: currentPath,
      },
    })
  }

  if (onboardings) {
    const current = onboardings.find((o) => o.id === currentOnboardingId)

    if (current && current.completed && !current.outdated) {
      const next = nextOnboardingPath(onboardings, currentOnboardingId)
      throw redirect({ to: next ?? '/dashboard' })
    }
  }
}

/**
 * Determine if the current onboarding can be skipped.
 */
export const canSkipOnboarding = (
  onboardings: Array<OnboardingItem> | undefined | null,
  onboardingId: string,
): boolean => {
  if (!onboardings) return false
  const current = onboardings.find((o) => o.id === onboardingId)
  return current ? !current.required : false
}
