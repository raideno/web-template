import { Box, Button, Callout, Card, Heading, Text } from '@radix-ui/themes'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import z from 'zod'

export const Route = createFileRoute('/(main)/authentication/magic')({
  validateSearch: z.object({
    _code: z.string(),
  }),
  beforeLoad: async ({ context, search }) => {
    console.log('[magic.tsx] search params:', search)
    if (!search._code || search._code === 'undefined') {
      throw new Error('Missing or invalid magic link code')
    }

    const response = await context.authentication.signInMagic.exchange({
      code: search._code,
    })

    if (response.tokens) {
      console.log(
        '[magic.tsx] authentication successful, redirecting to:',
        response.redirectTo,
      )
    } else {
      throw new Error('Magic link authentication failed')
    }

    throw redirect({
      to: response.redirectTo || '/dashboard',
      reloadDocument: true,
    })
  },
  errorComponent: ({ error }) => {
    return (
      <Card className="p-0!" size="4">
        <Box p="4">
          <Callout.Root color="red" mb="4">
            <Box>
              <Callout.Text>
                <Heading mb={'0'} size="4">
                  SignIn Process Failed
                </Heading>
              </Callout.Text>
              <Text color="gray" size="2">
                {error.message}
              </Text>
            </Box>
          </Callout.Root>
          {/* TODO: should fetch the associated magic and get the redirect */}
          <Link to={'/dashboard'}>
            <Button variant="classic" className="w-full!" size={'3'}>
              Manually SigIn
            </Button>
          </Link>
        </Box>
      </Card>
    )
  },
  pendingComponent: () => {
    return (
      <Card className="p-0!" size="4">
        <Box p="4">
          <Heading size="5" mb="4">
            Authenticating...
          </Heading>
          <Text color="gray" size="2">
            Verifying your magic link
          </Text>
        </Box>
      </Card>
    )
  },
  component: () => {
    return (
      <Card className="p-0!" size="4">
        <Box p="4">
          <Heading size="5">Authenticating...</Heading>
          <Text color="gray" size="2">
            Please wait while we verify your identity
          </Text>
        </Box>
      </Card>
    )
  },
})
