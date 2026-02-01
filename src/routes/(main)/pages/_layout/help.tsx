import { createFileRoute } from '@tanstack/react-router'

import MarkdownContent from './help.mdx'

export const Route = createFileRoute('/(main)/pages/_layout/help')({
  head: () => {
    return {
      meta: [
        { name: 'title', content: 'Help & FAQ' },
        {
          name: 'description',
          content: 'Get support answers and common questions.',
        },
      ],
    }
  },
  component: () => {
    return <MarkdownContent />
  },
})
