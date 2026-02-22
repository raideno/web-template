import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Callout,
  Dialog,
  Flex,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";
import { MetadataRegistry } from "@raideno/auto-form/registry";
import { AutoForm } from "@raideno/auto-form/ui";
import {
  Link,
  getRouteApi,
  useRouteContext,
  useRouter,
} from "@tanstack/react-router";
import React from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
  OTPInputControllerFactory,
  OTPInputRenderer,
} from "../controllers/opt-input";
// eslint-disable-next-line import/no-duplicates
import phones from "../controllers/phone-input.json";
// eslint-disable-next-line import/no-duplicates
import { PhoneInputController } from "../controllers/phone-input";

import type { AnyController, AnyRenderer } from "../controllers";
import type { AuthMode } from "../../contexts/tanstack/authentication";

import type { COME_BACK_FROM_REDIRECT_SEARCH_PARAM_TYPE } from "@/constants/search";
import {
  COME_BACK_FROM_REDIRECT_SEARCH_PARAM_NAME,
  REDIRECT_TO_SEARCH_PARAM_NAME,
  REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME,
} from "@/constants/search";
import { ACCENT_COLOR } from "@/contexts/react/theme";

const PhoneAuthSchema = z.object({
  phone: z.tuple([z.string(), z.string()]).register(MetadataRegistry, {
    controller: PhoneInputController as AnyController,
  }),
  consent: z.boolean().register(MetadataRegistry, {
    description: "I agree to receive WhatsApp messages.",
  }),
});

const PhoneAuthCodeSchema = z.object({
  code: z.string().register(MetadataRegistry, {
    controller: OTPInputControllerFactory({ length: 6 }) as AnyController,
    renderer: OTPInputRenderer as AnyRenderer,
  }),
});

const EmailAuthSchema = z.object({
  email: z.email().register(MetadataRegistry, {
    label: "Email",
  }),
  password: z.string().min(8).register(MetadataRegistry, {
    label: "Password",
    type: "password",
  }),
});

const EmailSignUpSchema = z.object({
  name: z.string().min(1).register(MetadataRegistry, {
    label: "Full Name",
  }),
  email: z.email().register(MetadataRegistry, {
    label: "Email",
  }),
  password: z.string().min(8).register(MetadataRegistry, {
    label: "Password",
    type: "password",
  }),
});

const route = getRouteApi("/");

export interface AuthDialogProps {
  children?: React.ReactNode;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({ children }) => {
  const router = useRouter();
  const context = useRouteContext({ from: "/" });

  const closingDueToAuthRef = React.useRef(false);

  const search = route.useSearch();

  const requireAuth = Boolean(search[REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME]);
  const redirectTo = search[REDIRECT_TO_SEARCH_PARAM_NAME] ?? undefined;

  const [authMode, setAuthMode] = React.useState<AuthMode>("phone");
  const [emailFlow, setEmailFlow] = React.useState<"signIn" | "signUp">(
    "signIn",
  );
  const [isCodeSent, setIsCodeSent] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

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
      });
    } else {
      router.navigate({
        to: "/",
        search: (old) => ({
          ...old,
          [REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME]: undefined,
          [REDIRECT_TO_SEARCH_PARAM_NAME]: undefined,
        }),
      });
    }
  }, [redirectTo, router]);

  const handlePostAuth = React.useCallback(() => {
    toast.success("Successfully authenticated!");
    if (requireAuth) {
      closingDueToAuthRef.current = true;
      clearParamsAndMaybeRedirect();
    } else {
      setIsOpen(false);
      router.navigate({ to: "/", reloadDocument: true });
    }
  }, [requireAuth, clearParamsAndMaybeRedirect, router]);

  const handleSendCode = async (data: z.infer<typeof PhoneAuthSchema>) => {
    if (!data.consent) {
      toast.error("You must agree to receive WhatsApp messages.");
      return;
    }

    const cleanedPhone = data.phone[1].replace(/^0/, "").replace(/\s/g, "");

    if (!/^\d+$/.test(cleanedPhone)) {
      toast.error("Phone number must contain only digits.");
      return;
    }

    if (cleanedPhone.length < 7) {
      toast.error("Phone number must be at least 7 digits.");
      return;
    }

    if (!phones.map((p) => p.dial_code).includes(`+${data.phone[0]}`)) {
      toast.error("Please select a valid country code.");
      return;
    }

    try {
      setIsLoading(true);
      await context.authentication.signInOtp.send({
        phone: `+${data.phone[0]}${cleanedPhone}`,
      });
      setPhone(`+${data.phone[0]}${cleanedPhone}`);
      setIsCodeSent(true);
      toast.success("Verification code sent successfully!");
    } catch (error) {
      console.error("Error sending code:", error);
      toast.error("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeConfirmation = async (
    data: z.infer<typeof PhoneAuthCodeSchema>,
  ) => {
    setIsLoading(true);
    try {
      await context.authentication.signInOtp.validate({
        phone,
        code: data.code,
      });
      handlePostAuth();
    } catch (error) {
      console.error("Error confirming code:", error);
      toast.error("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setIsCodeSent(false);
    setPhone("");
  };

  const handleEmailSignIn = async (data: z.infer<typeof EmailAuthSchema>) => {
    setIsLoading(true);
    try {
      await context.authentication.signInPassword.signIn({
        email: data.email,
        password: data.password,
      });
      handlePostAuth();
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (data: z.infer<typeof EmailSignUpSchema>) => {
    setIsLoading(true);
    try {
      await context.authentication.signInPassword.signUp({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      handlePostAuth();
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error("Could not create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { redirectUrl } =
        await context.authentication.signInGoogle.initiate();
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Error initiating Google sign-in:", error);
      toast.error("Could not initiate Google sign-in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (requireAuth) {
      if (!open) {
        if (closingDueToAuthRef.current) {
          closingDueToAuthRef.current = false;
          return;
        }
        router.navigate({
          to: "/",
          search: (old) => ({
            ...old,
            [REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME]: undefined,
            [REDIRECT_TO_SEARCH_PARAM_NAME]: undefined,
          }),
        });
      }
    } else {
      setIsOpen(open);
    }
  };

  const open = requireAuth ? requireAuth : isOpen;
  const isRedirectMode = requireAuth;

  const dialogTitle = React.useMemo(() => {
    if (isCodeSent) return "Enter Verification Code";
    if (isRedirectMode) return "Authentication Required";
    if (authMode === "email")
      return emailFlow === "signIn" ? "Sign In" : "Create Account";
    return "Welcome Back!";
  }, [isCodeSent, isRedirectMode, authMode, emailFlow]);

  const dialogDescription = React.useMemo(() => {
    if (isCodeSent) return "Enter the verification code sent to your phone.";
    if (isRedirectMode)
      return "You must be authenticated to access the requested page.";
    if (authMode === "email")
      return emailFlow === "signIn"
        ? "Sign in with your email and password."
        : "Create a new account with your email.";
    return "Enter your phone number to get started.";
  }, [isCodeSent, isRedirectMode, authMode, emailFlow]);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      {children && <Dialog.Trigger>{children}</Dialog.Trigger>}
      <Dialog.Content>
        <Flex direction="column" gap="4">
          <Dialog.Title className="sr-only">{dialogTitle}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {dialogDescription}
          </Dialog.Description>

          <Box>
            <Heading mb="1">{dialogTitle}</Heading>
            <Text color="gray" size="2">
              {isCodeSent ? (
                "We sent you a verification code."
              ) : isRedirectMode ? (
                <>
                  You need to be authenticated to access this page.
                  {redirectTo && (
                    <>
                      {" "}
                      After signing in, you will be redirected to{" "}
                      <strong>{redirectTo}</strong>.
                    </>
                  )}
                </>
              ) : authMode === "email" ? (
                emailFlow === "signIn" ? (
                  "Sign in with your email and password."
                ) : (
                  "Fill in the details below to create your account."
                )
              ) : (
                "Enter your phone number to get started."
              )}
            </Text>
          </Box>

          {!isCodeSent && (
            <Flex gap="2">
              <Button
                size="2"
                variant={authMode === "phone" ? "solid" : "soft"}
                color={authMode === "phone" ? ACCENT_COLOR : "gray"}
                onClick={() => setAuthMode("phone")}
                style={{ flex: 1 }}
              >
                Phone
              </Button>
              <Button
                size="2"
                variant={authMode === "email" ? "solid" : "soft"}
                color={authMode === "email" ? ACCENT_COLOR : "gray"}
                onClick={() => setAuthMode("email")}
                style={{ flex: 1 }}
              >
                Email
              </Button>
            </Flex>
          )}

          <Flex direction="column" gap="3">
            {authMode === "phone" ? (
              !isCodeSent ? (
                <AutoForm.Root
                  onSubmit={handleSendCode}
                  schema={PhoneAuthSchema}
                  defaultValues={{ phone: ["", ""], consent: true }}
                >
                  <AutoForm.Content />
                  <Flex mt="4">
                    <Button
                      size="3"
                      className="w-full!"
                      variant="classic"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send WhatsApp Code"}
                    </Button>
                  </Flex>
                </AutoForm.Root>
              ) : (
                <Flex direction="column" gap="4">
                  <Callout.Root color={ACCENT_COLOR}>
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
                    defaultValues={{ code: "" }}
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
                        {isLoading ? "Verifying..." : "Confirm Code"}
                      </Button>
                    </Box>
                  </AutoForm.Root>
                </Flex>
              )
            ) : (
              <Flex direction="column" gap="3">
                {emailFlow === "signIn" ? (
                  <AutoForm.Root
                    key="email-sign-in"
                    onSubmit={handleEmailSignIn}
                    schema={EmailAuthSchema}
                    defaultValues={{ email: "", password: "" }}
                  >
                    <AutoForm.Content />
                    <Flex mt="4">
                      <Button
                        size="3"
                        className="w-full!"
                        variant="classic"
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </Flex>
                  </AutoForm.Root>
                ) : (
                  <AutoForm.Root
                    key="email-sign-up"
                    onSubmit={handleEmailSignUp}
                    schema={EmailSignUpSchema}
                    defaultValues={{ name: "", email: "", password: "" }}
                  >
                    <AutoForm.Content />
                    <Flex mt="4">
                      <Button
                        size="3"
                        className="w-full!"
                        variant="classic"
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating account..." : "Create Account"}
                      </Button>
                    </Flex>
                  </AutoForm.Root>
                )}

                <Flex align="center" justify="center">
                  <Text size="2" color="gray">
                    {emailFlow === "signIn"
                      ? "Don't have an account?"
                      : "Already have an account?"}{" "}
                    <Text
                      size="2"
                      weight="medium"
                      className="underline cursor-pointer"
                      onClick={() =>
                        setEmailFlow(
                          emailFlow === "signIn" ? "signUp" : "signIn",
                        )
                      }
                    >
                      {emailFlow === "signIn" ? "Sign Up" : "Sign In"}
                    </Text>
                  </Text>
                </Flex>
              </Flex>
            )}
          </Flex>

          {!isCodeSent && (
            <>
              <Flex align="center" gap="3">
                <Separator style={{ flex: 1 }} />
                <Text size="1" color="gray">
                  or
                </Text>
                <Separator style={{ flex: 1 }} />
              </Flex>

              <Button
                size="3"
                variant="surface"
                color="gray"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
            </>
          )}

          <Text size="1" color="gray">
            By signing in you agree to our{" "}
            <Link to="/pages/$slug" params={{ slug: "terms-of-service" }}>
              <Text size="1" weight="medium" className="underline">
                Terms of Service
              </Text>
            </Link>{" "}
            and{" "}
            <Link to="/pages/$slug" params={{ slug: "privacy-policy" }}>
              <Text size="1" weight="medium" className="underline">
                Privacy Policy
              </Text>
            </Link>
            .
          </Text>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
