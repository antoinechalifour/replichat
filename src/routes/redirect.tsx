import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/redirect')({
  beforeLoad: async ({context}) => {
    context.user.id

    throw redirect({
      to: '/posts',
    })
  },
})
