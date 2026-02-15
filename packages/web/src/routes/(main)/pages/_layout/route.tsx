import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { MDXProvider } from "@mdx-js/react";
import { Box, Card, Container, Flex } from "@radix-ui/themes";

import { PageHeaderCard } from "@/components/layout/page-header-card";
import { staticPagesBySlug } from "./registry";

export const Route = createFileRoute("/(main)/pages/_layout")({
  component: () => {
    const location = useLocation();

    const slug = location.pathname.split("/").filter(Boolean).at(-1);

    const page = slug ? staticPagesBySlug[slug] : undefined;

    return (
      <Container size={"4"}>
        <Flex direction="column" gap="4">
          <PageHeaderCard
            title={page?.title ?? ""}
            description={page?.description ?? ""}
          />
          <Card size="4" className="p-0!">
            <Box p="4">
              <MDXProvider>
                <div className="prose prose-sm prose-h2:my-0! max-w-none markdown-body">
                  <Outlet />
                </div>
              </MDXProvider>
            </Box>
          </Card>
        </Flex>
      </Container>
    );
  },
});
