import { ChatBubbleIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Callout,
  Card,
  Flex,
  Heading,
  Link,
  Separator,
  Text,
  Tooltip,
} from '@radix-ui/themes'
import { useRouteContext } from '@tanstack/react-router'

import { WhatsappIcon } from '@/components/icons/whatsapp'

export interface PhoneShortcutCardProps {}

export const PhoneShortcutCard: React.FC<PhoneShortcutCardProps> = () => {
  const context = useRouteContext({ from: '/(main)/dashboard/' })

  const phone = context.phone.phone

  if (!context.subscription.isSubscribed)
    return (
      <Card size="4" className="p-0!">
        <Box p="4">
          <Heading>
            <span className="underline">WhatsApp</span> Phone Number
          </Heading>
          <Text color="gray">
            You can use the following phone number to chat with your AI
            assistant on{' '}
            <Tooltip content={'WhatsApp'} side="bottom" delayDuration={0}>
              <Text align={'center'}>
                <WhatsappIcon />
                <Text weight={'bold'}>WhatsApp</Text>
              </Text>
            </Tooltip>
            .
          </Text>
        </Box>
        <Separator size="4" orientation="horizontal" className="w-full!" />
        <Box p={'4'}>
          <Flex direction={'column'} gap={'4'}>
            <Callout.Root color="orange">
              <Callout.Icon>
                <ExclamationTriangleIcon />
              </Callout.Icon>
              <Callout.Text>
                You need to be subscribed to access a WhatsApp phone number.
                Please subscribe to a plan to get started.
              </Callout.Text>
            </Callout.Root>
          </Flex>
        </Box>
      </Card>
    )

  if (!phone)
    return (
      <Card size="4" className="p-0!">
        <Box p="4">
          <Heading>
            <span className="underline">WhatsApp</span> Phone Number
          </Heading>
          <Text color="gray">
            You can use the following phone number to chat with your AI
            assistant on{' '}
            <Tooltip content={'WhatsApp'} side="bottom" delayDuration={0}>
              <Text align={'center'}>
                <WhatsappIcon />
                <Text weight={'bold'}>WhatsApp</Text>
              </Text>
            </Tooltip>
            .
          </Text>
        </Box>
        <Separator size="4" orientation="horizontal" className="w-full!" />
        <Box p={'4'}>
          <Flex direction={'column'} gap={'4'}>
            <Callout.Root color="red">
              <Callout.Icon>
                <ExclamationTriangleIcon />
              </Callout.Icon>
              <Callout.Text>
                No WhatsApp number is currently assigned to your account. Please
                contact support (
                <a
                  className="underline"
                  target="_blank"
                  href="mailto:support@closeby.tel"
                >
                  support@closeby.tel
                </a>
                ) for help.
              </Callout.Text>
            </Callout.Root>
          </Flex>
        </Box>
      </Card>
    )

  return (
    <Card size="4" className="p-0!">
      <Box p="4">
        <Heading>
          <span className="underline">WhatsApp</span> Phone Number
        </Heading>
        <Text color="gray">
          You can use the following phone number to chat with your AI assistant
          on{' '}
          <Tooltip content={'WhatsApp'} side="bottom" delayDuration={0}>
            <Text align={'center'}>
              <WhatsappIcon />
              <Text weight={'bold'}>WhatsApp</Text>
            </Text>
          </Tooltip>
          .
        </Text>
      </Box>
      <Separator size="4" orientation="horizontal" className="w-full!" />
      <Box p={'4'}>
        <Flex direction={'column'} gap={'4'}>
          <Callout.Root>
            <Callout.Icon>
              <ExclamationTriangleIcon />
            </Callout.Icon>
            <Callout.Text>
              Careful do not share this number publicly as received messages
              might be charged to your account.
            </Callout.Text>
          </Callout.Root>
          <Link href="/dashboard/whatsapp" target="_blank">
            <Button variant="classic" size="4" className="w-full!">
              <ChatBubbleIcon width={18} height={18} />
              {phone}
            </Button>
          </Link>
        </Flex>
      </Box>
    </Card>
  )
}
