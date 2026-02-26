import { withSystemFields } from "convex-helpers/validators";
import { v } from "convex/values";
import type { DataModel, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { DEFAULT_QUOTAS } from "../models/quotas";
import schema from "../schema";
import { defineServiceMutation } from "./factory";

export const deriveBillingId = async (
  subscription: DataModel["stripeSubscriptions"]["document"],
) => {
  if (!subscription.stripe || subscription.stripe.items.data.length === 0)
    return null;
  const item = subscription.stripe.items.data[0];
  return `${item.current_period_start}.${item.current_period_end}`;
};

export const QuotasService = defineServiceMutation({
  args: {
    userId: v.id("users"),
    quantity: v.number(),
    quota: v.string(),
    billingId: v.string(),
  },
  returns: v.boolean(),
  ref: "services/quotas:deductFromConsumableIfOwnsEnoughBridge",
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

export const deductFromConsumableIfOwnsEnoughBridge = QuotasService.bridge;
