import { createFileRoute } from '@tanstack/react-router'

import MarkdownContent from './contact.mdx'

export const Route = createFileRoute('/(main)/pages/_layout/contact')({
  component: () => {
    return <MarkdownContent />
  },
})
