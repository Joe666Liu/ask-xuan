import { createFileRoute } from "@tanstack/react-router"
import { useIntlayer } from "react-intlayer"
import { SettingsPageHeader, SettingsSection } from "@/shared/components/settings/settings-layout"
import { AccountPanel } from "@/shared/components/user-dashboard/account-panel"

export const Route = createFileRoute("/{-$locale}/_main/app/settings/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { menu } = useIntlayer("user-dashboard")

  return (
    <SettingsSection>
      <SettingsPageHeader
        title={menu.account.value}
        description={menu.settings.value}
      />
      <AccountPanel />
    </SettingsSection>
  )
}
