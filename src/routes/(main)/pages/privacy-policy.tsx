import { createFileRoute } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'
import { Box, Card, Container, Flex } from '@radix-ui/themes'

import { PageHeaderCard } from '@/components/layout/page-header-card'

export const Route = createFileRoute('/(main)/pages/privacy-policy')({
  component: () => {
    const markdown = `
Last updated: ${new Date().toLocaleDateString()}

We take your privacy seriously. This page outlines what we collect and how we use it.

## Data We Collect
- Account details you provide (name, email, phone).
- Usage events necessary to operate the service.

## How We Use Data
- To provide, maintain, and improve Closeby.tel.
- To communicate important updates related to your account.

## Data Sharing
We do **not** sell your data. We only share with infrastructure providers strictly necessary to deliver the service.

## Your Choices
- You may request data export or deletion at any time by contacting support.

## Contact
Questions? Email [contact@closeby.tel](mailto:contact@closeby.tel). Please consider checking your SPAM folder if you don't see a reply.
`

    return (
      <Container size={'4'}>
        <Flex direction="column" gap="4">
          <PageHeaderCard
            title="Privacy Policy"
            description="How we collect, use, and protect your data"
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
