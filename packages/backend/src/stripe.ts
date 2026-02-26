import { getAuthUserId } from "@convex-dev/auth/server";
import {
  internalConvexStripe,
  syncAllTables,
} from "@raideno/convex-stripe/server";
import { v } from "convex/values";

import type { AnyDataModel, GenericActionCtx } from "convex/server";
import type { Stripe } from "stripe";

import {
  action,
  internalAction,
  internalQuery,
  query,
} from "./_generated/server";

import { analytics } from "./analytics";

import { internal } from "./_generated/api";

import { safeParseInt } from "./helpers";
import {
  DEFAULT_LIMIT,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
} from "./parameters";
import { deriveBillingId } from "./services/quotas";

export const { store, stripe, sync } = internalConvexStripe({
  stripe: {
    secret_key: STRIPE_SECRET_KEY,
    account_webhook_secret: STRIPE_WEBHOOK_SECRET,
  },
  sync: {
    tables: syncAllTables(),
  },
  callbacks: {
    // TODO: the callbacks must have two functions, a before and a after, this is important for payment related actions where we
    // add credits only after payment_status has changed
    /**
     * Because with current implementation, we'll need to add a separate table to track paymentIds and whether refill has been applied or not.
     */
    afterChange: async (context, operation, event) => {
      if (event.table === "stripeCheckoutSessions" && operation === "upsert") {
        const checkoutSession = "" as any as Stripe.Checkout.Session;

        checkoutSession.payment_status === "paid";
      }
      if (event.table === "stripeCustomers" && operation === "upsert") {
        try {
          /**
           * TODO: check the new available data, if any email is specified, update the user record if none have been given.
           */
        } catch (error) {}
      }
      if (event.table === "stripeSubscriptions" && operation === "upsert") {
        try {
          const subscription = await context.db.get(
            "stripeSubscriptions",
            event._id,
          );

          if (
            !subscription ||
            !subscription.stripe ||
            subscription.stripe.items.data.length === 0 ||
            subscription.stripe.status !== "active"
          )
            return;

          const billingId = await deriveBillingId(subscription);

          if (!billingId) return;

          const messagesLimit = safeParseInt(
            subscription.stripe.items.data[0].price.metadata["messages.limit"],
            DEFAULT_LIMIT,
          );
          const schedulesLimit = safeParseInt(
            subscription.stripe.items.data[0].price.metadata["schedules.limit"],
            DEFAULT_LIMIT,
          );

          await context.runMutation(internal.quotas.setup, {
            customerId: subscription.customerId,
            billingId: billingId,
            messages: {
              limit: messagesLimit,
            },
            schedules: {
              limit: schedulesLimit,
            },
          });

          const customer = await context.db
            .query("stripeCustomers")
            .withIndex("byStripeId", (q) =>
              q.eq("customerId", subscription.customerId),
            )
            .unique();

          if (!customer) return;

          await analytics.track(
            context,
            {
              name: "subscription.updated",
              properties: {
                customerId: subscription.customerId,
                billingId: billingId,
                messagesLimit: messagesLimit,
                schedulesLimit: schedulesLimit,
              },
              distinctId: customer.entityId,
            },
            { blocking: false },
          );
        } catch (error) {
          console.error(
            "[stripe][afterChange][error]:",
            "Failed to setup billingId for subscription update",
            error,
          );
        }
      }
    },
  },
});

export const setup = internalAction({
  args: {
    entityId: v.id("users"),
    email: v.optional(v.string()),
  },
  handler: async (context, args) => {
    await stripe.customers.create(context, {
      entityId: args.entityId,
      email: args.email,
    });
  },
});

export const get = internalQuery({
  args: {
    customerId: v.string(),
  },
  handler: async (context, args) => {
    const subscription = await context.db
      .query("stripeSubscriptions")
      .withIndex("byCustomerId", (q) => q.eq("customerId", args.customerId))
      .unique();

    return subscription;
  },
});

export const products = query({
  args: {},
  handler: async (context) => {
    const prices = await context.db.query("stripePrices").collect();
    const products_ = await context.db.query("stripeProducts").collect();

    return products_.map((product) => ({
      ...product,
      prices: prices
        .filter((price) => price.stripe.productId === product.productId)
        .filter((price) => price.stripe.active),
    }));
  },
});

export const subscription = query({
  args: {},
  handler: async (context) => {
    const userId = await getAuthUserId(context);

    if (!userId) return null;

    const customer = await context.db
      .query("stripeCustomers")
      .withIndex("byEntityId", (q) => q.eq("entityId", userId))
      .unique();

    if (!customer) {
      console.warn(
        "[error]:",
        "user",
        userId,
        "exists but with stripe customer associated.",
      );
      return null;
    }

    const subscription_ = await context.db
      .query("stripeSubscriptions")
      .withIndex("byCustomerId", (q) => q.eq("customerId", customer.customerId))
      .unique();

    if (!subscription_) {
      // console.warn(
      //   '[error]:',
      //   'user',
      //   userId,
      //   'exists but with no subscription record associated.',
      // )
      return null;
    }

    const stripeSubscription: Stripe.Subscription | undefined =
      subscription_.stripe;

    if (!stripeSubscription) return null;

    if (stripeSubscription.items.data.length === 0) {
      console.error(
        "[error]:",
        "subscription",
        subscription_.subscriptionId,
        "has no items",
      );
      return null;
    }

    if (stripeSubscription.items.data.length > 1) {
      console.warn(
        "[warning]:",
        "subscription",
        subscription_.subscriptionId,
        "has multiple items, only the first one will be considered.",
      );
    }

    const item = stripeSubscription.items.data[0];

    const billingId = `${item.current_period_start}.${item.current_period_end}`;

    return {
      billingId: billingId,
      current_period_end: item.current_period_end,
      current_period_start: item.current_period_start,
      price: item.price,
      status: stripeSubscription.status,
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    };
  },
});

export const subscribe = action({
  args: {
    priceId: v.string(),
    successRedirectUrl: v.string(),
    cancelRedirectUrl: v.string(),
  },
  handler: async (
    context,
    args,
  ): Promise<{
    url: string | null;
  }> => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    const checkout = await stripe.subscribe(context as any, {
      createStripeCustomerIfMissing: true,
      entityId: userId,
      payment_method_collection: "if_required",
      priceId: args.priceId,
      mode: "subscription",
      success_url: args.successRedirectUrl,
      cancel_url: args.cancelRedirectUrl,
      allow_promotion_codes: true,
    });

    await analytics.track(
      context as unknown as GenericActionCtx<AnyDataModel>,
      {
        name: "subscription.attempt",
        properties: {
          priceId: args.priceId,
        },
        distinctId: userId,
      },
      { blocking: false },
    );

    return checkout;
  },
});

export const portal = action({
  args: {
    returnRedirectUrl: v.string(),
  },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context);

    if (!userId) throw new Error("Unauthorized");

    const portal_ = await stripe.portal(context as any, {
      createStripeCustomerIfMissing: true,
      entityId: userId,
      return_url: args.returnRedirectUrl,
    });

    return portal_;
  },
});

// TODO: create a refill intent and use its id as a referenceId, once payment successfull, set the status of that as 'completed'
// TODO: put a listener on the status change to 'completed' to actually add the credits to the user account
// $1.00 per credit unit
export const CREDIT_UNIT_AMOUNT_CENTS = 100;

// TODO: do a specific price in stripe for buying credits

// export const buy = action({
//   args: {
//     quantity: v.number(),
//   },
//   handler: async (context, args) => {
//     const userId = await getAuthUserId(context)

//     if (!userId) throw new Error('Unauthorized')

//     const subscription_ = await Subscription.isSubscribed(context, {
//       userId: userId,
//     })

//     if (!subscription_.isSubscribed)
//       throw new Error('You must have an active subscription to buy credits.')

//     const payment = await stripe.pay(context, {
//       mode: 'payment',
//       entityId: userId,
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             product_data: { name: 'Credits Refill' },
//             unit_amount: CREDIT_UNIT_AMOUNT_CENTS,
//           },
//           quantity: args.quantity,
//         },
//       ],
//       referenceId: '',
//       success_url: '',
//       // return_url: '',
//       cancel_url: '',
//     })

//     return { url: payment.url }
//   },
// })
