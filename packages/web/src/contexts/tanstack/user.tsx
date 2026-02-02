import type { FunctionReturnType } from "convex/server";

import { api } from "backend/convex/api";
import { convex } from "@/main";

// __convexAuthJWT_httpscolorlessswordfish824convexcloud
// https://colorless-swordfish-824.convex.cloud

export interface UserContextType {
  user: FunctionReturnType<typeof api.auth.self> | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export async function loadUserContext(): Promise<UserContextType> {
  // TODO: fix invalidation when calling signIn, signOut
  const user = await convex.query(api.auth.self, {});

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading: false,
  };
}
