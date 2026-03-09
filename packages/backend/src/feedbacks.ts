import { WithZod } from "fluent-convex/zod";
import { HOUR } from "@convex-dev/rate-limiter";
import { z } from "zod";

import { convex } from "@";
import { WithAuthenticationMiddleware } from "@/middlewares/auth";
import { WithRateLimitingMiddlewareFactory } from "@/middlewares/limiter";

export const send = convex
  .mutation()
  .extend(WithZod)
  .use(WithAuthenticationMiddleware)
  .use(
    WithRateLimitingMiddlewareFactory("feedbacks", {
      kind: "fixed window",
      rate: 5,
      period: HOUR,
    }),
  )
  .input(
    z.object({
      email: z.email().optional(),
      title: z.string().max(128),
      content: z.string().max(2048),
      tag: z.union([
        z.literal("bug"),
        z.literal("feature"),
        z.literal("rating"),
        z.literal("other"),
      ]),
      urls: z.array(z.url()).max(4),
      attachmentUrls: z.array(z.url()).max(8),
    }),
  )
  .handler(async (context, args) => {
    await context.db.insert("feedbacks", {
      email: args.email,
      title: args.title,
      content: args.content,
      tag: args.tag,
      urls: args.urls,
      attachmentUrls: args.attachmentUrls,
      userId: context.user.id,
    });
  })
  .public();
