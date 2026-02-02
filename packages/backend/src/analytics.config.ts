import { DiscordProcessorFactory } from "@raideno/convex-analytics/processors/discord";

import type { InputConfiguration } from "@raideno/convex-analytics/server";

import { DISCORD_WEBHOOK_URL } from "./parameters";

export default {
  processors: [
    DiscordProcessorFactory({
      events: ["*"],
      url: DISCORD_WEBHOOK_URL,
    }),
  ],
  processEveryK: 1,
} as InputConfiguration;
