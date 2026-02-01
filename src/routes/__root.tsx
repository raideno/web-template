import '@radix-ui/themes/styles.css'

import { ReloadIcon, TrashIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Skeleton,
  Theme,
} from '@radix-ui/themes'
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import type { QueryClient } from '@tanstack/react-query'

import type { AuthenticationContextType } from '@/contexts/tanstack/authentication'
import type { OnboardingsContextType } from '@/contexts/tanstack/onboardings'
import type { SubscriptionContextType } from '@/contexts/tanstack/subscription'

import { loadAuthenticationContext } from '@/contexts/tanstack/authentication'
import { loadOnboardingsContext } from '@/contexts/tanstack/onboardings'
import { loadSubscriptionContext } from '@/contexts/tanstack/subscription'

import appCss from '@/styles/app.css?url'

import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'

import {
  PageHeaderCard,
  PageHeaderCardSkeleton,
} from '@/components/layout/page-header-card'
import {
  AlertDialogProvider,
  useConfirm,
} from '@/components/providers/confirmation-dialog'
import { ACCENT_COLOR, DEFAULT_THEME } from '@/contexts/react/theme'
import { cn } from '@/lib/utils'

export interface RouteContext {
  queryClient: QueryClient
  authentication: AuthenticationContextType
  subscription: SubscriptionContextType
  onboardings: OnboardingsContextType
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Theme accentColor={ACCENT_COLOR} appearance={DEFAULT_THEME}>
      <AlertDialogProvider>
        <div
          className={cn(
            'min-h-screen grid grid-rows-[auto_1fr_auto] h-full max-w-3xl',
            'px-4 mx-auto space-y-4 py-4',
            'border-x border-x-(--gray-7)',
            DEFAULT_THEME === 'light' && 'bg-[#f9f9f8]',
            DEFAULT_THEME === 'dark' && 'bg-[#171918]',
          )}
        >
          <Navbar />
          {children}
          <Footer />
        </div>
      </AlertDialogProvider>
    </Theme>
  )
}

export const Route = createRootRouteWithContext<RouteContext>()({
  beforeLoad: async () => {
    const [authentication, subscription, onboardings] = await Promise.all([
      loadAuthenticationContext(),
      loadSubscriptionContext(),
      loadOnboardingsContext(),
    ])

    return {
      authentication,
      subscription,
      onboardings,
    }
  },
  head: () => {
    const name = 'closeby.tel'
    const title =
      'closeby.tel — AI Assistant directly on your phone via WhatsApp'
    const description =
      'Experience the power of AI directly on your phone with closeby.tel. Chat, get assistance, and more via WhatsApp.'
    const url = 'https://closeby.tel/'
    const image = 'https://closeby.tel/og/og-image.jpg'
    const imageAlt = 'closeby.tel - AI Assistant directly on your phone.'
    const imageWidth = '1200'
    const imageHeight = '630'
    const handle = '@closebytel'

    return {
      meta: [
        // Existing
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title: 'closeby.tel' },

        // Primary SEO
        { name: 'title', content: title },
        { name: 'description', content: description },
        { name: 'application-name', content: name },
        { name: 'theme-color', content: '#ffffff' },

        // Robots
        { name: 'robots', content: 'index, follow' },
        {
          name: 'googlebot',
          content:
            'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
        },
        { name: 'bingbot', content: 'index, follow' },

        // Open Graph (Facebook, LinkedIn, etc.)
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: name },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url },
        { property: 'og:image', content: image },
        { property: 'og:image:alt', content: imageAlt },
        { property: 'og:image:width', content: imageWidth },
        { property: 'og:image:height', content: imageHeight },

        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: image },
        { name: 'twitter:creator', content: handle },
        { name: 'twitter:site', content: handle },

        // iOS web app capabilities (optional)
        { name: 'apple-mobile-web-app-title', content: name },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png',
        },
        { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
        { rel: 'icon', href: '/favicon.ico' },
      ],
    }
  },
  shellComponent: ({ children }) => {
    return <Layout>{children}</Layout>
  },
  errorComponent: ({ error }) => {
    const router = useRouter()
    const confirm = useConfirm()

    return (
      <Container size="4">
        <Flex direction="column" gap="4">
          <PageHeaderCard
            title="An error occurred"
            description={
              error.message ||
              'Please try refreshing the page or clearing site data.'
            }
          />
          <Card size={'4'} className="p-0!">
            <Box p={'4'}>
              <Flex direction="column" gap="2" align="center">
                <Button
                  className="w-full!"
                  variant="outline"
                  color="gray"
                  onClick={() => {
                    router.invalidate()
                  }}
                >
                  <ReloadIcon />
                  Refresh
                </Button>

                <Button
                  variant="classic"
                  className="w-full!"
                  color="red"
                  onClick={async () => {
                    const result = await confirm({
                      title: 'Clear Site Data',
                      body: 'Are you sure you want to clear all site data? This will log you out and remove all local data.',
                      actionButton: 'Clear Data',
                    })

                    if (result) {
                      localStorage.clear()
                      sessionStorage.clear()
                      window.location.href = '/'
                    }
                  }}
                >
                  <TrashIcon />
                  Clear Data
                </Button>
              </Flex>
            </Box>
          </Card>
        </Flex>
      </Container>
    )
  },
  notFoundComponent: () => <div>404 - Page Not Found</div>,
  pendingComponent: () => (
    <Layout>
      <Box className="grid! grid-rows-[auto_1fr] gap-4">
        <PageHeaderCardSkeleton />
        <Skeleton className="h-full!" />
      </Box>
    </Layout>
  ),
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
