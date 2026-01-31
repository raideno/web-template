import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const FeedbacksTable = () =>
  defineTable({
    email: v.optional(v.string()),
    title: v.string(),
    content: v.string(),
    tag: v.union(
      v.literal('bug'),
      v.literal('feature'),
      v.literal('rating'),
      v.literal('other'),
    ),
    urls: v.array(v.string()),
    attachmentUrls: v.array(v.string()),
    userId: v.id('users'),
  })
