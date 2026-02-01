import { router } from '@/app'
import { api } from '@/convex.generated/api'
import { convex } from '@/main'

// __convexAuthJWT_httpscolorlessswordfish824convexcloud
// https://colorless-swordfish-824.convex.cloud

export interface AuthenticationContextType {
  signInOtp: {
    send: (params: { phone: string }) => Promise<{ started: boolean }>
    validate: (params: {
      phone: string
      code: string
    }) => Promise<{ tokens: { token: string; refreshToken: string } | null }>
  }
  signInMagic: {
    exchange: (params: { code: string }) => Promise<{
      tokens: { token: string; refreshToken: string } | null
      redirectTo: string
    }>
  }
  signOut: () => Promise<void>
}

export async function loadAuthenticationContext(): Promise<AuthenticationContextType> {
  const namespace = convex.url
    .replaceAll('://', '')
    .replaceAll('-', '')
    .replaceAll('.', '')

  const JWT_STORAGE_KEY = `__convexAuthJWT_${namespace}`
  const REFRESH_TOKEN_STORAGE_KEY = `__convexAuthRefreshToken_${namespace}`

  const signIn: AuthenticationContextType['signInOtp']['send'] =
    async (params: { phone: string; code?: string }) => {
      return await (convex.action(api.auth.signIn, {
        provider: 'whatsapp-otp',
        params: { phone: params.phone },
      }) as ReturnType<AuthenticationContextType['signInOtp']['send']>)
    }

  const validate: AuthenticationContextType['signInOtp']['validate'] =
    async (params: { phone: string; code: string }) => {
      const response = await (convex.action(api.auth.signIn, {
        provider: 'whatsapp-otp',
        params: { phone: params.phone, code: params.code },
      }) as ReturnType<AuthenticationContextType['signInOtp']['validate']>)

      if (response.tokens) {
        localStorage.setItem(JWT_STORAGE_KEY, response.tokens.token)
        localStorage.setItem(
          REFRESH_TOKEN_STORAGE_KEY,
          response.tokens.refreshToken,
        )

        await router.invalidate()
      }

      return response
    }

  const exchange: AuthenticationContextType['signInMagic']['exchange'] =
    async (params: { code: string }) => {
      const response = await (convex.action(api.magics.exchange, {
        code: params.code,
      }) as ReturnType<AuthenticationContextType['signInMagic']['exchange']>)

      if (response.tokens) {
        localStorage.setItem(JWT_STORAGE_KEY, response.tokens.token)
        localStorage.setItem(
          REFRESH_TOKEN_STORAGE_KEY,
          response.tokens.refreshToken,
        )

        await router.invalidate()
      }

      return response
    }

  const signOut = async () => {
    try {
      await convex.action(api.auth.signOut, {})
    } catch (error) {
      // Ignore errors, usually means already signed out
    }

    localStorage.removeItem(JWT_STORAGE_KEY)
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)

    await router.invalidate()
  }

  return {
    signInOtp: {
      send: signIn,
      validate,
    },
    signInMagic: {
      exchange,
    },
    signOut,
  }
}
