import { cronJobs } from 'convex/server'

import { internal } from '@/convex.generated/api'
import { internalMutation } from '@/convex.generated/server'
import { analytics } from './analytics'

export const cron = internalMutation({
  args: {},
  handler: async (context) => {
    await analytics.track(context, {
      name: 'cron_executed',
      properties: {
        timestamp: new Date().toISOString(),
      },
      distinctId: 'system_cron',
    })
    return { status: 'ok' }
  },
})

const crons = cronJobs()

crons.interval(
  'process recurring scheduled messages',
  { minutes: 30 },
  internal.crons.cron
)

export default crons
