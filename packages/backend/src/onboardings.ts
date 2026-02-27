import { getAuthUserId } from "@convex-dev/auth/server";
import { defineOnboarding } from "@raideno/convex-onboardings";
import { convexOnboardings } from "@raideno/convex-onboardings/server";
import { v } from "convex/values";
import { DataModel, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const ProfileOnboarding = defineOnboarding<DataModel>({
  id: "profile",
  version: 1,
  name: "Profile Setup",
  description: "Set up your user profile.",

  required: false,
  optIn: true,

  condition: async (entityId, ctx) => {
    return true;
  },

  args: v.object({
    name: v.string(),
    email: v.string(),
  }),

  handle: async (entityId, ctx, args, onboarding) => {
    const userId = entityId as Id<"users">;

    await ctx.db.patch(userId, {
      name: args.name,
      email: args.email,
    });

    await onboarding.complete();
  },
});

export const onboardings = convexOnboardings({
  onboardings: [ProfileOnboarding],
  onComplete: async (entity, ctx, onboarding) => {
    // Run logic each time an onboarding finishes
  },
  onAllRequiredComplete: async (entity, ctx) => {
    // Fired when the entity finishes all required onboardings
  },
});

export const list = query({
  args: {},
  handler: async (context, args) => {
    const userId = await getAuthUserId(context);
    if (!userId) return [];

    return onboardings.list(context, userId);
  },
});

export const onboard = mutation({
  args: {
    id: v.string(),
    data: v.any(),
  },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context);
    if (!userId) throw new Error("Not authenticated");

    const onboarding = await onboardings.status(context, userId, args.id);
    if (!onboarding) throw new Error("Onboarding not valid for this user");

    // TODO: make the data type safe and the onboardingId type safe as well
    await onboardings.onboard(context, userId, onboarding.id, args.data);
  },
});
