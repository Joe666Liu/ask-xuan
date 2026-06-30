import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { siteConfig } from "@/config/site-config"
import AdminSidebar from "@/shared/components/sidebar/admin-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/shared/components/ui/sidebar"
import { getIsAuthEnabled } from "@/shared/lib/auth/auth-config"
import { pageAdminMiddleware } from "@/shared/middleware/auth.middleware"

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
  server: {
    middleware: [pageAdminMiddleware],
  },
  beforeLoad: async () => {
    const isAuthEnabled = await getIsAuthEnabled()
    if (!isAuthEnabled) {
      throw redirect({
        to: "/{-$locale}/404",
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
