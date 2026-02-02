import { v } from "convex/values";

import { api, internal } from "./_generated/api";
import { action, internalQuery } from "./_generated/server";

import { AUTH_PROVIDER_NAME } from "./parameters";

// TODO: add rate limiting to this query to avoid abuse
export const get = internalQuery({
  args: {
    code: v.string(),
  },
  handler: async (context, args) => {
    return await context.db
      .query("magics")
      .withIndex("byCode", (q) => q.eq("code", args.code))
      .unique();
  },
});

// TODO: add rate limiting to this query to avoid abuse
export const exchange = action({
  args: {
    code: v.string(),
  },
  handler: async (context, args) => {
    const magic = await context.runQuery(internal.magics.get, {
      code: args.code,
    });

    if (!magic) {
      throw new Error("Invalid or expired magic link code");
    }

    const user = await context.runQuery(internal.auth.get, {
      userId: magic.userId,
    });

    if (!user) {
      throw new Error("User not found for magic link");
    }

    if (!user.phone) {
      throw new Error("User has no phone number associated");
    }

    const response = (await context.runAction(api.auth.signIn, {
      provider: AUTH_PROVIDER_NAME,
      params: {
        phone: user.phone,
        code: magic.code,
      },
    })) as { tokens: { token: string; refreshToken: string } | null };

    const redirectTo = magic.redirectTo as string;

    return {
      tokens: response.tokens,
      redirectTo: redirectTo,
    };
  },
});
