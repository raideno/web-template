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
                <Heading size="8">Lorem Ipsum Dolor Sit Amet</Heading>
                <Text size="4" color="gray">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum. Works directly inside of{' '}
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
                      Lorem Ipsum
                    </Authenticated>
                    <Unauthenticated>
                      <ChatBubbleIcon width={18} height={18} />
                      Lorem Ipsum Dolor
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
                      src="https://www.youtube.com/embed/abcdefgh"
                      title="Lorem Ipsum Video"
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
              <Heading size="4">Lorem Ipsum</Heading>
              <Text color="gray" size="2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </Text>
            </Card>
            <Card>
              <Heading size="4">Dolor Sit Amet</Heading>
              <Text color="gray" size="2">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat.
              </Text>
            </Card>
            <Card>
              <Heading size="4">Consectetur Adipiscing</Heading>
              <Text color="gray" size="2">
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur.
              </Text>
            </Card>
          </Grid>
        </Flex>
      </Container>
    )
  },
})
