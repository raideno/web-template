import { ChevronDownIcon, ExitIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  IconButton,
  Separator,
  Text,
} from "@radix-ui/themes";
import { MetadataRegistry } from "@raideno/auto-form/registry";
import { AutoForm } from "@raideno/auto-form/ui";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import React from "react";
import { toast } from "sonner";
import { z } from "zod";

import type { FunctionReturnType } from "convex/server";

import { api } from "backend/convex/api";
import { cn } from "@/lib/utils";
import { useLocalStorageState } from "@/hooks/local-stroage-state";
import { useConfirm } from "@/components/providers/confirmation-dialog";

const UserProfileSchema = z.object({
  name: z.string().optional().register(MetadataRegistry, {
    label: "Full Name",
    placeholder: "Your Name",
  }),
  phone: z.string().optional().nullable().register(MetadataRegistry, {
    disabled: true,
  }),
  email: z.string().optional().nullable().register(MetadataRegistry, {
    disabled: true,
    placeholder: "youremail@example.com",
  }),
});

interface AccountCardProps {
  user: NonNullable<FunctionReturnType<typeof api.auth.self>>;
}

export function AccountCard({ user }: AccountCardProps) {
  const update = useMutation(api.auth.update);
  const navigate = useNavigate();
  const context = useRouteContext({ from: "/(main)/dashboard/" });

  const confirm = useConfirm();

  const [isOpen, setIsOpen] = useLocalStorageState(
    "account-card.is-open",
    false,
  );

  const [isLoading, setIsLoading] = React.useState<string | null>(null);

  const handleUpdate = async (data: { name?: string }) => {
    try {
      setIsLoading("profile");
      await update({
        name: data.name,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(null);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading("logout");

      const confirmation = await confirm({
        title: "Confirm Logout",
        body: "Are you sure you want to log out? You will need to log in again to access your account.",
      });

      if (!confirmation) return;

      toast.success("Logged out successfully");

      navigate({ to: "/", reloadDocument: true });
      await context.authentication.signOut();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
      console.error("Logout error:", error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card size="4" className="p-0!">
      <AutoForm.Root
        onSubmit={handleUpdate}
        schema={UserProfileSchema}
        defaultValues={{
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
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
              <Heading>Account</Heading>
              <Text className="line-clamp-1" color="gray">
                Manage your personal details and contact information.
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
                <AutoForm.Action
                  loading={isLoading == "profile"}
                  variant="classic"
                  type="submit"
                >
                  Save Changes
                </AutoForm.Action>
              </AutoForm.Actions>
            </Box>

            <Separator size="4" orientation="horizontal" className="w-full!" />

            <Box p="4">
              <Button
                type="button"
                className="w-full!"
                variant="outline"
                color="gray"
                onClick={handleLogout}
                disabled={isLoading == "logout"}
                loading={isLoading == "logout"}
              >
                <ExitIcon className="rotate-180" />
                Logout
              </Button>
            </Box>
          </>
        )}
      </AutoForm.Root>
    </Card>
  );
}
