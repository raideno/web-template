import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)/dashboard/payment')({
  component: () => {
    return (
      <div>
        <div>Allow users to refill their account balance with credits.</div>
      </div>
    )
  },
})
