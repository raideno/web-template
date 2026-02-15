import {
  Box,
  Card,
  Container,
  Flex,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";
import { Link, createFileRoute } from "@tanstack/react-router";

import { PageHeaderCard } from "@/components/layout/page-header-card";
import { staticPages } from "./_layout/registry";

export const Route = createFileRoute("/(main)/pages/")({
  component: () => {
    return (
      <Container size={"4"}>
        <Flex direction="column" gap="4">
          <PageHeaderCard
            title="Pages"
            description="Browse our informational pages."
          />
          <Card size="4" className="p-0!">
            <Flex direction="column">
              {staticPages.map((page, i) => (
                <Box key={page.slug}>
                  <Link
                    to="/pages/$slug"
                    params={{ slug: page.slug }}
                    preload="intent"
                    className="no-underline!"
                  >
                    <Box
                      className="w-full hover:backdrop-brightness-95 transition-all"
                      p="4"
                    >
                      <Flex direction="column" gap="1">
                        <Heading size="3">{page.title}</Heading>
                        <Text className="line-clamp-1" color="gray" size="2">
                          {page.description}
                        </Text>
                      </Flex>
                    </Box>
                  </Link>
                  {i !== staticPages.length - 1 && (
                    <Separator
                      orientation={"horizontal"}
                      size={"4"}
                      className="w-full!"
                    />
                  )}
                </Box>
              ))}
            </Flex>
          </Card>
        </Flex>
      </Container>
    );
  },
});
