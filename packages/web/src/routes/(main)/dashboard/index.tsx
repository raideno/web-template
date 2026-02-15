import { Container, Flex } from "@radix-ui/themes";
import { createFileRoute, redirect } from "@tanstack/react-router";
import z from "zod";

import { AccountCard } from "./-components/account-card";
import { DeveloperCard } from "./-components/developer-card";
import { FeedbackCard } from "./-components/feedback-card";
import { OnboardingsCard } from "./-components/onboardings-card";
import { SubscribeDialog } from "./-components/subscribe-dialog";
import { SubscriptionCard } from "./-components/subscription-card";
import { SubscriptionSuccessDialog } from "./-components/subscription-success-dialog";

import {
  PageHeaderCard,
  PageHeaderCardSkeleton,
} from "@/components/layout/page-header-card";
import {
  COME_BACK_FROM_REDIRECT_SEARCH_PARAM_NAME,
  COME_BACK_FROM_REDIRECT_SEARCH_PARAM_ZOD_VALIDATOR,
  REDIRECT_TO_SEARCH_PARAM_NAME,
  REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME,
  SUBSCRIPTION_RETURN_SEARCH_PARAM_NAME,
  SUBSCRIPTION_RETURN_SEARCH_PARAM_ZOD_VALIDATOR,
} from "@/constants/search";

export const Route = createFileRoute("/(main)/dashboard/")({
  validateSearch: z.object({
    [COME_BACK_FROM_REDIRECT_SEARCH_PARAM_NAME]:
      COME_BACK_FROM_REDIRECT_SEARCH_PARAM_ZOD_VALIDATOR,
    [SUBSCRIPTION_RETURN_SEARCH_PARAM_NAME]:
      SUBSCRIPTION_RETURN_SEARCH_PARAM_ZOD_VALIDATOR,
  }),
  beforeLoad: ({ context }) => {
    if (!context.user.isAuthenticated || !context.user.user)
      throw redirect({
        to: "/",
        search: {
          [REQUIRE_AUTHENTICATION_SEARCH_PARAM_NAME]: true,
          [REDIRECT_TO_SEARCH_PARAM_NAME]: "/dashboard",
        },
      });

    const onboardings = context.onboardings.onboardings;
    if (onboardings) {
      const pending = onboardings.find(
        (o) => o.required && (!o.completed || o.outdated),
      );
      if (pending) {
        const pathMap: Record<string, string> = {
          agent: "/dashboard/onboardings/agent",
          profile: "/dashboard/onboardings/profile",
        };
        const to = pathMap[pending.id];
        if (to) throw redirect({ to });
      }
    }
  },
  search: {
    middlewares: [
      ({ search, next }) => {
        const result = next(search);
        return {
          ...result,
          [COME_BACK_FROM_REDIRECT_SEARCH_PARAM_NAME]: undefined,
        };
      },
    ],
  },
  pendingComponent: () => {
    return (
      <Container size="4">
        <Flex direction="column" gap="4">
          <PageHeaderCardSkeleton />
        </Flex>
      </Container>
    );
  },
  component: () => {
    const context = Route.useRouteContext();
    const search = Route.useSearch();

    const navigate = Route.useNavigate();

    const user = context.user.user!;
    const subscription = context.subscription.subscription;

    const isSubscribed = subscription?.status === "active";

    const showSubscriptionSuccessDialog =
      search[SUBSCRIPTION_RETURN_SEARCH_PARAM_NAME] === "success" &&
      isSubscribed;

    const handleSuccessDialogOpenChange = (open: boolean) => {
      if (!open && search[SUBSCRIPTION_RETURN_SEARCH_PARAM_NAME]) {
        navigate({
          to: "/dashboard",
          search: (old) => ({
            ...old,
            [SUBSCRIPTION_RETURN_SEARCH_PARAM_NAME]: undefined,
          }),
        });
      }
    };

    return (
      <Container size="4">
        <Flex direction="column" gap="4">
          <PageHeaderCard
            title="Dashboard"
            description="Manage your account, subscription, and settings here."
          />

          <>
            {/* Subscription Success Dialog - After successful return */}
            <SubscriptionSuccessDialog
              open={showSubscriptionSuccessDialog}
              onOpenChange={handleSuccessDialogOpenChange}
            />
          </>

          <OnboardingsCard />

          {isSubscribed && <SubscriptionCard subscription={subscription} />}

          <SubscribeDialog open={!isSubscribed} />

          <AccountCard user={user} />

          <FeedbackCard user={user} />

          {user.developer && <DeveloperCard user={user} />}
        </Flex>
      </Container>
    );
  },
});
