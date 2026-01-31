import { Box, Card, Container, Flex } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'

import { PageHeaderCard } from '@/components/layout/page-header-card'

export const Route = createFileRoute('/(main)/pages/contact')({
  component: () => {
    const markdown = `
We'd love to hear from you.

## Email
- General inquiries: [contact@closeby.tel](mailto:contact@closeby.tel)
- Support inquiries: [support@closeby.tel](mailto:support@closeby.tel)

Please consider checking your SPAM folder if you don't see a reply.

## When to reach out
- Questions about features or roadmap
- Reporting bugs or security concerns
- Feedback and suggestions

## Response time
We typically respond within 1-2 business days.`

    return (
      <Container size={'4'}>
        <Flex direction="column" gap="4">
          <PageHeaderCard
            title="Contact"
            description="How to reach the Closeby.tel team"
          />
          <Card size="4" className="p-0!">
            <Box p="4">
              <ReactMarkdown className="prose prose-sm prose-h2:my-0! max-w-none markdown-body">
                {markdown}
              </ReactMarkdown>
            </Box>
          </Card>
        </Flex>
      </Container>
    )
  },
})
