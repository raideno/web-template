import { InfoCircledIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Callout,
  Dialog,
  Flex,
  Heading,
  Text,
} from '@radix-ui/themes'
import { MetadataRegistry } from '@raideno/auto-form/registry'
import { AutoForm } from '@raideno/auto-form/ui'
import {
  Link,
  getRouteApi,
  useRouteContext,
  useRouter,
} from '@tanstack/react-router'
import React from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  OTPInputControllerFactory,
  OTPInputRenderer,
} from '../controllers/opt-input'
// eslint-disable-next-line import/no-duplicates
import phones from '../controllers/phone-input.json'
// eslint-disable-next-line import/no-duplicates
import { PhoneInputController } from '../controllers/phone-input'

import type { AnyController, AnyRenderer } from '../controllers'

import type { COME_BACK_FROM_REDIRECT_SEARCH_PARAM_TYPE } from '@/constants/search'
import {
  COME_BACK_FROM_REDIRECT_SEARCH_PARAM_NAME,
  REDIRECT_TO_SEARCH_PARAM_NAME,
  REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME,
} from '@/constants/search'

const PhoneAuthSchema = z.object({
  phone: z.tuple([z.string(), z.string()]).register(MetadataRegistry, {
    controller: PhoneInputController as AnyController,
  }),
  consent: z.boolean().register(MetadataRegistry, {
    description: 'I agree to receive WhatsApp messages.',
  }),
})

const PhoneAuthCodeSchema = z.object({
  code: z.string().register(MetadataRegistry, {
    controller: OTPInputControllerFactory({ length: 6 }) as AnyController,
    renderer: OTPInputRenderer as AnyRenderer,
  }),
})

const route = getRouteApi('/')

export interface AuthDialogProps {
  children?: React.ReactNode
}

export const AuthDialog: React.FC<AuthDialogProps> = ({ children }) => {
  const router = useRouter()
  // TODO: careful in case the component is used outside of the route
  const context = useRouteContext({ from: '/' })

  const closingDueToAuthRef = React.useRef(false)

  const search = route.useSearch()

  const requireAuth = Boolean(search[REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME])
  const redirectTo = search[REDIRECT_TO_SEARCH_PARAM_NAME] ?? undefined

  const [isCodeSent, setIsCodeSent] = React.useState(false)
  const [phone, setPhone] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)

  const clearParamsAndMaybeRedirect = React.useCallback(() => {
    if (redirectTo) {
      router.navigate({
        to: redirectTo,
        search: (old) => ({
          ...old,
          [REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME]: undefined,
          [REDIRECT_TO_SEARCH_PARAM_NAME]: undefined,
          [COME_BACK_FROM_REDIRECT_SEARCH_PARAM_NAME]:
            true satisfies COME_BACK_FROM_REDIRECT_SEARCH_PARAM_TYPE,
        }),
        reloadDocument: true,
      })
    } else {
      router.navigate({
        to: '/',
        search: (old) => ({
          ...old,
          [REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME]: undefined,
          [REDIRECT_TO_SEARCH_PARAM_NAME]: undefined,
        }),
      })
    }
  }, [redirectTo, router])

  const handleSendCode = async (data: z.infer<typeof PhoneAuthSchema>) => {
    if (!data.consent) {
      toast.error('You must agree to receive WhatsApp messages.')
      return
    }

    const cleanedPhone = data.phone[1].replace(/^0/, '').replace(/\s/g, '')

    if (!/^\d+$/.test(cleanedPhone)) {
      toast.error('Phone number must contain only digits.')
      return
    }

    if (cleanedPhone.length < 7) {
      toast.error('Phone number must be at least 7 digits.')
      return
    }

    if (!phones.map((p) => p.dial_code).includes(`+${data.phone[0]}`)) {
      toast.error('Please select a valid country code.')
      return
    }

    try {
      setIsLoading(true)
      await context.authentication.signInOtp.send({
        phone: `+${data.phone[0]}${cleanedPhone}`,
      })
      setPhone(`+${data.phone[0]}${cleanedPhone}`)
      setIsCodeSent(true)
      toast.success('Verification code sent successfully!')
    } catch (error) {
      console.error('Error sending code:', error)
      toast.error('Failed to send verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeConfirmation = async (
    data: z.infer<typeof PhoneAuthCodeSchema>,
  ) => {
    setIsLoading(true)
    try {
      await context.authentication.signInOtp.validate({
        phone: phone,
        code: data.code,
      })
      toast.success('Successfully authenticated!')
      if (requireAuth) {
        closingDueToAuthRef.current = true
        clearParamsAndMaybeRedirect()
      } else {
        setIsOpen(false)
        router.navigate({
          to: '/',
          reloadDocument: true,
        })
      }
    } catch (error) {
      console.error('Error confirming code:', error)
      toast.error('Invalid verification code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setIsCodeSent(false)
    setPhone('')
  }

  const handleOpenChange = (open: boolean) => {
    if (requireAuth) {
      if (!open) {
        if (closingDueToAuthRef.current) {
          closingDueToAuthRef.current = false
          return
        }
        router.navigate({
          to: '/',
          search: (old) => ({
            ...old,
            [REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME]: undefined,
            [REDIRECT_TO_SEARCH_PARAM_NAME]: undefined,
          }),
        })
      }
    } else {
      setIsOpen(open)
    }
  }

  const open = requireAuth ? requireAuth : isOpen

  const isRedirectMode = requireAuth

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      {children && <Dialog.Trigger>{children}</Dialog.Trigger>}
      <Dialog.Content>
        <Flex direction="column" gap="4">
          <Box>
            <>
              <Dialog.Title className="sr-only">
                {isCodeSent
                  ? 'Enter Verification Code'
                  : isRedirectMode
                    ? 'Authentication Required'
                    : 'Welcome Back!'}
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                {isCodeSent
                  ? 'Enter the verification code sent to your phone.'
                  : isRedirectMode
                    ? 'You must be authenticated to access the requested page.'
                    : 'Enter your phone number to get started.'}
              </Dialog.Description>
            </>
            <Heading>
              {isCodeSent
                ? 'Enter Verification Code'
                : isRedirectMode
                  ? 'Authentication Required'
                  : 'Welcome Back!'}
            </Heading>
            <Text>
              {isCodeSent ? (
                'We sent you a verification code.'
              ) : isRedirectMode ? (
                <>
                  You need to be authenticated to access this page.
                  {redirectTo && (
                    <>
                      {' '}
                      After signing in, you will be redirected to{' '}
                      <strong>{redirectTo}</strong>.
                    </>
                  )}
                </>
              ) : (
                'Enter your phone number to get started.'
              )}
            </Text>
          </Box>

          <Flex direction="column" gap="4">
            {!isCodeSent ? (
              <AutoForm.Root
                onSubmit={handleSendCode}
                schema={PhoneAuthSchema}
                defaultValues={{ phone: ['', ''], consent: true }}
              >
                <AutoForm.Content />
                <Flex mt="4" className="w-full">
                  <Button
                    size="3"
                    className="w-full!"
                    variant="classic"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send WhatsApp Code'}
                  </Button>
                </Flex>
              </AutoForm.Root>
            ) : (
              <Flex direction="column" gap="4">
                <Callout.Root color="green">
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    We've sent a verification code to <strong>{phone}</strong>
                  </Callout.Text>
                </Callout.Root>
                <AutoForm.Root
                  onSubmit={handleCodeConfirmation}
                  schema={PhoneAuthCodeSchema}
                  defaultValues={{ code: '' }}
                >
                  <AutoForm.Content />
                  <Box
                    mt="4"
                    className="w-full grid! gap-2 grid-cols-[auto_1fr]"
                  >
                    <Button
                      size="3"
                      variant="soft"
                      type="button"
                      onClick={handleBack}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button
                      size="3"
                      className="flex-1 w-full"
                      variant="classic"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Verifying...' : 'Confirm Code'}
                    </Button>
                  </Box>
                </AutoForm.Root>
              </Flex>
            )}
          </Flex>

          <Text>
            By signing in you agree to our{' '}
            <Link to="/pages/terms-of-service">
              <Text weight={'medium'} className="underline">
                Terms of Service
              </Text>
            </Link>{' '}
            and{' '}
            <Link to="/pages/privacy-policy">
              <Text weight={'medium'} className="underline">
                Privacy Policy
              </Text>
            </Link>
            .
          </Text>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
