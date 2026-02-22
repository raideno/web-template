import { router } from "@/app";
import { convex } from "@/main";

import { api } from "backend/convex/api";

export type AuthMode = "phone" | "email" | "google";

export interface AuthenticationContextType {
  signInOtp: {
    send: (params: { phone: string }) => Promise<{ started: boolean }>;
    validate: (params: {
      phone: string;
      code: string;
    }) => Promise<{ tokens: { token: string; refreshToken: string } | null }>;
  };
  signInPassword: {
    signIn: (params: {
      email: string;
      password: string;
    }) => Promise<{ tokens: { token: string; refreshToken: string } | null }>;
    signUp: (params: {
      email: string;
      password: string;
      name?: string;
    }) => Promise<{ tokens: { token: string; refreshToken: string } | null }>;
  };
  signInGoogle: {
    initiate: () => Promise<{ redirectUrl: string }>;
  };
  signInMagic: {
    exchange: (params: { code: string }) => Promise<{
      tokens: { token: string; refreshToken: string } | null;
      redirectTo: string;
    }>;
  };
  signOut: () => Promise<void>;
}

export async function loadAuthenticationContext(): Promise<AuthenticationContextType> {
  const namespace = convex.url
    .replaceAll("://", "")
    .replaceAll("-", "")
    .replaceAll(".", "");

  const JWT_STORAGE_KEY = `__convexAuthJWT_${namespace}`;
  const REFRESH_TOKEN_STORAGE_KEY = `__convexAuthRefreshToken_${namespace}`;

  const persistTokensAndInvalidate = async (tokens: {
    token: string;
    refreshToken: string;
  }) => {
    localStorage.setItem(JWT_STORAGE_KEY, tokens.token);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
    await router.invalidate();
  };

  const signInOtp: AuthenticationContextType["signInOtp"] = {
    send: async (params) => {
      return await (convex.action(api.auth.signIn, {
        provider: "whatsapp-otp",
        params: { phone: params.phone },
      }) as ReturnType<AuthenticationContextType["signInOtp"]["send"]>);
    },

    validate: async (params) => {
      const response = await (convex.action(api.auth.signIn, {
        provider: "whatsapp-otp",
        params: { phone: params.phone, code: params.code },
      }) as ReturnType<AuthenticationContextType["signInOtp"]["validate"]>);

      if (response.tokens) {
        await persistTokensAndInvalidate(response.tokens);
      }

      return response;
    },
  };

  const signInPassword: AuthenticationContextType["signInPassword"] = {
    signIn: async (params) => {
      const response = await (convex.action(api.auth.signIn, {
        provider: "password",
        params: {
          flow: "signIn",
          email: params.email,
          password: params.password,
        },
      }) as ReturnType<AuthenticationContextType["signInPassword"]["signIn"]>);

      if (response.tokens) {
        await persistTokensAndInvalidate(response.tokens);
      }

      return response;
    },

    signUp: async (params) => {
      const response = await (convex.action(api.auth.signIn, {
        provider: "password",
        params: {
          flow: "signUp",
          email: params.email,
          password: params.password,
          name: params.name,
        },
      }) as ReturnType<AuthenticationContextType["signInPassword"]["signUp"]>);

      if (response.tokens) {
        await persistTokensAndInvalidate(response.tokens);
      }

      return response;
    },
  };

  const signInGoogle: AuthenticationContextType["signInGoogle"] = {
    initiate: async () => {
      const response = await (convex.action(api.auth.signIn, {
        provider: "google",
        params: {},
      }) as ReturnType<AuthenticationContextType["signInGoogle"]["initiate"]>);

      return response;
    },
  };

  const signInMagic: AuthenticationContextType["signInMagic"] = {
    exchange: async (params) => {
      const response = await (convex.action(api.magics.exchange, {
        code: params.code,
      }) as ReturnType<AuthenticationContextType["signInMagic"]["exchange"]>);

      if (response.tokens) {
        await persistTokensAndInvalidate(response.tokens);
      }

      return response;
    },
  };

  const signOut = async () => {
    try {
      await convex.action(api.auth.signOut, {});
    } catch {
      // Ignore errors, usually means already signed out
    }

    localStorage.removeItem(JWT_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);

    await router.invalidate();
  };

  return {
    signInOtp,
    signInPassword,
    signInGoogle,
    signInMagic,
    signOut,
  };
}
