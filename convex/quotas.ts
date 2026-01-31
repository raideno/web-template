import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'

import type { Id } from '@/convex.generated/dataModel'

import { internalMutation, query } from '@/convex.generated/server'

import { CreditsService } from '@/convex/services/quotas'
import { DEFAULT_QUOTAS } from './models/quotas'

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
      .query('stripeCustomers')
      .withIndex('byCustomerId', (q) => q.eq('customerId', args.customerId))
      .unique()

    if (!customer) return

    const userId: Id<'users'> = customer.entityId as Id<'users'>

    const exits = await context.db
      .query('counters')
      .withIndex('by_userId_billingId', (q) =>
        q.eq('userId', userId).eq('billingId', args.billingId),
      )
      .unique()

    if (exits) return

    await context.db.insert('counters', {
      userId: userId,
      billingId: args.billingId,
      quotas: DEFAULT_QUOTAS,
    })
  },
})

export const get = query({
  args: {
    billingId: v.string(),
  },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context)

    if (!userId) return null

    let usage_ = await context.db
      .query('counters')
      .withIndex('by_userId_billingId', (q) =>
        q.eq('userId', userId).eq('billingId', args.billingId),
      )
      .unique()

    if (usage_ === null) {
      const subscription = await context.db
        .query('stripeSubscriptions')
        .withIndex('byCustomerId', (q) => q.eq('customerId', userId))
        .unique()

      if (
        !subscription ||
        !subscription.stripe ||
        subscription.stripe.items.data.length === 0 ||
        subscription.stripe.status !== 'active'
      ) {
        usage_ = {
          _id: 'temporary' as Id<'counters'>,
          userId: userId,
          billingId: args.billingId,
          quotas: DEFAULT_QUOTAS,
          _creationTime: Date.now(),
        }
      } else {
        const derivedBillingId =
          await CreditsService.deriveBillingId(subscription)

        usage_ = {
          _id: 'temporary' as Id<'counters'>,
          userId: userId,
          billingId: derivedBillingId || args.billingId,
          quotas: DEFAULT_QUOTAS,
          _creationTime: Date.now(),
        }
      }
    }

    return usage_
  },
})
