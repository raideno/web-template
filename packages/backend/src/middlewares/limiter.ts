import { convex } from "@";
import { components } from "@/convex/api";

import { RateLimiter, RateLimitConfig } from "@convex-dev/rate-limiter";

export const WithRateLimitingMiddlewareFactory = (
  name: string,
  configuration: RateLimitConfig,
) => {
  const limiter = new RateLimiter(components.rateLimiter, {
    [name]: configuration,
  });

  return convex.mutation().createMiddleware(async (context, next) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) throw new Error("Must be authenticated.");

    const status = await limiter.limit(context, "feedbacks", {
      key: identity.subject,
    });

    if (!status.ok)
      throw new Error(
        `Rate limit exceeded. Please try again later ${status.retryAfter} seconds.`,
      );

    return next({
      ...context,
    });
  });
};
