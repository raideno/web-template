import { Box, Card, Container, Flex } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'

import { PageHeaderCard } from '@/components/layout/page-header-card'

export const Route = createFileRoute('/(main)/pages/help')({
  component: () => {
    const markdown = `
Welcome to the Closeby.tel help center. This page covers quick tips and a short FAQ.

## Getting Started
- Browse the Pages section for About, Terms, and Privacy.
- Reach out anytime at [contact@closeby.tel](mailto:contact@closeby.tel). Please consider checking your SPAM folder if you don't see a reply.

## FAQ
### What is Closeby.tel?
Closeby.tel is a lightweight communication and AI assistance platform focused on speed, clarity, and privacy-first design.

### How do I contact support?
Email us at [support@closeby.tel](mailto:support@closeby.tel). We typically reply within 1-2 business days. Please consider checking your SPAM folder if you don't see a reply.

### Do you store my data?
We keep data minimal and necessary for operation. See the Privacy Policy for details.

### Can I request a feature?
Yes! Send your suggestion to [contact@closeby.tel](mailto:contact@closeby.tel) with as much detail as you can. Please consider checking your SPAM folder if you don't see a reply.`

    return (
      <Container size={'4'}>
        <Flex direction="column" gap="4">
          <PageHeaderCard
            title="Help"
            description="Help center and common FAQs"
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
