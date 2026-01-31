import { ChatBubbleIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Tooltip,
} from '@radix-ui/themes'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Authenticated, Unauthenticated } from 'convex/react'
import z from 'zod'

import { SmsIcon } from '@/components/icons/sms'
import { WhatsappIcon } from '@/components/icons/whatsapp'
import { AuthDialog } from '@/components/layout/auth-dialog'
import {
  REDIRECT_TO_SEARCH_PARAM_NAME,
  REDIRECT_TO_SEARCH_PARAM_ZOD_VALIDATOR,
  REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME,
  REQUIRE_AUTHENTICATION_SEARCH_PARAM_ZOD_VALIDATOR,
} from '@/constants/search'

export const Route = createFileRoute('/')({
  validateSearch: z.object({
    [REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME]:
      REQUIRE_AUTHENTICATION_SEARCH_PARAM_ZOD_VALIDATOR,
    [REDIRECT_TO_SEARCH_PARAM_NAME]: REDIRECT_TO_SEARCH_PARAM_ZOD_VALIDATOR,
  }),
  component: () => {
    return (
      <Container size={'4'}>
        <AuthDialog />
        <Flex direction="column" gap="4">
          <Card size="4" className="p-0!">
            <Flex
              direction={{ initial: 'column', md: 'row' }}
              gap="6"
              p="4"
              align="center"
              justify="between"
              wrap="wrap"
            >
              <Flex direction="column" gap="3" flexGrow="1">
                <Heading size="8">An Assistant always by your side</Heading>
                <Text size="4" color="gray">
                  Get instant help, ideas and answers through a conversational
                  assistant that remembers context and works directly inside of{' '}
                  <Tooltip content={'WhatsApp'} side="bottom" delayDuration={0}>
                    <Text align={'center'}>
                      <WhatsappIcon />
                      <Text weight={'bold'}>WhatsApp</Text>
                    </Text>
                  </Tooltip>{' '}
                  and{' '}
                  <Tooltip content={'SMS'} side="bottom" delayDuration={0}>
                    <Text align={'center'}>
                      <SmsIcon />
                      <Text weight={'bold'}>SMS</Text>.
                    </Text>
                  </Tooltip>
                </Text>

                <Link to="/dashboard">
                  <Button variant="classic" size="4" className="w-full!">
                    <Authenticated>
                      <ChatBubbleIcon width={18} height={18} />
                      Dashboard
                    </Authenticated>
                    <Unauthenticated>
                      <ChatBubbleIcon width={18} height={18} />+ (0) 123 xxx xxx
                    </Unauthenticated>
                  </Button>
                </Link>
              </Flex>
              <Box className="w-full aspect-video">
                <Card
                  size="3"
                  className="relative overflow-hidden h-full w-full p-0!"
                >
                  <Box
                    style={{ paddingBottom: '56.25%' }}
                    className="relative w-full"
                  >
                    <iframe
                      className="absolute top-0 left-0 w-full h-full rounded-md"
                      src="https://www.youtube.com/embed/KgMyUtphV40"
                      title="How It Works Demo"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </Box>
                </Card>
              </Box>
            </Flex>
          </Card>

          <Grid columns={{ initial: '1', sm: '3' }} gap="4">
            <Card>
              <Heading size="4">Context Memory</Heading>
              <Text color="gray" size="2">
                Conversations stay relevant over time so you don't repeat
                yourself.
              </Text>
            </Card>
            <Card>
              <Heading size="4">Scheduled Messages</Heading>
              <Text color="gray" size="2">
                Set up automated messages to be sent at specific times or
                intervals.
              </Text>
            </Card>
            <Card>
              <Heading size="4">Customizable</Heading>
              <Text color="gray" size="2">
                Tailor the assistant's behavior to suit your unique needs.
              </Text>
            </Card>
          </Grid>
        </Flex>
      </Container>
    )
  },
})
