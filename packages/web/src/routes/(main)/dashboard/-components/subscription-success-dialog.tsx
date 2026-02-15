import { name } from "@/constants/parameters";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Text,
} from "@radix-ui/themes";
import confetti from "canvas-confetti";
import React from "react";

export interface SubscriptionSuccessDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const SubscriptionSuccessDialog: React.FC<
  SubscriptionSuccessDialogProps
> = ({ open, onOpenChange }) => {
  const hasFiredRef = React.useRef(false);

  const fire = (particleRatio: number, opts: confetti.Options) =>
    confetti({
      origin: { y: 0.6 },
      particleCount: Math.floor(200 * particleRatio),
      spread: 60,
      ...opts,
    });

  const celebrate = () => {
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  React.useEffect(() => {
    if (open && !hasFiredRef.current) {
      hasFiredRef.current = true;

      celebrate();
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Box mb="4">
          <>
            <Dialog.Title className="sr-only">
              Subscription successful
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              You are now subscribed.
            </Dialog.Description>
          </>
          <Flex direction="column">
            <Heading align="center">
              You are now subscribed!{" "}
              <Text className="cursor-pointer" onClick={celebrate}>
                🎉
              </Text>
            </Heading>
            <Text align="center">Thanks for choosing {name}</Text>
          </Flex>
        </Box>

        <Card className="w-full">
          <Box className="overflow-hidden rounded-(--radius-4) border border-(--gray-7) bg-(--gray-2)">
            <TutorialGif />
          </Box>
        </Card>

        <Box mt={"4"}>
          <Flex justify="center">
            <Button
              size={"3"}
              variant="classic"
              className="w-full!"
              onClick={() => onOpenChange?.(false)}
            >
              Proceed
            </Button>
          </Flex>
        </Box>
      </Dialog.Content>
    </Dialog.Root>
  );
};

const TutorialGif: React.FC = () => {
  const [error, setError] = React.useState<React.SyntheticEvent<
    HTMLImageElement,
    Event
  > | null>(null);

  if (error)
    return (
      <Flex direction="column" gap="2" p="4" align="center">
        <Text align="center">Thanks for subscribing to {name}!</Text>
      </Flex>
    );

  return (
    <>
      <img
        src="/minions.gif"
        alt={`How to use ${name} tutorial`}
        className="w-full h-auto block"
        loading="eager"
        onError={setError}
      />
    </>
  );
};
