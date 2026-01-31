import type Stripe from 'stripe'

import type { InputConfiguration as StripeConfiguration } from '@raideno/convex-stripe/server'

import type { MutationCtx } from '@/convex.generated/server'

import { internal } from '@/convex.generated/api'

import { analytics } from '@/convex/analytics'
import { safeParseInt } from '@/convex/helpers'
import {
  DEFAULT_LIMIT,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
} from '@/convex/parameters'
import { CreditsService } from '@/convex/services/quotas'

export default {
  stripe: {
    secret_key: STRIPE_SECRET_KEY,
    webhook_secret: STRIPE_WEBHOOK_SECRET,
  },
  callback: {
    // TODO: the callbacks must have two functions, a before and a after, this is important for payment related actions where we
    // add credits only after payment_status has changed
    /**
     * Because with current implementation, we'll need to add a separate table to track paymentIds and whether refill has been applied or not.
     */
    unstable__afterChange: async (context, args) => {
      if (
        args.table === 'stripeCheckoutSessions' &&
        args.operation === 'upsert'
      ) {
        const checkoutSession = '' as any as Stripe.Checkout.Session

        checkoutSession.payment_status === 'paid'
      }
      if (args.table === 'stripeCustomers' && args.operation === 'upsert') {
        try {
          /**
           * TODO: check the new available data, if any email is specified, update the user record if none have been given.
           */
        } catch (error) {}
      }
      if (args.table === 'stripeSubscriptions' && args.operation === 'upsert') {
        try {
          const subscription = await context.runQuery(internal.stripe.get, {
            customerId: args.data.customerId,
          })

          if (
            !subscription ||
            !subscription.stripe ||
            subscription.stripe.items.data.length === 0 ||
            subscription.stripe.status !== 'active'
          )
            return

          const billingId = await CreditsService.deriveBillingId(subscription)

          if (!billingId) return

          const messagesLimit = safeParseInt(
            subscription.stripe.items.data[0].price.metadata['messages.limit'],
            DEFAULT_LIMIT,
          )
          const schedulesLimit = safeParseInt(
            subscription.stripe.items.data[0].price.metadata['schedules.limit'],
            DEFAULT_LIMIT,
          )

          await context.runMutation(internal.quotas.setup, {
            customerId: subscription.customerId,
            billingId: billingId,
            messages: {
              limit: messagesLimit,
            },
            schedules: {
              limit: schedulesLimit,
            },
          })

          const customer = await (context as MutationCtx).db
            .query('stripeCustomers')
            .withIndex('byCustomerId', (q) =>
              q.eq('customerId', subscription.customerId),
            )
            .unique()

          if (!customer) return

          await analytics.track(
            context,
            {
              name: 'subscription.updated',
              properties: {
                customerId: subscription.customerId,
                billingId: billingId,
                messagesLimit: messagesLimit,
                schedulesLimit: schedulesLimit,
              },
              distinctId: customer.entityId,
            },
            { blocking: false },
          )
        } catch (error) {
          console.error(
            '[stripe][afterChange][error]:',
            'Failed to setup billingId for subscription update',
            error,
          )
        }
      }
    },
  },
} as StripeConfiguration
