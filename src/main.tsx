import '@/styles/app.css'

import '@radix-ui/themes/styles.css'

import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConvexReactClient } from 'convex/react'
import React from 'react'
import ReactDOM from 'react-dom/client'

import { ThemeProvider } from '@/contexts/react/theme'

import { Toaster } from '@/components/ui/sonner'

import { App } from '@/app'

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!
if (!CONVEX_URL) {
  console.error('missing envar CONVEX_URL')
}
export const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL as string,
)

const convexQueryClient = new ConvexQueryClient(convex)
const queryClient: QueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
})
convexQueryClient.connect(queryClient)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConvexAuthProvider client={convex}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Toaster />
          <App queryClient={queryClient} />
        </ThemeProvider>
      </QueryClientProvider>
    </ConvexAuthProvider>
  </React.StrictMode>,
)
