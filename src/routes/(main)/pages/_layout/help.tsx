import { createFileRoute } from '@tanstack/react-router'

import MarkdownContent from './help.mdx'

export const Route = createFileRoute('/(main)/pages/_layout/help')({
  component: () => {
    return <MarkdownContent />
  },
})
