import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const MagicsTable = () =>
  defineTable({
    userId: v.id('users'),
    code: v.string(),
    redirectTo: v.string(),
    expireAt: v.number(),
  }).index('byCode', ['code'])
