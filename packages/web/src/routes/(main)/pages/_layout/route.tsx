import {
  Outlet,
  createFileRoute,
  useLocation,
  useRouter,
} from '@tanstack/react-router'
import { MDXProvider } from '@mdx-js/react'
import { Box, Card, Container, Flex } from '@radix-ui/themes'

import { PageHeaderCard } from '@/components/layout/page-header-card'

export const Route = createFileRoute('/(main)/pages/_layout')({
  component: () => {
    const router = useRouter()

    const location = useLocation()

    const pages = Object.entries(router.routesByPath)
      .filter(([path, _]) => path === location.href)
      .filter(([_, route]) => 'head' in route.options)
      .map(([path, route]) => {
        const metadata = Object.fromEntries(
          route.options
            .head()
            .meta.map(
              (
                meta: React.DetailedHTMLProps<
                  React.MetaHTMLAttributes<HTMLMetaElement>,
                  HTMLMetaElement
                >,
              ) => [meta.name, meta.content],
            ),
        )
        return {
          to: path,
          title: metadata.title,
          description: metadata.description,
        }
      })

    const page = pages.length === 1 ? pages[0] : { title: '', description: '' }

    return (
      <Container size={'4'}>
        <Flex direction="column" gap="4">
          {/* TODO: fetch the page title, etc somehow */}
          <PageHeaderCard title={page.title} description={page.description} />
          <Card size="4" className="p-0!">
            <Box p="4">
              <MDXProvider>
                <div className="prose prose-sm prose-h2:my-0! max-w-none markdown-body">
                  <Outlet />
                </div>
              </MDXProvider>
            </Box>
          </Card>
        </Flex>
      </Container>
    )
  },
})
