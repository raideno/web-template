import { createFileRoute } from '@tanstack/react-router'

import MarkdownContent from './privacy-policy.mdx'

export const Route = createFileRoute('/(main)/pages/_layout/privacy-policy')({
  head: () => {
    return {
      meta: [
        { name: 'title', content: 'Terms of Service' },
        {
          name: 'description',
          content: 'Rules and conditions for using Closeby.tel.',
        },
      ],
    }
  },
  component: () => {
    return <MarkdownContent />
  },
})
