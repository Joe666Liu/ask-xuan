import { createFileRoute, redirect } from "@tanstack/react-router"
import { getRouteAuthStateFn } from "@/actions/auth.action"
import { siteConfig } from "@/config/site-config"
import { DashboardLayout } from "@/shared/components/dashboard/dashboard-layout"
import { getIsAuthEnabled } from "@/shared/lib/auth/auth-config"
import { normalizeAuthRedirect } from "@/shared/lib/auth/auth-redirect"
import {
  creditPackagesQueryOptions,
  userCreditsQueryOptions,
  userInfoQueryOptions,
} from "@/shared/lib/queries/app-queries"

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
    const isAuthEnabled = await getIsAuthEnabled()
    if (!isAuthEnabled) {
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
          redirect: normalizeAuthRedirect(location.href, "/dashboard"),
        },
      })
    }
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(userInfoQueryOptions()),
      context.queryClient.ensureQueryData(userCreditsQueryOptions()),
      context.queryClient.ensureQueryData(creditPackagesQueryOptions()),
    ])
  },
})
