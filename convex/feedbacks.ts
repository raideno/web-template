import { getAuthUserId } from '@convex-dev/auth/server'
import { HOUR, RateLimiter } from '@convex-dev/rate-limiter'
import { z } from 'zod'

import { components } from '@/convex.generated/api'

import { zMutation } from '@/convex/helpers'

const limiter = new RateLimiter(components.rateLimiter, {
  feedbacks: { kind: 'fixed window', rate: 5, period: HOUR },
})

export const send = zMutation({
  args: {
    email: z.email().optional(),
    title: z.string().max(128),
    content: z.string().max(2048),
    tag: z.union([
      z.literal('bug'),
      z.literal('feature'),
      z.literal('rating'),
      z.literal('other'),
    ]),
    urls: z.array(z.url()).max(4),
    attachmentUrls: z.array(z.url()).max(8),
  },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context)

    if (!userId) throw new Error('You must be logged in to send feedback.')

    const status = await limiter.limit(context, 'feedbacks', { key: userId })

    if (!status.ok)
      throw new Error(
        `Rate limit exceeded. Please try again later ${status.retryAfter} seconds.`,
      )

    await context.db.insert('feedbacks', {
      email: args.email,
      title: args.title,
      content: args.content,
      tag: args.tag,
      urls: args.urls,
      attachmentUrls: args.attachmentUrls,
      userId: userId,
    })
  },
})
