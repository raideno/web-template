import { Outlet, createFileRoute } from '@tanstack/react-router'
import { MDXProvider } from '@mdx-js/react'
import { Box, Card, Container, Flex } from '@radix-ui/themes'

import { PageHeaderCard } from '@/components/layout/page-header-card'

export const Route = createFileRoute('/(main)/pages/_layout')({
  component: () => {
    return (
      <Container size={'4'}>
        <Flex direction="column" gap="4">
          {/* TODO: fetch the page title, etc somehow */}
          <PageHeaderCard
            title="About"
            description="Learn more about the mission behind Closeby.tel"
          />
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
