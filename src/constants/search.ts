import z from 'zod'

export const REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME = 'requireAuth' as const
export const REQUIRE_AUTHENTICATION_SEARCH_PARAM_ZOD_VALIDATOR = z
  .boolean()
  .optional()
export type REQUIRE_AUTHENTICATION_SEARCH_PARAM_TYPE = z.infer<
  typeof REQUIRE_AUTHENTICATION_SEARCH_PARAM_ZOD_VALIDATOR
>

export const COME_BACK_FROM_REDIRECT_SEARCH_PARAM_NAME =
  'comeBackFromRedirect' as const
export const COME_BACK_FROM_REDIRECT_SEARCH_PARAM_ZOD_VALIDATOR = z
  .boolean()
  .optional()
export type COME_BACK_FROM_REDIRECT_SEARCH_PARAM_TYPE = z.infer<
  typeof COME_BACK_FROM_REDIRECT_SEARCH_PARAM_ZOD_VALIDATOR
>

export const REDIRECT_TO_SEARCH_PARAM_NAME = 'redirectTo' as const
export const REDIRECT_TO_SEARCH_PARAM_ZOD_VALIDATOR = z.string().optional()
export type REDIRECT_TO_SEARCH_PARAM_TYPE = z.infer<
  typeof REDIRECT_TO_SEARCH_PARAM_ZOD_VALIDATOR
>

export const SUBSCRIPTION_RETURN_SEARCH_PARAM_NAME =
  'subscriptionReturn' as const
export const SUBSCRIPTION_RETURN_SEARCH_PARAM_ZOD_VALIDATOR = z
  .enum(['success', 'cancel'])
  .optional()
export type SUBSCRIPTION_RETURN_SEARCH_PARAM_TYPE = z.infer<
  typeof SUBSCRIPTION_RETURN_SEARCH_PARAM_ZOD_VALIDATOR
>
