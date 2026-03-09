import { ConvexError, v } from "convex/values";
import type { DataModel, Id } from "@/convex/dataModel";
import { DEFAULT_QUOTAS } from "@/models/quotas";
import { defineServiceMutation, defineServiceQuery } from "@/services/factory";

export const deriveBillingId = async (
  subscription: DataModel["stripeSubscriptions"]["document"],
) => {
  if (!subscription.stripe || subscription.stripe.items.data.length === 0)
    return null;
  const item = subscription.stripe.items.data[0];
  return `${item.current_period_start}.${item.current_period_end}`;
};

export const QuotasConsumeService = defineServiceMutation({
  args: {
    userId: v.id("users"),
    quantity: v.number(),
    quota: v.string(),
    billingId: v.string(),
  },
  returns: v.boolean(),
  ref: "services/quotas:quotasConsume",
  handler: async (ctx, args) => {
    let counter = await ctx.db
      .query("counters")
      .withIndex("by_userId_billingId", (q) =>
        q.eq("userId", args.userId).eq("billingId", args.billingId),
      )
      .unique();

    if (!counter) {
      counter = {
        _id: await ctx.db.insert("counters", {
          userId: args.userId,
          billingId: args.billingId,
          quotas: DEFAULT_QUOTAS,
        }),
        _creationTime: Date.now(),
        userId: args.userId,
        billingId: args.billingId,
        quotas: DEFAULT_QUOTAS,
      };
    }

    const targetQuota = counter.quotas[args.quota];
    if (targetQuota.type !== "consumable") {
      throw new Error(`Quota "${args.quota}" not found or is not consumable`);
    }

    if (
      targetQuota.current === targetQuota.limit ||
      targetQuota.current + args.quantity > targetQuota.limit
    ) {
      return false;
    }

    await ctx.db.patch(counter._id, {
      quotas: {
        ...counter.quotas,
        [args.quota]: {
          ...targetQuota,
          current: targetQuota.current + args.quantity,
        },
      },
    });

    return true;
  },
});

export const quotasConsume = QuotasConsumeService.bridge;

export const QuotasGetService = defineServiceQuery({
  args: {
    userId: v.id("users"),
    billingId: v.string(),
  },
  returns: v.object({
    _id: v.string(),
    _creationTime: v.number(),
    userId: v.id("users"),
    billingId: v.string(),
    quotas: v.record(
      v.string(),
      v.union(
        v.object({
          type: v.literal("consumable"),
          current: v.number(),
          limit: v.number(),
        }),
        v.object({ type: v.literal("fixed"), limit: v.number() }),
      ),
    ),
  }),
  ref: "services/quotas:quotasGet",
  handler: async (ctx, args) => {
    let usage = await ctx.db
      .query("counters")
      .withIndex("by_userId_billingId", (q) =>
        q.eq("userId", args.userId).eq("billingId", args.billingId),
      )
      .unique();

    if (usage === null) {
      const customer = await ctx.db
        .query("stripeCustomers")
        .withIndex("byEntityId", (q) => q.eq("entityId", args.userId))
        .unique();

      const subscription = customer
        ? await ctx.db
            .query("stripeSubscriptions")
            .withIndex("byCustomerId", (q) =>
              q.eq("customerId", customer.customerId),
            )
            .unique()
        : null;

      let resolvedBillingId = args.billingId;

      if (
        subscription &&
        subscription.stripe &&
        subscription.stripe.items.data.length > 0 &&
        subscription.stripe.status === "active"
      ) {
        resolvedBillingId =
          (await deriveBillingId(subscription)) ?? args.billingId;
      }

      usage = {
        _id: "temporary" as Id<"counters">,
        _creationTime: Date.now(),
        userId: args.userId,
        billingId: resolvedBillingId,
        quotas: DEFAULT_QUOTAS,
      };
    }

    return usage;
  },
});

export const quotasGet = QuotasGetService.bridge;

export const QuotasSetupService = defineServiceMutation({
  args: {
    customerId: v.string(),
    billingId: v.string(),
    // TODO: replace by a quotas array
    messages: v.object({ limit: v.number() }),
    schedules: v.object({ limit: v.number() }),
  },
  returns: v.null(),
  ref: "services/quotas:quotasSetup",
  handler: async (ctx, args) => {
    const customer = await ctx.db
      .query("stripeCustomers")
      .withIndex("byStripeId", (q) => q.eq("customerId", args.customerId))
      .unique();

    if (!customer) return null;

    const userId: Id<"users"> = customer.entityId as Id<"users">;

    const exists = await ctx.db
      .query("counters")
      .withIndex("by_userId_billingId", (q) =>
        q.eq("userId", userId).eq("billingId", args.billingId),
      )
      .unique();

    if (exists) return null;

    await ctx.db.insert("counters", {
      userId,
      billingId: args.billingId,
      quotas: {
        ...DEFAULT_QUOTAS,
        messages: {
          type: "consumable",
          current: 0,
          limit: args.messages.limit,
        },
        schedules: { type: "fixed", limit: args.schedules.limit },
      },
    });

    return null;
  },
});

export const quotasSetup = QuotasSetupService.bridge;
