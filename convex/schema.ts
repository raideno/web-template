import { authTables } from '@convex-dev/auth/server'
import { analyticsTables } from '@raideno/convex-analytics/server'
import { stripeTables } from '@raideno/convex-stripe/server'
import { defineSchema } from 'convex/server'

import { CountersTable } from '@/convex/models/quotas'
import { FeedbacksTable } from '@/convex/models/feedbacks'
import { OnboardingsTable } from '@/convex/models/onboardings'
import { UsersTable } from '@/convex/models/users'

export default defineSchema({
  ...authTables,
  ...stripeTables,
  ...analyticsTables,
  /**
   * User profiles and settings.
   */
  users: UsersTable(),
  /**
   * Onboarding progress per user.
   */
  onboardings: OnboardingsTable(),
  /**
   * Track usage counters per billing entity.
   */
  counters: CountersTable(),
  /**
   *  User feedbacks and ratings.
   */
  feedbacks: FeedbacksTable(),
})
