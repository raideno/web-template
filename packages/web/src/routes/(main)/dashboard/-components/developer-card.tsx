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
import { useMutation } from "convex/react";
import React from "react";
import { toast } from "sonner";
import z from "zod";

import type { FunctionReturnType } from "convex/server";

import { api } from "backend/convex/api";

import { useLocalStorageState } from "@/hooks/local-stroage-state";
import { cn } from "@/lib/utils";

const DeveloperSchema = z.object({
  enabled: z.boolean().optional().register(MetadataRegistry, {
    label: "Enable Developer Mode",
    description:
      "Activate developer settings and tools for advanced usage and testing.",
  }),
});

export interface DeveloperCardProps {
  user: NonNullable<FunctionReturnType<typeof api.auth.self>>;
}
export const DeveloperCard: React.FC<DeveloperCardProps> = (props) => {
  const update = useMutation(api.auth.developer);

  const [isOpen, setIsOpen] = useLocalStorageState(
    "developer-card.is-open",
    false,
  );

  const handleUpdate = async (data: z.infer<typeof DeveloperSchema>) => {
    try {
      const response = await update({
        enabled: data.enabled ?? false,
      });

      if (!response.success)
        throw new Error("Failed to update developer settings");

      toast.success("Developer settings updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
    }
  };

  return (
    <Card size="4" className="p-0!">
      <AutoForm.Root
        onSubmit={handleUpdate}
        schema={DeveloperSchema}
        defaultValues={{
          enabled: props.user.developer && props.user.developer.enabled,
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
              <Heading>Developer</Heading>
              <Text className="line-clamp-1" color="gray">
                Access developer settings and tools for advanced usage.
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
                <AutoForm.Action type="reset" variant="outline" color="gray">
                  Cancel Changes
                </AutoForm.Action>
                <AutoForm.Action variant="classic" type="submit">
                  Save Changes
                </AutoForm.Action>
              </AutoForm.Actions>
            </Box>
          </>
        )}
      </AutoForm.Root>
    </Card>
  );
};
