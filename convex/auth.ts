import { Phone } from '@convex-dev/auth/providers/Phone'
import { convexAuth, getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { alphabet, generateRandomString } from 'oslo/crypto'

import type {
  GenericActionCtxWithAuthConfig,
  PhoneConfig,
} from '@convex-dev/auth/server'

import type { DataModel } from '@/convex.generated/dataModel'

import { internal } from '@/convex.generated/api'
import { internalQuery, mutation, query } from '@/convex.generated/server'

import {
  AUTH_CODE_MAX_AGE_IN_SECONDS,
  AUTH_PROVIDER_NAME,
  AUTH_VERIFICATION_CODE_LENGTH,
  IS_PRODUCTION,
} from '@/convex/parameters'

interface Params {
  identifier: string
  url: string
  expires: Date
  provider: PhoneConfig
  token: string
}

const sendVerificationRequestConsole = async (
  params: Params,
  _: GenericActionCtxWithAuthConfig<DataModel>,
) => {
  console.log('[params.token]:', params.token)
}
const sendVerificationRequestTwilio = async (
  params: Params,
  context: GenericActionCtxWithAuthConfig<DataModel>,
) => {
  throw new Error('Not implemented.')
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Phone({
      id: AUTH_PROVIDER_NAME,
      maxAge: AUTH_CODE_MAX_AGE_IN_SECONDS,
      generateVerificationToken: async () =>
        await generateRandomString(
          AUTH_VERIFICATION_CODE_LENGTH,
          alphabet('0-9'),
        ),
      sendVerificationRequest: IS_PRODUCTION
        ? sendVerificationRequestTwilio
        : sendVerificationRequestConsole,
      apiKey: '',
    }),
  ],
  callbacks: {
    afterUserCreatedOrUpdated: async (context, args) => {
      const isNewUser = args.existingUserId === null

      await context.scheduler.runAfter(0, internal.stripe.setup, {
        entityId: args.userId,
        email: args.profile.email,
      })
    },
  },
})

export const self = query({
  args: {},
  handler: async (context) => {
    const userId = await getAuthUserId(context)

    if (!userId) return null

    const user = await context.db.get(userId)

    if (!user) return null

    return user
  },
})

export const update = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context)

    if (!userId) throw new Error('Unauthorized')

    await context.db.patch(userId, {
      name: args.name,
    })

    return { success: true }
  },
})

export const developer = mutation({
  args: {
    enabled: v.boolean(),
  },
  handler: async (context, args) => {
    const userId = await getAuthUserId(context)

    if (!userId) throw new Error('Unauthorized')

    const user = await context.db.get(userId)
    if (!user) throw new Error('User not found')

    if (!user.developer) throw new Error('Developer profile not found')

    await context.db.patch(userId, {
      developer: {
        enabled: args.enabled,
      },
    })

    return { success: true }
  },
})

export const get = internalQuery({
  args: {
    userId: v.id('users'),
  },
  handler: async (context, args) => {
    return await context.db.get(args.userId)
  },
})
