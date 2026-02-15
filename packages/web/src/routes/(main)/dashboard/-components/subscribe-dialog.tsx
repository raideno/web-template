import { convexQuery } from "@convex-dev/react-query";
import { CheckIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Heading,
  Text,
} from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouteContext, useRouter } from "@tanstack/react-router";
import { useAction } from "convex/react";
import React from "react";

import {
  SUBSCRIPTION_CANCEL_REDIRECT_URL,
  SUBSCRIPTION_SUCCESS_REDIRECT_URL,
} from "@/constants/redirect";
import { api } from "backend/convex/api";
import { ACCENT_COLOR } from "@/contexts/react/theme";

export interface SubscribeDialogProps {
  open: boolean;
}

export const SubscribeDialog: React.FC<SubscribeDialogProps> = ({ open }) => {
  const { data: products } = useQuery(convexQuery(api.stripe.products, {}));
  const hasAvailableSubscriptionPlan =
    products?.some(
      (product: any) =>
        Array.isArray(product.prices) && product.prices.length > 0,
    ) ?? false;

  const subscribe = useAction(api.stripe.subscribe);

  const router = useRouter();
  const context = useRouteContext({ from: "/(main)/dashboard/" });

  const [isLoading, setIsLoadingSubscribe] = React.useState<string | null>(
    null,
  );

  const handleSubscribe = async (priceId: string) => {
    setIsLoadingSubscribe(priceId);
    try {
      const result = await subscribe({
        priceId,
        successRedirectUrl: SUBSCRIPTION_SUCCESS_REDIRECT_URL,
        cancelRedirectUrl: SUBSCRIPTION_CANCEL_REDIRECT_URL,
      });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      console.error("Subscribe error:", err);
    } finally {
      setIsLoadingSubscribe(null);
    }
  };

  if (products !== undefined && !hasAvailableSubscriptionPlan) {
    return (
      <Dialog.Root open={open}>
        <Dialog.Content>
          <Box mb="4">
            <>
              <Dialog.Title className="sr-only">
                Subscription unavailable
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                We could not find any active subscription plan right now. This
                is usually temporary while billing is being configured. Please
                try again shortly.
              </Dialog.Description>
            </>
            <Heading>Subscription unavailable</Heading>
            <Text>
              We could not find any active subscription plan right now. This is
              usually temporary while billing is being configured. Please try
              again shortly.
            </Text>
          </Box>

          <Box mt="4">
            <Flex align="center" justify="center">
              <Link to="/">
                <Button color="gray" variant="ghost" className="m-0!">
                  Go back Home
                </Button>
              </Link>
              <Button
                color="gray"
                variant="ghost"
                className="m-0!"
                onClick={async () => {
                  await context.authentication.signOut();

                  router.navigate({
                    to: "/",
                    reloadDocument: true,
                  });
                }}
              >
                Logout
              </Button>
            </Flex>
          </Box>
        </Dialog.Content>
      </Dialog.Root>
    );
  }

  if (products === undefined) return null;

  return (
    <Dialog.Root open={open}>
      <Dialog.Content>
        <Box mb="4">
          <>
            <Dialog.Title className="sr-only">Subscribe</Dialog.Title>
            <Dialog.Description className="sr-only">
              You need to be subscribed to access AI assistant and dashboard.
            </Dialog.Description>
          </>
          <Flex direction="column">
            <Heading align="center">Subscribe</Heading>
            <Text align="center">
              You need to be subscribed to access AI assistant and dashboard.
            </Text>
          </Flex>
        </Box>

        <Grid columns={{ initial: "1", sm: "1", lg: "1" }} gap="4">
          {products.map((product: any) =>
            (product.prices ?? []).map((price: any) => (
              <Card key={price.priceId} size="3">
                <Flex direction="column" gap="4">
                  <Box>
                    <Heading>{product.stripe.name}</Heading>
                    <Text color="gray">{product.stripe.description}</Text>
                  </Box>

                  <Flex align="baseline">
                    <Heading size="8">
                      ${(price.stripe.unit_amount || 0) / 100}
                    </Heading>
                    <Text color="gray">
                      / {price.stripe.recurring?.interval || "month"}
                    </Text>
                  </Flex>

                  {product.stripe.marketing_features && (
                    <Flex direction="column" gap="2">
                      {product.stripe.marketing_features.map(
                        (f: any, i: number) => (
                          <Flex key={i} gap="2" align="center">
                            <CheckIcon color={ACCENT_COLOR} />
                            <Text size="2">{f.name}</Text>
                          </Flex>
                        ),
                      )}
                    </Flex>
                  )}

                  <Button
                    size="3"
                    variant="classic"
                    onClick={handleSubscribe.bind(null, price.priceId)}
                    disabled={isLoading === price.priceId}
                  >
                    {isLoading === price.priceId
                      ? "Processing..."
                      : "Subscribe"}
                  </Button>
                </Flex>
              </Card>
            )),
          )}
        </Grid>
        <Box mt="4">
          <Flex align="center" justify="center">
            <Link to="/">
              <Button color="gray" variant="ghost" className="m-0!">
                Go back Home
              </Button>
            </Link>
            <Button
              color="gray"
              variant="ghost"
              className="m-0!"
              onClick={async () => {
                console.log("here");
                await context.authentication.signOut();

                router.navigate({
                  to: "/",
                  reloadDocument: true,
                });
              }}
            >
              Logout
            </Button>
          </Flex>
        </Box>
      </Dialog.Content>
    </Dialog.Root>
  );
};
