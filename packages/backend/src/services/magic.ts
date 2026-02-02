import { sha256 as rawSha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { v } from "convex/values";
import { alphabet, generateRandomString } from "oslo/crypto";

import type { Id } from "../_generated/dataModel";
import type { ActionCtx, MutationCtx } from "../_generated/server";

import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";

import { AUTH_PROVIDER_NAME, MAGIC_LINK_AUTH_CODE_LENGTH } from "../parameters";

export type MagicAuthenticationServiceCreateReturnType = string;

export class MagicAuthenticationService {
  private static sha256(input: string) {
    return encodeHexLowerCase(rawSha256(new TextEncoder().encode(input)));
  }

  static create(
    context: MutationCtx | ActionCtx,
    args: ({ userId: Id<"users"> } | { phone: string }) & {
      redirectTo: string;
      millisecondsExpiresIn: number;
    },
  ): Promise<MagicAuthenticationServiceCreateReturnType> {
    if ("runAction" in context) return this.createFromAction(context, args);
    else if ("runMutation" in context)
      return this.createFromMutation(context, args);
    else
      throw new Error(
        "MagicAuthenticationService.create can only be called from MutationCtx or ActionCtx",
      );
  }

  private static async createFromMutation(
    context: MutationCtx,
    args: ({ userId: Id<"users"> } | { phone: string }) & {
      redirectTo: string;
      millisecondsExpiresIn: number;
    },
  ): Promise<MagicAuthenticationServiceCreateReturnType> {
    let userId: Id<"users"> | undefined = undefined;

    if ("phone" in args) {
      const user = await context.db
        .query("users")
        .withIndex("phone", (q) => q.eq("phone", args.phone))
        .unique();

      if (!user) {
        throw new Error("User not found for magic link");
      }

      userId = user._id;
    } else {
      userId = args.userId;
    }

    // NOTE: useless check to satisfy TypeScript
    if (!userId) {
      throw new Error("User ID is required to create magic link");
    }

    const user = await context.db.get(userId);
    const account = await context.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) =>
        q.eq("userId", userId).eq("provider", AUTH_PROVIDER_NAME),
      )
      .unique();

    if (!account) {
      throw new Error("Auth account not found for user");
    }

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.phone) {
      throw new Error("User has no phone number associated");
    }

    const phone = user.phone;

    const code = generateRandomString(
      MAGIC_LINK_AUTH_CODE_LENGTH,
      alphabet("a-z", "A-Z", "0-9"),
    );

    const expireAt = Date.now() + args.millisecondsExpiresIn;

    {
      /**
       * Should call the auth method to create a code for the provided phone number,
       * in order for the validation to work.
       */
      const existingCode = await context.db
        .query("authVerificationCodes")
        .withIndex("accountId", (q) => q.eq("accountId", account._id))
        .unique();
      if (existingCode !== null) {
        await context.db.delete(existingCode._id);
      }
      await context.db.insert("authVerificationCodes", {
        accountId: account._id,
        provider: AUTH_PROVIDER_NAME,
        code: await MagicAuthenticationService.sha256(code),
        expirationTime: expireAt,
        emailVerified: undefined,
        phoneVerified: phone,
      });
    }

    await context.db.insert("magics", {
      userId: userId,
      code,
      redirectTo: args.redirectTo,
      expireAt,
    });

    return code;
  }

  private static async createFromAction(
    context: ActionCtx,
    args: ({ userId: Id<"users"> } | { phone: string }) & {
      redirectTo: string;
      millisecondsExpiresIn: number;
    },
  ): Promise<MagicAuthenticationServiceCreateReturnType> {
    return await context.runMutation(internal.services.magic.createFromAction, {
      identifier:
        "userId" in args ? { userId: args.userId } : { phone: args.phone },
      redirectTo: args.redirectTo,
      millisecondsExpiresIn: args.millisecondsExpiresIn,
    });
  }
}

export const createFromAction = internalMutation({
  args: {
    identifier: v.union(
      v.object({ phone: v.string() }),
      v.object({
        userId: v.id("users"),
      }),
    ),
    redirectTo: v.string(),
    millisecondsExpiresIn: v.number(),
  },
  handler: async (context, args) => {
    const args_: any = {
      redirectTo: args.redirectTo,
      millisecondsExpiresIn: args.millisecondsExpiresIn,
      ...("userId" in args.identifier
        ? { userId: args.identifier.userId }
        : { phone: args.identifier.phone }),
    };

    return await MagicAuthenticationService.create(context, args_);
  },
});
