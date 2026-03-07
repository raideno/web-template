import { authTables } from "@convex-dev/auth/server";
import { analyticsTables } from "@raideno/convex-analytics/server";
import { kvTables } from "@raideno/convex-kv/server";
import { onboardingsTables } from "@raideno/convex-onboardings/schema";
import { stripeTables } from "@raideno/convex-stripe/server";
import { defineSchema } from "convex/server";

import { FeedbacksTable } from "./models/feedbacks";
import { CountersTable } from "./models/quotas";
import { UsersTable } from "./models/users";

export default defineSchema({
  ...authTables,
  ...stripeTables,
  ...analyticsTables,
  ...kvTables,
  ...onboardingsTables,
  /**
   * User profiles and settings.
   */
  users: UsersTable(),
  /**
   * Track usage counters per billing entity.
   */
  counters: CountersTable(),
  /**
   *  User feedbacks and ratings.
   */
  feedbacks: FeedbacksTable(),
});
