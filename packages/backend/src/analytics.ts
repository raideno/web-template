import { internalConvexAnalytics } from "@raideno/convex-analytics/server";

import { DiscordProcessorFactory } from "@raideno/convex-analytics/processors/discord";

import { DISCORD_WEBHOOK_URL } from "./parameters";

export const { store, analytics, process } = internalConvexAnalytics({
  processors: [
    DiscordProcessorFactory({
      events: ["*"],
      url: DISCORD_WEBHOOK_URL,
    }),
  ],
  processEveryK: 1,
});
