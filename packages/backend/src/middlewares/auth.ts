import { convex, Id } from "@";
import type { Auth } from "convex/server";

export const WithAuthenticationMiddleware = convex
  .$context<{ auth: Auth }>()
  .createMiddleware(async (context, next) => {
    const identity = await context.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return next({
      ...context,
      user: {
        id: identity.subject as Id<"users">,
        name: identity.name ?? "Unknown",
      },
    });
  });
