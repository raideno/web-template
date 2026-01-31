import { convexQuery } from '@convex-dev/react-query'
import { Box, Card, Heading, Separator, Text } from '@radix-ui/themes'
import { AutoForm } from '@raideno/auto-form/ui'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import React from 'react'

import {
  canSkipOnboarding,
  handleOnboardingBeforeLoad,
  nextOnboardingPath,
} from './_utils'

import { api } from '@/convex.generated/api'
import {
  createAgentSchema,
  getAllTraits,
  traitDefaultValues,
} from '@/lib/agent-schema'

const DEFAULT_AGENT_NAME = 'Alex'

export const Route = createFileRoute('/(main)/dashboard/onboardings/agent')({
  beforeLoad: ({ context }) => {
    handleOnboardingBeforeLoad(
      context.authentication.isAuthenticated,
      context.authentication.user,
      context.onboardings.onboardings,
      'agent',
      '/dashboard/onboardings/agent',
    )
  },
  component: () => {
    const { data: presets } = useQuery(convexQuery(api.presets.list, {}))

    const onboard = useMutation(api.onboardings.onboard)
    const navigate = Route.useNavigate()

    const routeContext = Route.useRouteContext()
    const onboardings = routeContext.onboardings.onboardings

    const [isLoading, setIsLoading] = React.useState(false)

    const AgentSchema = React.useMemo(() => {
      return presets ? createAgentSchema(presets) : null
    }, [presets])

    const handleSubmit = async (data: any) => {
      if (!presets || presets.length === 0) return

      try {
        setIsLoading(true)

        const allTraits = getAllTraits(presets)

        const traits = allTraits.map((traitDef) => {
          const intensity = Number(data[traitDef.id] ?? 5) as
            | 0
            | 1
            | 2
            | 3
            | 4
            | 5
            | 6
            | 7
            | 8
            | 9
            | 10
          const characteristics = traitDef.characteristics
          const content = characteristics[`_${intensity}`] || ''
          return {
            id: traitDef.id,
            name: traitDef.name,
            description: traitDef.description,
            icon: traitDef.icon,
            intensity,
            content,
          }
        })

        await onboard({
          id: 'agent',
          data: {
            name: data.name,
            instructions: data.instructions || '',
            traits,
          },
        })
        if (onboardings) {
          const next = nextOnboardingPath(onboardings, 'agent')
          navigate({ to: next ?? '/dashboard' })
        } else {
          navigate({ to: '/dashboard' })
        }
      } finally {
        setIsLoading(false)
      }
    }

    const handleSkip = () => {
      if (onboardings) {
        const next = nextOnboardingPath(onboardings, 'agent')
        navigate({ to: next ?? '/dashboard' })
      } else {
        navigate({ to: '/dashboard' })
      }
    }

    const canSkip = React.useMemo(() => {
      return canSkipOnboarding(onboardings, 'agent')
    }, [onboardings])

    // TODO: add a proper pending component for the loading state
    if (!presets || !AgentSchema) {
      return (
        <Card size="4" className="p-0!">
          <Box p="4">
            <Heading>Personalize your assistant</Heading>
            <Text color="gray">Loading...</Text>
          </Box>
        </Card>
      )
    }

    const traitFieldKeys = Object.keys(traitDefaultValues(presets))

    return (
      <Card size="4" className="p-0!">
        <AutoForm.Root
          onSubmit={handleSubmit}
          schema={AgentSchema}
          defaultValues={{
            name: DEFAULT_AGENT_NAME,
            ...traitDefaultValues(presets),
          }}
        >
          <Box p="4">
            <Heading>Personalize your assistant</Heading>
            <Text color="gray">Choose a name and preferences.</Text>
          </Box>

          <Separator size="4" orientation="horizontal" className="w-full!" />

          <Box p="4">
            <AutoForm.Content fields={['name']} />
          </Box>

          <Separator size="4" orientation="horizontal" className="w-full!" />

          <Box px="4" pt={'4'}>
            <AutoForm.Content fields={['preset']} />
          </Box>

          <Box p="4">
            <AutoForm.Content fields={[...traitFieldKeys, 'instructions']} />
          </Box>

          <Separator size="4" orientation="horizontal" className="w-full!" />

          <Box p="4">
            <AutoForm.Actions className="w-full! flex justify-between gap-3">
              {canSkip ? (
                <AutoForm.Action
                  type="button"
                  variant="soft"
                  onClick={handleSkip}
                >
                  Skip
                </AutoForm.Action>
              ) : (
                <div />
              )}
              <AutoForm.Action
                loading={isLoading}
                variant="classic"
                type="submit"
              >
                Continue
              </AutoForm.Action>
            </AutoForm.Actions>
          </Box>
        </AutoForm.Root>
      </Card>
    )
  },
})
