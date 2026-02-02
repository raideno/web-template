import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const OnboardingsTable = () =>
  defineTable({
    userId: v.id('users'),
    id: v.string(),
    version: v.number(),
  })
    .index('by_userId', ['userId'])
    .index('byIdUserId', ['id', 'userId'])
