import { ChatBubbleIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Heading,
  Link,
  Text,
} from "@radix-ui/themes";
import { MetadataRegistry } from "@raideno/auto-form/registry";
import { AutoForm } from "@raideno/auto-form/ui";
import { z_ } from "@raideno/auto-form/zod";
import { useMutation } from "convex/react";
import React from "react";
import { toast } from "sonner";
import { z } from "zod";

import type { FunctionReturnType } from "convex/server";

import { api } from "backend/convex/api";
import { email, name } from "@/constants/parameters";

const FeedbackSchema = z.object({
  tag: z_
    .enum([
      {
        label: "Bug Report 🐛",
        value: "bug",
      },
      {
        label: "Feature Request ✨",
        value: "feature",
      },
      {
        label: "Rating ⭐",
        value: "rating",
      },
      {
        label: "Other 💬",
        value: "other",
      },
    ])
    .register(MetadataRegistry, {
      label: "Category",
      description: "What type of feedback are you providing?",
    }),
  title: z
    .string()
    .min(1, "Title is required")
    .max(128)
    .register(MetadataRegistry, {
      label: "Title",
      placeholder: "Brief description of your feedback",
    }),
  content: z
    .string()
    .min(1, "Content is required")
    .max(2048)
    .register(MetadataRegistry, {
      label: "Details",
      placeholder: "Please provide as much detail as possible...",
    }),
  attachmentUrls: z
    .array(z.url())
    .max(8)
    .optional()
    .register(MetadataRegistry, {
      label: "Attachment URLs (optional)",
      description: "Add up to 8 attachment URLs (screenshots, etc.)",
    }),
});

interface FeedbackCardProps {
  user: NonNullable<FunctionReturnType<typeof api.auth.self>>;
}

export function FeedbackCard({ user }: FeedbackCardProps) {
  const sendFeedback = useMutation(api.feedbacks.send);

  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: z.infer<typeof FeedbackSchema>) => {
    try {
      setIsLoading(true);
      await sendFeedback({
        email: user.email || undefined,
        title: data.title,
        content: data.content,
        tag: data.tag as "bug" | "feature" | "rating" | "other",
        urls: [],
        attachmentUrls: data.attachmentUrls || [],
      });
      toast.success("Feedback sent successfully! Thank you for your input.");
      setIsOpen(false);
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send feedback. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card size="4" className="p-0!">
        <Box p="4">
          <Flex direction="column" gap="3">
            <Heading>Feedback & Support</Heading>
            <Text color="gray">
              Have feedback, found a bug, or need help? We'd love to hear from
              you!
            </Text>
            <Text color="gray" size="2">
              You can also reach us directly at{" "}
              <Link href={`mailto:${email.contact}`} weight="bold">
                {email.contact}
              </Link>
            </Text>
            <Button
              size="3"
              variant="classic"
              className="w-full!"
              onClick={() => setIsOpen(true)}
            >
              <ChatBubbleIcon width={18} height={18} />
              Send Feedback
            </Button>
          </Flex>
        </Box>
      </Card>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Content size="4">
          <Box mb="4">
            <Dialog.Title>
              <Heading>Send Feedback</Heading>
            </Dialog.Title>
            <Dialog.Description>
              <Text color="gray">
                We appreciate your feedback! It helps us improve {name}. For
                direct support, email us at{" "}
                <Link href={`mailto:${email.contact}`} weight="bold">
                  {email.contact}
                </Link>
              </Text>
            </Dialog.Description>
          </Box>

          <AutoForm.Root
            onSubmit={handleSubmit}
            schema={FeedbackSchema}
            defaultValues={{
              tag: "feature",
              title: "",
              content: "",
              attachmentUrls: [],
            }}
          >
            <AutoForm.Content />

            <Flex mt="4" gap="3" justify="end">
              <Button
                type="button"
                variant="outline"
                color="gray"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <AutoForm.Action
                variant="classic"
                type="submit"
                loading={isLoading}
              >
                Send Feedback
              </AutoForm.Action>
            </Flex>
          </AutoForm.Root>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
