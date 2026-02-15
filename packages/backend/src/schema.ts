import { authTables } from "@convex-dev/auth/server";
import { analyticsTables } from "@raideno/convex-analytics/server";
import { stripeTables } from "@raideno/convex-stripe/server";
import { defineSchema } from "convex/server";
import { kvTables } from "@raideno/convex-kv/server";

import { FeedbacksTable } from "./models/feedbacks";
import { MagicsTable } from "./models/magics";
import { OnboardingsTable } from "./models/onboardings";
import { CountersTable } from "./models/quotas";
import { UsersTable } from "./models/users";

export default defineSchema({
  ...authTables,
  ...stripeTables,
  ...analyticsTables,
  ...kvTables,
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
  /**
   * Magic authentication links.
   */
  magics: MagicsTable(),
});
