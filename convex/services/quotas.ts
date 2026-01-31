import { withSystemFields } from 'convex-helpers/validators'
import { v } from 'convex/values'

import type { DataModel, Id } from '@/convex.generated/dataModel'
import type { ActionCtx, MutationCtx } from '@/convex.generated/server'

import { internal } from '@/convex.generated/api'
import { internalMutation } from '@/convex.generated/server'
import { safeParseInt } from '@/convex/helpers'
import { DEFAULT_LIMIT } from '@/convex/parameters'
import schema from '@/convex/schema'
import { DEFAULT_QUOTAS } from '../models/quotas'

export type DeductFromConsumableIfOwnsEnoughType = boolean

export class CreditsService {
  // TODO: add something to fetch the limits

  static async deriveBillingId(
    subscription: DataModel['stripeSubscriptions']['document'],
  ) {
    if (!subscription.stripe || subscription.stripe.items.data.length === 0)
      return null

    const item = subscription.stripe.items.data[0]

    // TODO: any other alternative ?
    // return item.id
    return `${item.current_period_start}.${item.current_period_end}`
  }

  static async deductFromConsumableIfOwnsEnough(
    context: MutationCtx | ActionCtx,
    args: {
      userId: Id<'users'>
      quantity: number;
      quota: string;
      billingId: string
      subscription: DataModel['stripeSubscriptions']['document']
    },
  ): Promise<DeductFromConsumableIfOwnsEnoughType> {
    if ('runAction' in context)
      return await this.deductFromConsumableIfOwnsEnoughFromAction(context, args)
    else if ('runMutation' in context)
      return await this.deductFromConsumableIfOwnsEnoughFromMutation(context, args)
    else
      throw new Error(
        'CreditsService.deductFromConsumableIfOwnsEnough can only be called from MutationCtx or ActionCtx',
      )
  }

  private static async deductFromConsumableIfOwnsEnoughFromAction(
    context: ActionCtx,
    args: {
      userId: Id<'users'>
      quantity: number;
      quota: string;
      billingId: string
      subscription: DataModel['stripeSubscriptions']['document']
    },
  ): Promise<DeductFromConsumableIfOwnsEnoughType> {
    return await context.runMutation(
      internal.services.quotas.deductFromConsumableIfOwnsEnoughFromAction,
      {
        userId: args.userId,
        quantity: args.quantity,
        quota: args.quota,
        billingId: args.billingId,
        subscription: args.subscription,
      },
    )
  }

  private static async deductFromConsumableIfOwnsEnoughFromMutation(
    context: MutationCtx,
    args: {
      userId: Id<'users'>
      quantity: number;
      quota: string;
      billingId: string
      subscription: DataModel['stripeSubscriptions']['document']
    },
  ): Promise<DeductFromConsumableIfOwnsEnoughType> {
    let counter = await context.db
      .query('counters')
      .withIndex('by_userId_billingId', (q) =>
        q.eq('userId', args.userId).eq('billingId', args.billingId),
      )
      .unique()

    if (!counter) {
      // TODO: improve the way we store the limits per subscription, add defaults as well, defaults for each quota
      // const limit = safeParseInt(
      //   args.subscription.stripe.items.data[0].price.metadata['limit'],
      //   DEFAULT_LIMIT,
      // )

      counter = {
        _id: await context.db.insert('counters', {
          userId: args.userId,
          billingId: args.billingId,
          quotas: DEFAULT_QUOTAS,
        }),
        _creationTime: Date.now(),
        userId: args.userId,
        billingId: args.billingId,
        quotas: DEFAULT_QUOTAS
      }
    }

    const targetQuota = counter.quotas[args.quota]

    if (!targetQuota || targetQuota.type !== 'consumable') {
      throw new Error(
        `Quota "${args.quota}" not found or is not consumable`,
      )
    }

    if (
      targetQuota.current === targetQuota.limit ||
      targetQuota.current + args.quantity > targetQuota.limit
    ) {
      return false
    }

    await context.db.patch(counter._id, {
      quotas: {
        ...counter.quotas,
        [args.quota]: {
          ...targetQuota,
          current: targetQuota.current + args.quantity,
        },
      },
    })

    return true
  }
}

export const deductFromConsumableIfOwnsEnoughFromAction = internalMutation({
  args: {
    userId: v.id('users'),
    quantity: v.number(),
    quota: v.string(),
    billingId: v.string(),
    subscription: v.object(
      withSystemFields(
        'stripeSubscriptions',
        schema.tables.stripeSubscriptions.validator.fields,
      ),
    ),
  },
  handler: async (context, args) => {
    return await CreditsService.deductFromConsumableIfOwnsEnough(context, {
      userId: args.userId,
      quantity: args.quantity,
      quota: args.quota,
      billingId: args.billingId,
      subscription: args.subscription,
    })
  },
})
