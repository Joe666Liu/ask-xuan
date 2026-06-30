import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { getRouteAuthStateFn } from "@/actions/auth.action"
import { siteConfig } from "@/config/site-config"
import AdminSidebar from "@/shared/components/sidebar/admin-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/shared/components/ui/sidebar"
import { isAuthConfigured } from "@/shared/lib/auth/auth-config"
import { normalizeAuthRedirect } from "@/shared/lib/auth/auth-redirect"

export const Route = createFileRoute("/{-$locale}/_main/admin")({
  component: RouteComponent,
  ssr: false,
  head: () => ({
    meta: [
      {
        title: `Admin | ${siteConfig.title}`,
      },
    ],
  }),
  beforeLoad: async ({ location, params }) => {
    if (!isAuthConfigured) {
      throw redirect({
        to: "/{-$locale}/404",
        params: { locale: params.locale },
      })
    }

    const authState = await getRouteAuthStateFn()
    if (!authState.isAuthenticated) {
      throw redirect({
        to: "/{-$locale}/login",
        params: { locale: params.locale },
        search: {
          redirect: normalizeAuthRedirect(location.href, "/admin"),
        },
      })
    }

    if (!authState.isAdmin) {
      throw redirect({
        to: "/{-$locale}/404",
        params: { locale: params.locale },
      })
    }
  },
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main
        id="main-content"
        className="flex min-h-dvh min-w-0 flex-1 flex-col"
        style={{ fontFamily: "Inter Variable" }}
      >
        <div className="flex items-center border-b p-2 md:hidden">
          <SidebarTrigger />
        </div>
        <div className="flex-1 space-y-6 p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}
