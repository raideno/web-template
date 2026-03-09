import { Password } from "@convex-dev/auth/providers/Password";
import { Phone } from "@convex-dev/auth/providers/Phone";
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { alphabet, generateRandomString } from "oslo/crypto";

import type {
  GenericActionCtxWithAuthConfig,
  PhoneConfig,
} from "@convex-dev/auth/server";

import type { DataModel } from "@/convex/dataModel";
import { internal } from "@/convex/api";
import { internalQuery } from "@/convex/server";

import {
  AUTH_CODE_MAX_AGE_IN_SECONDS,
  AUTH_PROVIDER_NAME,
  AUTH_VERIFICATION_CODE_LENGTH,
  IS_PRODUCTION,
} from "@/parameters";
import { convex } from "@";
import { WithAuthenticationMiddleware } from "./middlewares/auth";

interface Params {
  identifier: string;
  url: string;
  expires: Date;
  provider: PhoneConfig;
  token: string;
}

const sendVerificationRequestConsole = async (
  params: Params,
  _: GenericActionCtxWithAuthConfig<DataModel>,
) => {
  console.log("[params.token]:", params.token);
};

const sendVerificationRequestTwilio = async () => {
  throw new Error("Not implemented.");
};

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Phone({
      id: AUTH_PROVIDER_NAME,
      maxAge: AUTH_CODE_MAX_AGE_IN_SECONDS,
      generateVerificationToken: async () =>
        await generateRandomString(
          AUTH_VERIFICATION_CODE_LENGTH,
          alphabet("0-9"),
        ),
      sendVerificationRequest: IS_PRODUCTION
        ? sendVerificationRequestTwilio
        : sendVerificationRequestConsole,
      apiKey: "",
    }),
    Password({
      id: "password",
    }),
    Google({
      id: "google",
    }),
  ],
  callbacks: {
    afterUserCreatedOrUpdated: async (context, args) => {
      await context.scheduler.runAfter(0, internal.stripe.setup, {
        entityId: args.userId,
        email: args.profile.email,
      });
    },
  },
});

export const self = convex
  .query()
  .use(WithAuthenticationMiddleware)
  .handler(async (context) => {
    const user = await context.db.get(context.user.id);
    if (!user) return null;
  })
  .public();

export const update = convex
  .mutation()
  .use(WithAuthenticationMiddleware)
  .input({
    name: v.optional(v.string()),
  })
  .handler(async (context, args) => {
    await context.db.patch(context.user.id, { name: args.name });
    return { success: true };
  })
  .public();

export const developer = convex
  .mutation()
  .use(WithAuthenticationMiddleware)
  .input({
    enabled: v.boolean(),
  })
  .handler(async (context, args) => {
    const user = await context.db.get(context.user.id);
    if (!user) throw new Error("User not found");
    if (!user.developer) throw new Error("Developer profile not found");
    await context.db.patch(user._id, { developer: { enabled: args.enabled } });
    return { success: true };
  })
  .public();

export const get = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (context, args) => {
    return await context.db.get(args.userId);
  },
});
