import { convexQuery } from '@convex-dev/react-query'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Separator,
  Skeleton,
  Table,
  Text,
} from '@radix-ui/themes'
import { toast } from 'sonner'
import { MetadataRegistry } from '@raideno/auto-form/registry'
import { AutoForm } from '@raideno/auto-form/ui'
import { useQuery } from '@tanstack/react-query'
import { useMutation } from 'convex/react'
import { CronExpressionParser } from 'cron-parser'
import React from 'react'
import { z } from 'zod'

import type { Doc, Id } from '@/convex.generated/dataModel'

import type { AnyController } from '@/components/controllers'

import { api } from '@/convex.generated/api'

import { DaysOfWeekInputController } from '@/components/controllers/days-of-week-input'
import { TextAreaWithSuggestionsControllerFactory } from '@/components/controllers/textarea-with-suggestions-input'
import {
  TimeInputController,
  TimeInputZodValidator,
} from '@/components/controllers/time-input'
import { useConfirm } from '@/components/providers/confirmation-dialog'
import { useLocalStorageState } from '@/hooks/local-stroage-state'
import { cn } from '@/lib/utils'

type Schedule = Doc<'schedules'>

const ScheduleFormSchema = z.object({
  days: z
    .array(z.number())
    .min(1, 'Select at least one day')
    .register(MetadataRegistry, {
      label: 'Days of Week',
      type: 'custom',
      controller: DaysOfWeekInputController as AnyController,
    }),
  hour: TimeInputZodValidator.register(MetadataRegistry, {
    label: 'Time of Day',
    type: 'custom',
    controller: TimeInputController as AnyController,
  }),
  instructions: z.string().register(MetadataRegistry, {
    label: 'Instructions',
    placeholder: 'e.g., Check in about my morning routine...',
    description:
      'Give your assistant context about what to talk about during this scheduled message.',
    type: 'textarea',
    controller: TextAreaWithSuggestionsControllerFactory({
      suggestions: [
        'Remind me to stay focused on my tasks for the day.',
        'Ask me about my goals for the week.',
        'Check in on my progress with my projects.',
      ],
      rows: 4,
    }) as AnyController,
  }),
})

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const formatDaysOfWeek = (schedule: Schedule): string => {
  const cron = CronExpressionParser.parse(schedule.cron)
  const days = cron.fields.dayOfWeek.values as Array<number>

  if (days.length === 7) {
    return 'Daily'
  } else if (days.length === 1) {
    return DAYS_OF_WEEK[days[0]] || 'Unknown'
  } else {
    return days
      .map((d) => DAYS_OF_WEEK[d] || '')
      .filter(Boolean)
      .join(', ')
  }
}

const formatNextScheduled = (timestamp: number): string => {
  const now = new Date()
  const diffMs = timestamp - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  )
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffDays > 0) {
    return `in ${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours}h`
  } else if (diffHours >= 1) {
    return `in ${diffHours}h ${diffMinutes}m`
  } else if (diffMinutes > 0) {
    return `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`
  } else if (diffMs > 0) {
    return 'in a few seconds'
  } else {
    return 'pending'
  }
}

export function SchedulesCard() {
  const { data: schedules } = useQuery(
    convexQuery(api.messaging.scheduling.index.list, {}),
  )

  const { data: limit } = useQuery(
    convexQuery(api.messaging.scheduling.index.limit, {}),
  )

  const confirm = useConfirm()

  const remove = useMutation(api.messaging.scheduling.index.remove)
  const create = useMutation(api.messaging.scheduling.index.create)

  const [showCreateDialog, setShowCreateDialog] = React.useState(false)

  const [isLoading, setIsLoading] = React.useState(false)

  const [isOpen, setIsOpen] = useLocalStorageState(
    'schedules-card.is-open',
    false,
  )

  const maxSchedules = limit?.limit ?? 0
  const currentCount = limit?.current ?? 0
  const canAddMore = currentCount < maxSchedules

  const handleDeleteSchedule = async (scheduleId: Id<'schedules'>) => {
    const confirmation = await confirm({
      title: 'Delete Schedule',
      body: 'Are you sure you want to delete this schedule? This action cannot be undone.',
    })

    if (confirmation) {
      try {
        setIsLoading(true)
        await remove({ scheduleId })
        toast.success('Schedule deleted successfully')
      } catch (error) {
        console.error('Failed to delete schedule:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        )
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCreateSchedule = async (
    data: z.infer<typeof ScheduleFormSchema>,
  ) => {
    try {
      setIsLoading(true)
      const offset = new Date().getTimezoneOffset() * -1 // Convert to minutes, negate for correct offset
      await create({
        days: data.days,
        hour: data.hour[0],
        minute: data.hour[1],
        offset: offset,
        instructions: data.instructions,
      })
      setShowCreateDialog(false)
      toast.success('Schedule created successfully')
    } catch (error) {
      console.error('Failed to create schedule:', error)
      toast.error(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!schedules || !limit) {
    return (
      <Card size="4" className="p-0!">
        <Box p="4">
          <Heading>Scheduled Messages</Heading>
          <Skeleton height={'24px'} />
        </Box>
      </Card>
    )
  }

  return (
    <Card size="4" className="p-0!">
      <Box
        p="4"
        className="cursor-pointer transition-all hover:backdrop-brightness-95 active:backdrop-brightness-90"
        onClick={() => setIsOpen((old) => !old)}
      >
        <Flex justify="between" align="center" gap={'2'}>
          <Box>
            <Heading>Schedules</Heading>
            <Text color="gray" className="line-clamp-1">
              {currentCount} of {maxSchedules} schedule
              {maxSchedules !== 1 ? 's' : ''} used
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
          {schedules.length > 0 && (
            <>
              <style>
                {`
            .rt-TableRootTable {
              border-radius: 0px !important;
            }
          `}
              </style>
              <Separator
                size="4"
                orientation="horizontal"
                className="w-full!"
              />
              <Box p="0">
                <Table.Root
                  variant="surface"
                  className="rounded-t-none! border-none!"
                >
                  <Table.Header className="rounded-t-none!">
                    <Table.Row className="rounded-t-none!">
                      <Table.ColumnHeaderCell>Days</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Next</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Last</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {schedules.map((schedule) => {
                      return (
                        <Table.Row
                          key={schedule._id}
                          className="cursor-pointer hover:bg-gray-2"
                        >
                          <Table.RowHeaderCell className="line-clamp-1">
                            {formatDaysOfWeek(schedule)}
                          </Table.RowHeaderCell>
                          <Table.Cell>
                            <Text size="2" color="gray">
                              {formatNextScheduled(schedule.next)}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text size="2" color="gray">
                              {schedule.last
                                ? new Date(schedule.last).toLocaleDateString()
                                : '-'}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Button
                              size="1"
                              variant="soft"
                              color="red"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteSchedule(schedule._id)
                              }}
                            >
                              Delete
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      )
                    })}
                  </Table.Body>
                </Table.Root>
              </Box>
            </>
          )}

          {schedules.length === 0 && (
            <>
              <Separator
                size="4"
                orientation="horizontal"
                className="w-full!"
              />
              <Box p="4">
                <Text color="gray">
                  No scheduled messages yet. Create one to have your AI
                  assistant reach out automatically.
                </Text>
              </Box>
            </>
          )}

          {canAddMore && (
            <>
              <Separator
                size="4"
                orientation="horizontal"
                className="w-full!"
              />
              <Box p="4">
                <Dialog.Root
                  open={showCreateDialog}
                  onOpenChange={setShowCreateDialog}
                >
                  <Dialog.Trigger>
                    <Button variant="classic" className="w-full!">
                      Add Schedule
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Content>
                    <Box mb={'3'}>
                      <>
                        <Dialog.Title className="sr-only">
                          Create Scheduled Message
                        </Dialog.Title>
                        <Dialog.Description className="sr-only">
                          Set up an automated check-in from your AI assistant.
                        </Dialog.Description>
                      </>
                      <Heading>Create Scheduled Message</Heading>
                      <Text>
                        {' '}
                        Set up an automated check-in from your AI assistant.
                      </Text>
                    </Box>

                    <AutoForm.Root
                      onSubmit={handleCreateSchedule}
                      schema={ScheduleFormSchema}
                      defaultValues={{
                        days: [0],
                        hour: [4, 0],
                        instructions: '',
                      }}
                    >
                      <AutoForm.Content />

                      <Flex gap="3" mt="4" justify="end">
                        <Dialog.Close>
                          <Button variant="soft" color="gray" type="button">
                            Cancel
                          </Button>
                        </Dialog.Close>
                        <AutoForm.Action
                          loading={isLoading}
                          type="submit"
                          variant="classic"
                        >
                          Create
                        </AutoForm.Action>
                      </Flex>
                    </AutoForm.Root>
                  </Dialog.Content>
                </Dialog.Root>
              </Box>
            </>
          )}
        </>
      )}
    </Card>
  )
}
