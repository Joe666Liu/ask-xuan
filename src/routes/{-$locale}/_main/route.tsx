import { createFileRoute, Outlet } from "@tanstack/react-router"
import { GlobalContextProvider } from "@/shared/context/global.context"
import { configQueryOptions } from "@/shared/lib/queries/app-queries"

export const Route = createFileRoute("/{-$locale}/_main")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(configQueryOptions())
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <GlobalContextProvider>
      <Outlet />
    </GlobalContextProvider>
  )
}
