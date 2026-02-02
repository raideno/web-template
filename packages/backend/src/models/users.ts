import { defineTable } from 'convex/server'
import { v } from 'convex/values'

export const UsersTable = () =>
  defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    developer: v.optional(
      v.object({
        enabled: v.boolean(),
      }),
    ),
  })
    .index('email', ['email'])
    .index('phone', ['phone'])
