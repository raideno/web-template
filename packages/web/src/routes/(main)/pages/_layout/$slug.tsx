import { Suspense, lazy, useMemo } from "react";
import { Flex, Skeleton } from "@radix-ui/themes";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { staticPagesBySlug } from "./registry";

const StaticPageContentSkeleton = () => {
  return (
    <Flex direction="column" gap="3">
      <Skeleton height="24px" width="40%" />
      <Skeleton height="16px" width="100%" />
      <Skeleton height="16px" width="100%" />
      <Skeleton height="16px" width="85%" />
      <Skeleton height="16px" width="100%" mt="2" />
      <Skeleton height="16px" width="92%" />
      <Skeleton height="16px" width="88%" />
    </Flex>
  );
};

export const Route = createFileRoute("/(main)/pages/_layout/$slug")({
  beforeLoad: ({ params }) => {
    if (!staticPagesBySlug[params.slug]) {
      throw notFound();
    }
  },
  head: ({ params }) => {
    const page = staticPagesBySlug[params.slug];

    if (!page) {
      return {
        meta: [{ name: "title", content: "Page not found" }],
      };
    }

    return {
      meta: [
        { name: "title", content: page.title },
        { name: "description", content: page.description },
      ],
    };
  },
  component: () => {
    const { slug } = Route.useParams();
    const page = staticPagesBySlug[slug];

    const MarkdownContent = useMemo(() => lazy(page.load), [page]);

    return (
      <Suspense fallback={<StaticPageContentSkeleton />}>
        <MarkdownContent />
      </Suspense>
    );
  },
});
