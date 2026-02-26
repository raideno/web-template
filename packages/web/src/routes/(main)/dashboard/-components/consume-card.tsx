import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
  Box,
  Card,
  Flex,
  Heading,
  IconButton,
  Separator,
  Text,
} from "@radix-ui/themes";
import { MetadataRegistry } from "@raideno/auto-form/registry";
import { AutoForm } from "@raideno/auto-form/ui";
import React from "react";
import { toast } from "sonner";
import { z } from "zod";

import type { FunctionReturnType } from "convex/server";

import { useLocalStorageState } from "@/hooks/local-stroage-state";
import { cn } from "@/lib/utils";
import { api } from "backend/convex/api";
import { useMutation } from "convex/react";

const ConsumeSchema = z.object({
  quantity: z.int().register(MetadataRegistry, {
    label: "Quantity",
    placeholder: "1",
  }),
});

interface ConsumeCardProps {
  user: NonNullable<FunctionReturnType<typeof api.auth.self>>;
}

export function ConsumeCard({ user }: ConsumeCardProps) {
  const consume = useMutation(api.quotas.consume);

  const [isOpen, setIsOpen] = useLocalStorageState(
    "account-card.is-open",
    false,
  );

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const handleSubmit = async (data: z.infer<typeof ConsumeSchema>) => {
    try {
      setIsLoading(true);

      const result = await consume({
        quantity: data.quantity,
        quota: "messages",
      });

      if (!result)
        throw new Error("Failed to consume credits. Please try again later.");

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card size="4" className="p-0!">
      <AutoForm.Root
        onSubmit={handleSubmit}
        schema={ConsumeSchema}
        defaultValues={{
          quantity: 1,
        }}
      >
        <Box
          p="4"
          className="cursor-pointer transition-all hover:backdrop-brightness-95 active:backdrop-brightness-90"
          onClick={() => setIsOpen((old) => !old)}
        >
          <Flex
            direction={"row"}
            justify={"between"}
            align={"center"}
            gap={"2"}
          >
            <Box>
              <Heading>Consume</Heading>
              <Text className="line-clamp-1" color="gray">
                Use a credit.
              </Text>
            </Box>
            <IconButton
              color="gray"
              type="button"
              variant="outline"
              className="pointer-events-none"
            >
              <ChevronDownIcon
                className={cn("transition-[rotate]", !isOpen && "rotate-90")}
              />
            </IconButton>
          </Flex>
        </Box>

        {isOpen && (
          <>
            <Separator size="4" orientation="horizontal" className="w-full!" />

            <Box p="4">
              <AutoForm.Content />
            </Box>

            <Separator size="4" orientation="horizontal" className="w-full!" />

            <Box p="4">
              <AutoForm.Actions className="w-full flex justify-between gap-3">
                <AutoForm.Action
                  loading={isLoading}
                  variant="classic"
                  className="w-full!"
                  type="submit"
                >
                  Consume
                </AutoForm.Action>
              </AutoForm.Actions>
            </Box>
          </>
        )}
      </AutoForm.Root>
    </Card>
  );
}
