import { Box, Card, Container, Flex } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'

import { PageHeaderCard } from '@/components/layout/page-header-card'

export const Route = createFileRoute('/(main)/pages/about')({
  component: () => {
    const markdown = `
Closeby.tel is a lightweight communication and AI assistance platform focused on **speed**, **clarity**, and **privacy-first design**.

## What We Do
- Enable programmable messaging workflows.
- Provide an AI assistant that integrates with your data.
- Keep your operational surface minimal.

## Principles
1. Respect user time.
2. Prefer boring tech when possible.
3. Ship small, iterate fast.

## Contact
Have feedback? Reach out any time: support@closeby.tel
    `
    return (
      <Container size={'4'}>
        <Flex direction="column" gap="4">
          <PageHeaderCard
            title="About"
            description="Learn more about the mission behind Closeby.tel"
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
