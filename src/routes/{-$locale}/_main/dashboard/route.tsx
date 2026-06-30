import { createFileRoute, redirect } from "@tanstack/react-router"
import { siteConfig } from "@/config/site-config"
import { DashboardLayout } from "@/shared/components/dashboard/dashboard-layout"
import { authClient } from "@/shared/lib/auth/auth-client"
import { isAuthConfigured } from "@/shared/lib/auth/auth-config"
import { normalizeAuthRedirect } from "@/shared/lib/auth/auth-redirect"
import { userCreditsQueryOptions, userInfoQueryOptions } from "@/shared/lib/queries/app-queries"

export const Route = createFileRoute("/{-$locale}/_main/dashboard")({
  component: DashboardLayout,
  ssr: false,
  head: () => ({
    meta: [
      {
        title: `Dashboard | ${siteConfig.title}`,
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

    const session = await authClient.getSession()
    if (!session.data?.user) {
      throw redirect({
        to: "/{-$locale}/login",
        params: { locale: params.locale },
        search: {
          redirect: normalizeAuthRedirect(location.href, "/dashboard"),
        },
      })
    }
  },
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(userInfoQueryOptions())
    void context.queryClient.prefetchQuery(userCreditsQueryOptions())
  },
})
