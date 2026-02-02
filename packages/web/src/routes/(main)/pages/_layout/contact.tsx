import { createFileRoute } from '@tanstack/react-router'

import MarkdownContent from './contact.mdx'

export const Route = createFileRoute('/(main)/pages/_layout/contact')({
  head: () => {
    return {
      meta: [
        { name: 'title', content: 'Contact' },
        {
          name: 'description',
          content: 'Reach the Closeby.tel team.',
        },
      ],
    }
  },
  component: () => {
    return <MarkdownContent />
  },
})
