import { createFileRoute } from "@tanstack/react-router"
import { useIntlayer } from "react-intlayer"
import {
  DashboardPageHeader,
  DashboardSection,
} from "@/shared/components/dashboard/dashboard-layout"
import { AccountPanel } from "@/shared/components/user-dashboard/account-panel"

export const Route = createFileRoute("/{-$locale}/_main/dashboard/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { menu } = useIntlayer("user-dashboard")

  return (
    <DashboardSection>
      <DashboardPageHeader
        title={menu.account.value}
        description={menu.settings.value}
      />
      <AccountPanel />
    </DashboardSection>
  )
}
