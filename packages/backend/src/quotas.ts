import { ConvexError, v } from "convex/values";

import { internalMutation } from "@/convex/server";

import {
  deriveBillingId,
  QuotasConsumeService,
  QuotasGetService,
  QuotasSetupService,
} from "@/services/quotas";
import { convex } from "@";
import { WithAuthenticationMiddleware } from "./middlewares/auth";

export const setup = internalMutation({
  args: {
    customerId: v.string(),
    messages: v.object({ limit: v.number() }),
    schedules: v.object({ limit: v.number() }),
    billingId: v.string(),
  },
  handler: async (context, args) => {
    return await QuotasSetupService.execute(context, {
      customerId: args.customerId,
      billingId: args.billingId,
      messages: args.messages,
      schedules: args.schedules,
    });
  },
});

export const get = convex
  .query()
  .use(WithAuthenticationMiddleware)
  .input({
    billingId: v.string(),
  })
  .handler(async (context, args) => {
    return await QuotasGetService.execute(context, {
      userId: context.user.id,
      billingId: args.billingId,
    });
  })
  .public();

export const consume = convex
  .mutation()
  .use(WithAuthenticationMiddleware)
  .input({
    quota: v.string(),
    quantity: v.number(),
  })
  .handler(async (context, args) => {
    const customer = await context.db
      .query("stripeCustomers")
      .withIndex("byEntityId", (q) => q.eq("entityId", context.user.id))
      .unique();

    if (!customer) {
      throw new ConvexError("No Stripe customer found for user");
    }

    const subscription = await context.db
      .query("stripeSubscriptions")
      .withIndex("byCustomerId", (q) => q.eq("customerId", customer.customerId))
      .unique();

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

    return await QuotasConsumeService.execute(context, {
      userId: context.user.id,
      quota: args.quota,
      quantity: args.quantity,
      billingId,
    });
  })
  .public();
