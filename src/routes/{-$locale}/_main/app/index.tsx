import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/{-$locale}/_main/app/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/{-$locale}/app/agent",
      params: { locale: params.locale },
    })
  },
})
