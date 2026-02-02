import { v } from "convex/values";

import type { DataModel, Id } from "../_generated/dataModel";
import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";

import { internal } from "../_generated/api";
import { internalQuery } from "../_generated/server";

import { CreditsService } from "./quotas";

export type SubscriptionServiceIsSubscribedReturnType =
  | {
      isSubscribed: false;
      billingId: null;
      subscription: null;
    }
  | {
      isSubscribed: true;
      billingId: string;
      subscription: DataModel["stripeSubscriptions"]["document"];
    };

export class SubscriptionService {
  static isSubscribed(
    context: MutationCtx | QueryCtx | ActionCtx,
    args: { userId: Id<"users"> },
  ): Promise<SubscriptionServiceIsSubscribedReturnType> {
    if ("runAction" in context)
      return this.isSubscribedFromAction(context, args.userId);
    else if ("runMutation" in context)
      return this.isSubscribedFromMutation(context, args.userId);
    else return this.isSubscribedFromQuery(context, args.userId);
  }

  private static async isSubscribedFromAction(
    context: ActionCtx,
    userId: Id<"users">,
  ): Promise<SubscriptionServiceIsSubscribedReturnType> {
    return await context.runQuery(
      internal.services.subscription.isSubscribedFromAction,
      {
        userId,
      },
    );
  }

  private static async isSubscribedFromQuery(
    context: QueryCtx,
    userId: Id<"users">,
  ): Promise<SubscriptionServiceIsSubscribedReturnType> {
    const customer = await context.db
      .query("stripeCustomers")
      .withIndex("byEntityId", (q) => q.eq("entityId", userId))
      .unique();

    if (!customer)
      return {
        isSubscribed: false,
        billingId: null,
        subscription: null,
      };

    const subscription = await context.db
      .query("stripeSubscriptions")
      .withIndex("byCustomerId", (q) => q.eq("customerId", customer.customerId))
      .unique();

    if (!subscription)
      return {
        isSubscribed: false,
        billingId: null,
        subscription: null,
      };

    if (!subscription.stripe)
      return {
        isSubscribed: false,
        billingId: null,
        subscription: null,
      };

    if (subscription.stripe.status !== "active")
      return {
        isSubscribed: false,
        billingId: null,
        subscription: null,
      };
    const billingId = await CreditsService.deriveBillingId(subscription);

    if (!billingId)
      return {
        isSubscribed: false,
        billingId: null,
        subscription: null,
      };

    return {
      isSubscribed: true,
      billingId: billingId,
      subscription: subscription,
    };
  }

  private static async isSubscribedFromMutation(
    context: MutationCtx,
    userId: Id<"users">,
  ) {
    return await SubscriptionService.isSubscribedFromQuery(context, userId);
  }
}

export const isSubscribedFromAction = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (context, args) => {
    return await SubscriptionService.isSubscribed(context, {
      userId: args.userId,
    });
  },
});
