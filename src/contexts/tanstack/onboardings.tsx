import type { FunctionReturnType } from 'convex/server'

import { api } from '@/convex.generated/api'
import { convex } from '@/main'

export interface OnboardingsContextType {
  onboardings:
    | FunctionReturnType<typeof api.onboardings.list>
    | null
    | undefined
  isLoading: boolean
}

export async function loadOnboardingsContext(): Promise<OnboardingsContextType> {
  const onboardings = await convex.query(api.onboardings.list, {})

  return {
    onboardings,
    isLoading: false,
  }
}
