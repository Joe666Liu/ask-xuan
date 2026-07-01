import { createFileRoute } from "@tanstack/react-router"
import { siteConfig } from "@/config/site-config"
import { SettingsLayout } from "@/shared/components/settings/settings-layout"
import { userCreditsQueryOptions, userInfoQueryOptions } from "@/shared/lib/queries/app-queries"

export const Route = createFileRoute("/{-$locale}/_main/app/settings")({
  component: SettingsLayout,
  head: () => ({
    meta: [
      {
        title: `Settings | ${siteConfig.title}`,
      },
    ],
  }),
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(userInfoQueryOptions())
    void context.queryClient.prefetchQuery(userCreditsQueryOptions())
  },
})
