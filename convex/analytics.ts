import { internalConvexAnalytics } from '@raideno/convex-analytics/server'

import configuration from '@/convex/analytics.config'

export const { store, analytics, process } =
  internalConvexAnalytics(configuration)
