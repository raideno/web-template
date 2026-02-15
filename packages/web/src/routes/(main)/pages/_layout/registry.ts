import type { ComponentType } from "react";

type MdxModule = {
  default: ComponentType;
  metadata: PageMetadata;
};

type PageMetadata = {
  title: string;
  description: string;
};

export type StaticPage = {
  slug: string;
  title: string;
  description: string;
  load: () => Promise<MdxModule>;
};

const mdxModules = import.meta.glob("./*.mdx") as Record<
  string,
  () => Promise<MdxModule>
>;
const mdxMetadata = import.meta.glob("./*.mdx", {
  eager: true,
  import: "metadata",
}) as Record<string, PageMetadata | undefined>;

export const staticPages: StaticPage[] = Object.entries(mdxMetadata)
  .map(([mdxPath, metadata]) => {
    const slug = mdxPath.replace("./", "").replace(/\.mdx$/, "");
    const load = mdxModules[mdxPath];

    if (!load) {
      throw new Error(
        `Missing MDX content file for slug "${slug}" in /pages/_layout.`,
      );
    }

    if (!metadata) {
      throw new Error(
        `Missing metadata export in /pages/_layout/${slug}.mdx. Expected: export const metadata = { title, description }`,
      );
    }

    return {
      slug,
      title: metadata.title,
      description: metadata.description,
      load,
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

export const staticPagesBySlug = Object.fromEntries(
  staticPages.map((page) => [page.slug, page]),
);
