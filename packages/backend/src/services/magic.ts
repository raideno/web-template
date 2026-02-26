import { sha256 as rawSha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { v } from "convex/values";
import { alphabet, generateRandomString } from "oslo/crypto";

import type { Id } from "../_generated/dataModel";
import { AUTH_PROVIDER_NAME, MAGIC_LINK_AUTH_CODE_LENGTH } from "../parameters";
import { defineServiceMutation } from "./factory";

function sha256(input: string) {
  return encodeHexLowerCase(rawSha256(new TextEncoder().encode(input)));
}

export const MagicAuthenticationService = defineServiceMutation({
  args: {
    identifier: v.union(
      v.object({ phone: v.string() }),
      v.object({ userId: v.id("users") }),
    ),
    redirectTo: v.string(),
    millisecondsExpiresIn: v.number(),
  },
  returns: v.string(),
  ref: "services/magic:createMagicBridge",
  handler: async (ctx, args) => {
    let userId: Id<"users">;

    if ("phone" in args.identifier) {
      const phone = args.identifier.phone;
      const user = await ctx.db
        .query("users")
        .withIndex("phone", (q) => q.eq("phone", phone))
        .unique();

      if (!user) throw new Error("User not found for magic link");
      userId = user._id;
    } else {
      userId = args.identifier.userId;
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (!user.phone) throw new Error("User has no phone number associated");

    const account = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) =>
        q.eq("userId", userId).eq("provider", AUTH_PROVIDER_NAME),
      )
      .unique();

    if (!account) throw new Error("Auth account not found for user");

    const code = generateRandomString(
      MAGIC_LINK_AUTH_CODE_LENGTH,
      alphabet("a-z", "A-Z", "0-9"),
    );

    const expireAt = Date.now() + args.millisecondsExpiresIn;

    const existingCode = await ctx.db
      .query("authVerificationCodes")
      .withIndex("accountId", (q) => q.eq("accountId", account._id))
      .unique();

    if (existingCode !== null) {
      await ctx.db.delete(existingCode._id);
    }

    await ctx.db.insert("authVerificationCodes", {
      accountId: account._id,
      provider: AUTH_PROVIDER_NAME,
      code: sha256(code),
      expirationTime: expireAt,
      emailVerified: undefined,
      phoneVerified: user.phone,
    });

    await ctx.db.insert("magics", {
      userId,
      code,
      redirectTo: args.redirectTo,
      expireAt,
    });

    return code;
  },
});

export const createMagicBridge = MagicAuthenticationService.bridge;
