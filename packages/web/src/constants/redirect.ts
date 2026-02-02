import type { SUBSCRIPTION_RETURN_SEARCH_PARAM_TYPE } from '@/constants/search'

import { SUBSCRIPTION_RETURN_SEARCH_PARAM_NAME } from '@/constants/search'

const SUBSCRIPTION_SUCCESS_REDIRECT_SEARCH_PARAMS = new URLSearchParams({
  [SUBSCRIPTION_RETURN_SEARCH_PARAM_NAME]:
    'success' satisfies SUBSCRIPTION_RETURN_SEARCH_PARAM_TYPE,
}).toString()
export const SUBSCRIPTION_SUCCESS_REDIRECT_URL = `${window.location.origin}/dashboard?${SUBSCRIPTION_SUCCESS_REDIRECT_SEARCH_PARAMS}`

const SUBSCRIPTION_CANCEL_REDIRECT_SEARCH_PARAMS = new URLSearchParams({
  [SUBSCRIPTION_RETURN_SEARCH_PARAM_NAME]:
    'cancel' satisfies SUBSCRIPTION_RETURN_SEARCH_PARAM_TYPE,
}).toString()
export const SUBSCRIPTION_CANCEL_REDIRECT_URL = `${window.location.origin}/dashboard?${SUBSCRIPTION_CANCEL_REDIRECT_SEARCH_PARAMS}`

export const PORTAL_RETURN_URL = `${window.location.origin}/dashboard`
