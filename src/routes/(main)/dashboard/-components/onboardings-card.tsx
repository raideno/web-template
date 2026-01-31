import { convexQuery } from '@convex-dev/react-query'
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Progress,
  Text,
} from '@radix-ui/themes'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import type { FunctionReturnType } from 'convex/server'

import { api } from '@/convex.generated/api'

type OnboardingItem = NonNullable<
  FunctionReturnType<typeof api.onboardings.list>
>[number]

const resolveOnboardingPath = (
  id: OnboardingItem['id'],
): '/dashboard/onboardings/agent' | '/dashboard/onboardings/profile' | null => {
  switch (id) {
    case 'agent':
      return '/dashboard/onboardings/agent'
    case 'profile':
      return `/dashboard/onboardings/${id}`
    default:
      return null
      break
  }
}

const pickNextOnboarding = (
  onboardings: Array<OnboardingItem> | undefined,
): OnboardingItem | undefined => {
  if (!onboardings) return undefined

  const remaining = onboardings.filter((o) => !o.completed || o.outdated)

  if (!remaining.length) return undefined

  const required = remaining.filter((o) => o.required)

  return required[0] ?? remaining[0]
}

export interface OnboardingsCardProps {}

export const OnboardingsCard: React.FC<OnboardingsCardProps> = () => {
  const { data: onboardings } = useQuery(convexQuery(api.onboardings.list, {}))

  const total = onboardings?.length ?? 0
  const remaining = onboardings?.filter((o) => !o.completed || o.outdated) ?? []
  const completed = total - remaining.length

  const next = pickNextOnboarding(onboardings)

  // Nothing to show if all completed
  if (!total || remaining.length === 0) return null

  const nextPath = next
    ? resolveOnboardingPath(next.id) || '/dashboard'
    : '/dashboard'

  return (
    <Card
      size="4"
      className="p-0! border-0! relative overflow-hidden bg-(--accent-9)"
    >
      <Box p="4">
        <Flex direction="column" gap="3">
          <Flex justify={'between'}>
            <Box>
              <Heading>Complete Onboarding</Heading>
              <Text size="2">
                Finish setup to unlock your full assistant experience.
              </Text>
            </Box>
            <Box>
              <Badge size="3" variant="surface">
                {completed}/{total} completed
              </Badge>
            </Box>
          </Flex>
          <Progress size="2" value={completed} max={total} />
          <Button
            asChild
            size="3"
            variant="classic"
            className="w-full!"
            color="green"
          >
            <Link to={nextPath}>Continue</Link>
          </Button>
        </Flex>
      </Box>
    </Card>
  )
}
