import { Box, Card, Container, Flex } from '@radix-ui/themes'
import { createFileRoute } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'

import { PageHeaderCard } from '@/components/layout/page-header-card'

export const Route = createFileRoute('/(main)/pages/terms-of-service')({
  component: () => {
    const markdown = `
These Terms govern your use of Closeby.tel.

## 1. Acceptance
By accessing or using the service you agree to these Terms.

## 2. Use
You agree not to abuse, overload, or attempt to breach security of the platform.

## 3. Subscription
Paid features require an active subscription; billing cycles and refunds are handled via Stripe.

## 4. Limitation of Liability
Service is provided *as-is* with no warranties.

## 5. Changes
We may update these Terms; continued use after changes constitutes acceptance.

## 6. Contact
Questions? Email [contact@closeby.tel](mailto:contact@closeby.tel). Please consider checking your SPAM folder if you don't see a reply.
    `
    return (
      <Container size={'4'}>
        <Flex direction="column" gap="4">
          <PageHeaderCard
            title="Terms of Service"
            description="Rules and conditions for using Closeby.tel"
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
