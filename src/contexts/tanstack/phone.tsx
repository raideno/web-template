import { router } from '@/app'
import { api } from '@/convex.generated/api'
import { convex } from '@/main'

export interface PhoneContextType {
  phone: string | null | undefined
  isLoading: boolean
  refresh: () => Promise<void>
}

export async function loadPhoneContext(): Promise<PhoneContextType> {
  const phone = await convex.query(api.messaging.numbers.get, {})

  const refresh = async () => {
    await router.invalidate()
  }

  return {
    phone,
    isLoading: false,
    refresh,
  }
}
