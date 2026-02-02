import { createFileRoute } from '@tanstack/react-router'

import MarkdownContent from './about.mdx'

export const Route = createFileRoute('/(main)/pages/_layout/about')({
  head: () => {
    return {
      meta: [
        { name: 'title', content: 'About' },
        {
          name: 'description',
          content: 'Learn about Closeby.tel mission and principles.',
        },
      ],
    }
  },
  component: () => {
    return <MarkdownContent />
  },
})
