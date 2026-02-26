import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { defineServiceQuery } from "./factory";
import { deriveBillingId } from "./quotas";

export const isSubscribedService = defineServiceQuery({
  args: {
    userId: v.id("users"),
  },
  returns: v.union(
    v.object({
      isSubscribed: v.literal(false),
      billingId: v.null(),
      subscription: v.null(),
    }),
    v.object({
      isSubscribed: v.literal(true),
      billingId: v.string(),
      subscription: v.any(),
    }),
  ),
  ref: "services/subscription:isSubscribedBridge",
  handler: async (
    ctx: QueryCtx | MutationCtx,
    args: { userId: Id<"users"> },
  ) => {
    const customer = await ctx.db
      .query("stripeCustomers")
      .withIndex("byEntityId", (q) => q.eq("entityId", args.userId))
      .unique();

    if (!customer) {
      return {
        isSubscribed: false,
        billingId: null,
        subscription: null,
      } as const;
    }

    const subscription = await ctx.db
      .query("stripeSubscriptions")
      .withIndex("byCustomerId", (q) => q.eq("customerId", customer.customerId))
      .unique();

    if (!subscription?.stripe || subscription.stripe.status !== "active") {
      return {
        isSubscribed: false,
        billingId: null,
        subscription: null,
      } as const;
    }

    const billingId = await deriveBillingId(subscription);
    if (!billingId) {
      return {
        isSubscribed: false,
        billingId: null,
        subscription: null,
      } as const;
    }

    return { isSubscribed: true, billingId, subscription } as const;
  },
});

export const isSubscribedBridge = isSubscribedService.bridge;
