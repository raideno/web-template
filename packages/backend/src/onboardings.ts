import { defineOnboarding } from "@raideno/convex-onboardings";
import { convexOnboardings } from "@raideno/convex-onboardings/server";
import { v } from "convex/values";
import { DataModel, Id } from "@/convex/dataModel";
import { WithAuthenticationMiddleware } from "./middlewares/auth";
import { convex } from "@";

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

export const list = convex
  .query()
  .use(WithAuthenticationMiddleware)
  .handler(async (context) => {
    return onboardings.list(context, context.user.id);
  })
  .public();

export const onboard = convex
  .mutation()
  .use(WithAuthenticationMiddleware)
  .input({
    id: v.string(),
    data: v.any(),
  })
  .handler(async (context, args) => {
    const onboarding = await onboardings.status(
      context,
      context.user.id,
      args.id,
    );
    if (!onboarding) throw new Error("Onboarding not valid for this user");

    // TODO: make the data type safe and the onboardingId type safe as well
    await onboardings.onboard(
      context,
      context.user.id,
      onboarding.id,
      args.data,
    );
  })
  .public();
