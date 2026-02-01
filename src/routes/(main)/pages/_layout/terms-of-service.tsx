import { createFileRoute } from '@tanstack/react-router'

import MarkdownContent from './terms-of-service.mdx'

export const Route = createFileRoute('/(main)/pages/_layout/terms-of-service')({
  component: () => {
    return <MarkdownContent />
  },
})
