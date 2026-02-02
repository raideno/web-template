export const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL!

const DEFAULT_SITE_URL = 'https://closeby.tel'
export const SITE_URL = process.env.SITE_URL || DEFAULT_SITE_URL

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!

export const CONVEX_SITE_URL = process.env.CONVEX_SITE_URL

export const IS_PRODUCTION =
  (process.env.CONVEX_ENV && process.env.CONVEX_ENV === 'production') ?? true

export const DEFAULT_LIMIT = 0

export const AUTH_CODE_MAX_AGE_IN_SECONDS = 60 * 15

export const AUTH_PROVIDER_NAME = 'whatsapp-otp'

export const AUTH_VERIFICATION_CODE_LENGTH = 6

export const MAGIC_LINK_AUTH_CODE_LENGTH = 32
