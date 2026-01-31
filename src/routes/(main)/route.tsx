import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(main)')({
  component: () => {
    return (
      <div className="h-full! w-full">
        <Outlet />
      </div>
    )
  },
})
