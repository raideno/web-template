import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const CountersTable = () =>
  defineTable({
    userId: v.id('users'),
    billingId: v.string(),
    quotas: v.record(v.string(), v.union(
      v.object({
        type: v.literal('consumable') ,
        current: v.number(),
        limit: v.number(),
      }),
      v.object({
        type: v.literal('fixed') ,
        limit: v.number(),
      })
    ))
  })
    .index('by_userId', ['userId'])
    .index('by_billingId', ['billingId'])
    .index('by_userId_billingId', ['userId', 'billingId'])

export const DEFAULT_QUOTAS = {
  messages: { type: 'consumable', current: 0, limit: 1000 },
  schedules: { type: 'fixed', limit: 10 },
} as const
