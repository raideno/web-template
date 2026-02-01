import { createFileRoute } from '@tanstack/react-router'

import MarkdownContent from './privacy-policy.mdx'

export const Route = createFileRoute('/(main)/pages/_layout/privacy-policy')({
  component: () => {
    return <MarkdownContent />
  },
})
