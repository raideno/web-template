import { Box, Card, Heading, Separator, Text } from "@radix-ui/themes";
import { MetadataRegistry } from "@raideno/auto-form/registry";
import { AutoForm } from "@raideno/auto-form/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import React from "react";
import { z } from "zod";

import {
  canSkipOnboarding,
  handleOnboardingBeforeLoad,
  nextOnboardingPath,
} from "./_utils";
import { api } from "backend/convex/api";

const ProfileSchema = z.object({
  name: z.string().min(1, "Please enter your name").register(MetadataRegistry, {
    placeholder: "Your name",
  }),
  email: z.email("Invalid email").register(MetadataRegistry, {
    placeholder: "you@example.com",
  }),
});

// @ts-ignore - route will be added to route tree gen
export const Route = createFileRoute("/(main)/dashboard/onboardings/profile")({
  beforeLoad: ({ context }) => {
    handleOnboardingBeforeLoad(
      context.user.isAuthenticated,
      context.user.user,
      context.onboardings.onboardings,
      "profile",
      "/dashboard/onboardings/profile",
    );
  },
  component: () => {
    const onboard = useMutation(api.onboardings.onboard);
    const navigate = Route.useNavigate();
    const routeContext = Route.useRouteContext();
    const onboardings = routeContext.onboardings.onboardings;

    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (data: z.infer<typeof ProfileSchema>) => {
      setIsLoading(true);
      try {
        await onboard({ id: "profile", data });
        if (onboardings) {
          const next = nextOnboardingPath(onboardings, "profile");
          navigate({ to: next ?? "/dashboard" });
        } else {
          navigate({ to: "/dashboard" });
        }
      } finally {
        setIsLoading(false);
      }
    };

    const handleSkip = () => {
      if (onboardings) {
        const next = nextOnboardingPath(onboardings, "profile");
        navigate({ to: next ?? "/dashboard" });
      } else {
        navigate({ to: "/dashboard" });
      }
    };

    const canSkip = React.useMemo(() => {
      return canSkipOnboarding(onboardings, "profile");
    }, [onboardings]);

    return (
      <Card size="4" className="p-0!">
        <AutoForm.Root onSubmit={handleSubmit} schema={ProfileSchema}>
          <Box p="4">
            <Heading>Profile</Heading>
            <Text color="gray">Fill in your profile information.</Text>
          </Box>

          <Separator size="4" orientation="horizontal" className="w-full!" />

          <Box p="4">
            <AutoForm.Content />
          </Box>

          <Separator size="4" orientation="horizontal" className="w-full!" />

          <Box p="4">
            <AutoForm.Actions className="w-full flex justify-between gap-3">
              {canSkip ? (
                <AutoForm.Action
                  type="button"
                  variant="soft"
                  onClick={handleSkip}
                >
                  Skip
                </AutoForm.Action>
              ) : (
                <div />
              )}
              <AutoForm.Action
                loading={isLoading}
                variant="classic"
                type="submit"
              >
                Continue
              </AutoForm.Action>
            </AutoForm.Actions>
          </Box>
        </AutoForm.Root>
      </Card>
    );
  },
});
