import { RouterProvider, createRouter } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

import { routeTree } from '@/routeTree.gen'

export const router = createRouter({
  defaultPreload: 'intent',
  // defaultPreloadDelay: 50,
  routeTree,
  context: {
    queryClient: undefined!,
    authentication: undefined!,
    subscription: undefined!,
    onboardings: undefined!,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export const App = ({ queryClient }: { queryClient: QueryClient }) => {
  return (
    <RouterProvider
      router={router}
      context={{
        queryClient,
        authentication: undefined!,
        subscription: undefined!,
        onboardings: undefined!,
      }}
    />
  )
}
