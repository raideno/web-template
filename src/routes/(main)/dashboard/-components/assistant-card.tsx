import { convexQuery } from '@convex-dev/react-query'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import {
  Box,
  Card,
  Flex,
  Heading,
  IconButton,
  Separator,
  Skeleton,
  Text,
} from '@radix-ui/themes'
import { AutoForm } from '@raideno/auto-form/ui'
import { useQuery } from '@tanstack/react-query'
import { useMutation } from 'convex/react'
import React from 'react'
import { toast } from 'sonner'

import { api } from '@/convex.generated/api'
import { useLocalStorageState } from '@/hooks/local-stroage-state'
import {
  createAgentSchema,
  getAllTraits,
  traitDefaultValues,
} from '@/lib/agent-schema'
import { cn } from '@/lib/utils'

export function AssistantCard() {
  const { data: agent } = useQuery(convexQuery(api.agents.mine, {}))
  const { data: presets } = useQuery(convexQuery(api.presets.list, {}))

  const update = useMutation(api.agents.update)

  const [isLoading, setIsLoading] = React.useState(false)
  const [isOpen, setIsOpen] = useLocalStorageState(
    'assistant-card.is-open',
    false,
  )

  const AgentSchema = React.useMemo(() => {
    return presets ? createAgentSchema(presets) : null
  }, [presets])

  const handleSubmit = async (data: any) => {
    if (!agent || !AgentSchema || !presets || presets.length === 0) return

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

      await update({
        name: data.name,
        instructions: data.instructions || '',
        traits,
      })
      toast.success('Assistant updated successfully')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!presets || !AgentSchema) {
    return (
      <Card size="4" className="p-0!">
        <Box p="4">
          <Heading>Assistant</Heading>
          <Skeleton height={'24px'} />
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
          name: agent?.name || '',
          instructions: agent?.instructions || '',
          ...agent?.traits.reduce(
            (acc, trait) => {
              acc[trait.id] = trait.intensity
              return acc
            },
            {} as Record<string, number>,
          ),
          // ...traitDefaultValues(presets),
        }}
      >
        <Box
          p="4"
          className="cursor-pointer transition-all hover:backdrop-brightness-95 active:backdrop-brightness-90"
          onClick={() => setIsOpen((old) => !old)}
        >
          <Flex
            direction={'row'}
            justify={'between'}
            align={'center'}
            gap={'2'}
          >
            <Box>
              <Heading>Assistant</Heading>
              <Text className="line-clamp-1" color="gray">
                Personalize your assistant's name, personality traits and
                instructions.
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
              <AutoForm.Content fields={['name']} />
            </Box>

            <Separator size="4" orientation="horizontal" className="w-full!" />

            <Box p="4">
              <AutoForm.Content fields={['preset', ...traitFieldKeys]} />
            </Box>

            <Separator size="4" orientation="horizontal" className="w-full!" />

            <Box p="4">
              <AutoForm.Content fields={['instructions']} />
            </Box>

            <Separator size="4" orientation="horizontal" className="w-full!" />

            <Box p="4">
              <AutoForm.Actions className="w-full flex justify-between gap-3">
                <AutoForm.Action
                  loading={isLoading}
                  variant="outline"
                  color="gray"
                  type="reset"
                >
                  Cancel Changes
                </AutoForm.Action>
                <AutoForm.Action
                  loading={isLoading}
                  variant="classic"
                  type="submit"
                >
                  Save Changes
                </AutoForm.Action>
              </AutoForm.Actions>
            </Box>
          </>
        )}
      </AutoForm.Root>
    </Card>
  )
}
