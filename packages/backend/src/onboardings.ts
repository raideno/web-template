/* eslint-disable @typescript-eslint/naming-convention */

import { getAuthUserId } from "@convex-dev/auth/server";
import { validate } from "convex-helpers/validators";
import { v } from "convex/values";

import type { Infer, VObject } from "convex/values";

import type { DataModel, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

import { mutation, query } from "./_generated/server";

// TODO: make the thing checking whether or not to propose the onboarding as a function rather than a fixed value

export const markOnboardingAsCompleted = async (
  context: MutationCtx,
  userId: Id<"users">,
  onboarding: Onboarding,
) => {
  const existing = await context.db
    .query("onboardings")
    .withIndex("byIdUserId", (q) =>
      q.eq("id", onboarding.id).eq("userId", userId),
    )
    .unique();

  if (existing) {
    await context.db.patch(existing._id, {
      version: onboarding.version,
    });
  } else {
    await context.db.insert("onboardings", {
      userId,
      id: onboarding.id,
      version: onboarding.version,
    });
  }
};

// TODO: add conditions for the onboarding to appear, authenticated, subscribed, firth-month subscribed, etc
export type Onboarding = {
  id: string;
  name: string;
  description: string;
  required: boolean;
  optIn: boolean;
  version: number;
};

export const defineOnboarding = <Args extends VObject<any, any>>(
  specification: Onboarding & {
    args: Args;
    handle: (
      user: DataModel["users"]["document"],
      context: MutationCtx,
      args: Infer<Args>,
      onboarding: Onboarding & {
        complete: () => Promise<void>;
      },
    ) => void | Promise<void>;
  },
) => specification;

export const Onboardings = [
  defineOnboarding({
    id: "profile",
    required: false,
    optIn: true,
    version: 1,
    args: v.object({
      name: v.string(),
      email: v.string(),
    }),
    name: "Profile Setup",
    description: "Set up your user profile.",
    handle: async (user, context, args, onboarding) => {
      const userId = user._id as Id<"users">;

      await context.db.patch(userId, {
        name: args.name,
        email: args.email,
      });

      await onboarding.complete();
    },
  }),
] as const;

const handleOnboarding = async (
  context: MutationCtx,
  user: DataModel["users"]["document"],
  onboardingHandler: (typeof Onboardings)[number],
  args_: any,
) => {
  const isValid = validate(args_, onboardingHandler.args, { throw: false });

  if (!isValid) throw new Error("Invalid onboarding arguments");

  const args = args_ as Infer<typeof onboardingHandler.args>;

  await onboardingHandler.handle(user, context, args as any, {
    ...({
      id: onboardingHandler.id,
      name: onboardingHandler.name,
      description: onboardingHandler.description,
    } as Onboarding),
    complete: async () => {
      await markOnboardingAsCompleted(
        context,
        user._id as Id<"users">,
        onboardingHandler,
      );
    },
  });
};

export const onboard = mutation({
  args: {
    id: v.string(),
    data: v.any(),
  },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    const user = await context.db.get(userId);

    if (!user) throw new Error("User not found");

    const onboarding = Onboardings.find((o) => o.id === args.id);

    if (!onboarding) throw new Error("Onboarding not found");

    await handleOnboarding(context, user, onboarding, args.data);
  },
});

export const list = query({
  args: {},
  handler: async (context) => {
    const userId = await getAuthUserId(context);
    if (!userId) return [];

    const rows = await context.db
      .query("onboardings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const versionsById = new Map(rows.map((r) => [r.id, r.version]));

    return Onboardings.map((o) => {
      const completedVersion = versionsById.get(o.id) ?? 0;
      const completed = completedVersion === o.version;
      return {
        id: o.id,
        name: o.name,
        description: o.description,
        required: o.required,
        optIn: o.optIn,
        version: o.version,
        completedVersion,
        completed,
        outdated: completedVersion !== 0 && completedVersion !== o.version,
      };
    });
  },
});
