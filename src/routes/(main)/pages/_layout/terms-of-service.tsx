import { createFileRoute } from '@tanstack/react-router'

import MarkdownContent from './terms-of-service.mdx'

export const Route = createFileRoute('/(main)/pages/_layout/terms-of-service')({
  head: () => {
    return {
      meta: [
        { name: 'title', content: 'Privacy Policy' },
        {
          name: 'description',
          content: 'How we collect, use, and protect your data.',
        },
      ],
    }
  },
  component: () => {
    return <MarkdownContent />
  },
})
