import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";

import type { Id } from "./_generated/dataModel";

import { internalMutation, mutation, query } from "./_generated/server";

import { DEFAULT_QUOTAS } from "./models/quotas";
import { deriveBillingId, QuotasService } from "./services/quotas";

// TODO: move to the credits service file
export const setup = internalMutation({
  args: {
    customerId: v.string(),
    messages: v.object({ limit: v.number() }),
    schedules: v.object({ limit: v.number() }),
    billingId: v.string(),
  },
  handler: async (context, args) => {
    const customer = await context.db
      .query("stripeCustomers")
      .withIndex("byStripeId", (q) => q.eq("customerId", args.customerId))
      .unique();

    if (!customer) return;

    const userId: Id<"users"> = customer.entityId as Id<"users">;

    const exits = await context.db
      .query("counters")
      .withIndex("by_userId_billingId", (q) =>
        q.eq("userId", userId).eq("billingId", args.billingId),
      )
      .unique();

    if (exits) return;

    await context.db.insert("counters", {
      userId: userId,
      billingId: args.billingId,
      quotas: DEFAULT_QUOTAS,
    });
  },
});

export const get = query({
  args: {
    billingId: v.string(),
  },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context);

    if (!userId) return null;

    let usage_ = await context.db
      .query("counters")
      .withIndex("by_userId_billingId", (q) =>
        q.eq("userId", userId).eq("billingId", args.billingId),
      )
      .unique();

    if (usage_ === null) {
      const subscription = await context.db
        .query("stripeSubscriptions")
        .withIndex("byCustomerId", (q) => q.eq("customerId", userId))
        .unique();

      if (
        !subscription ||
        !subscription.stripe ||
        subscription.stripe.items.data.length === 0 ||
        subscription.stripe.status !== "active"
      ) {
        usage_ = {
          _id: "temporary" as Id<"counters">,
          userId: userId,
          billingId: args.billingId,
          quotas: DEFAULT_QUOTAS,
          _creationTime: Date.now(),
        };
      } else {
        const derivedBillingId = await deriveBillingId(subscription);

        usage_ = {
          _id: "temporary" as Id<"counters">,
          userId: userId,
          billingId: derivedBillingId || args.billingId,
          quotas: DEFAULT_QUOTAS,
          _creationTime: Date.now(),
        };
      }
    }

    return usage_;
  },
});

export const consume = mutation({
  args: {
    quota: v.string(),
    quantity: v.number(),
  },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new ConvexError("Unauthorized");

    const customer = await context.db
      .query("stripeCustomers")
      .withIndex("byEntityId", (q) => q.eq("entityId", userId))
      .unique();

    if (!customer) {
      throw new ConvexError("No Stripe customer found for user");
    }

    const subscription = await context.db
      .query("stripeSubscriptions")
      .withIndex("byCustomerId", (q) => q.eq("customerId", customer.customerId))
      .unique();

    console.log("[subscription]:", subscription);

    if (
      !subscription ||
      !subscription.stripe ||
      subscription.stripe.status !== "active"
    ) {
      throw new ConvexError({
        message: "No active subscription found for user",
      });
    }

    const billingId = await deriveBillingId(subscription);

    if (!billingId) {
      throw new ConvexError("Unable to derive billing ID from subscription");
    }

    return await QuotasService.execute(context, {
      userId: userId,
      quantity: args.quantity,
      quota: args.quota,
      billingId: billingId,
    });
  },
});
