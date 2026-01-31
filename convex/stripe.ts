import { getAuthUserId } from '@convex-dev/auth/server'
import { internalConvexStripe } from '@raideno/convex-stripe/server'
import { v } from 'convex/values'

import type { AnyDataModel, GenericActionCtx } from 'convex/server'
import type { Stripe } from 'stripe'

import { action, internalQuery, query } from '@/convex.generated/server'

import { analytics } from '@/convex/analytics'
import stripeConfig from '@/convex/stripe.config'

export const { setup, store, stripe, sync } = internalConvexStripe(stripeConfig)

export const get = internalQuery({
  args: {
    customerId: v.string(),
  },
  handler: async (context, args) => {
    const subscription = await context.db
      .query('stripeSubscriptions')
      .withIndex('byCustomerId', (q) => q.eq('customerId', args.customerId))
      .unique()

    return subscription
  },
})

export const products = query({
  args: {},
  handler: async (context) => {
    const prices = await context.db.query('stripePrices').collect()
    const products_ = await context.db.query('stripeProducts').collect()

    return products_.map((product) => ({
      ...product,
      prices: prices
        .filter((price) => price.stripe.productId === product.productId)
        .filter((price) => price.stripe.active),
    }))
  },
})

export const subscription = query({
  args: {},
  handler: async (context) => {
    const userId = await getAuthUserId(context)

    if (!userId) return null

    const customer = await context.db
      .query('stripeCustomers')
      .withIndex('byEntityId', (q) => q.eq('entityId', userId))
      .unique()

    if (!customer) {
      console.warn(
        '[error]:',
        'user',
        userId,
        'exists but with stripe customer associated.',
      )
      return null
    }

    const subscription_ = await context.db
      .query('stripeSubscriptions')
      .withIndex('byCustomerId', (q) => q.eq('customerId', customer.customerId))
      .unique()

    if (!subscription_) {
      // console.warn(
      //   '[error]:',
      //   'user',
      //   userId,
      //   'exists but with no subscription record associated.',
      // )
      return null
    }

    const stripeSubscription: Stripe.Subscription | undefined =
      subscription_.stripe

    if (!stripeSubscription) return null

    if (stripeSubscription.items.data.length === 0) {
      console.error(
        '[error]:',
        'subscription',
        subscription_.subscriptionId,
        'has no items',
      )
      return null
    }

    if (stripeSubscription.items.data.length > 1) {
      console.warn(
        '[warning]:',
        'subscription',
        subscription_.subscriptionId,
        'has multiple items, only the first one will be considered.',
      )
    }

    const item = stripeSubscription.items.data[0]

    const billingId = `${item.current_period_start}.${item.current_period_end}`

    return {
      billingId: billingId,
      current_period_end: item.current_period_end,
      current_period_start: item.current_period_start,
      price: item.price,
      status: stripeSubscription.status,
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    }
  },
})

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
    url: string | null
  }> => {
    const userId = await getAuthUserId(context)

    if (!userId) throw new Error('Unauthorized')

    const checkout = await stripe.subscribe(context as any, {
      createStripeCustomerIfMissing: true,
      entityId: userId,
      payment_method_collection: 'if_required',
      priceId: args.priceId,
      mode: 'subscription',
      success_url: args.successRedirectUrl,
      cancel_url: args.cancelRedirectUrl,
      allow_promotion_codes: true,
    })

    await analytics.track(
      context as unknown as GenericActionCtx<AnyDataModel>,
      {
        name: 'subscription.attempt',
        properties: {
          priceId: args.priceId,
        },
        distinctId: userId,
      },
      { blocking: false },
    )

    return checkout
  },
})

export const portal = action({
  args: {
    returnRedirectUrl: v.string(),
  },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context)

    if (!userId) throw new Error('Unauthorized')

    const portal_ = await stripe.portal(context as any, {
      createStripeCustomerIfMissing: true,
      entityId: userId,
      return_url: args.returnRedirectUrl,
    })

    return portal_
  },
})

// TODO: create a refill intent and use its id as a referenceId, once payment successfull, set the status of that as 'completed'
// TODO: put a listener on the status change to 'completed' to actually add the credits to the user account
// $1.00 per credit unit
export const CREDIT_UNIT_AMOUNT_CENTS = 100

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
