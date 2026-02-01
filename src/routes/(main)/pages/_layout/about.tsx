import { createFileRoute } from '@tanstack/react-router'

import MarkdownContent from './about.mdx'

export const Route = createFileRoute('/(main)/pages/_layout/about')({
  component: () => {
    return <MarkdownContent />
  },
})
