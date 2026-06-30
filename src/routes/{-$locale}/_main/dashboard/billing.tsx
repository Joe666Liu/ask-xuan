import { createFileRoute } from "@tanstack/react-router"
import { CheckCircle2Icon } from "lucide-react"
import { useState } from "react"
import { useIntlayer } from "react-intlayer"
import {
  DashboardPageHeader,
  DashboardSection,
} from "@/shared/components/dashboard/dashboard-layout"
import { PricingCards } from "@/shared/components/landing/pricing/pricing-cards"
import { CreditDetail } from "@/shared/components/user-dashboard/account-panel"

export const Route = createFileRoute("/{-$locale}/_main/dashboard/billing")({
  validateSearch: (search: Record<string, unknown>): { success?: boolean } =>
    search.success === true || search.success === "true" ? { success: true } : {},
  component: RouteComponent,
})

function RouteComponent() {
  const [isPricingVisible, setIsPricingVisible] = useState(true)
  const { billing } = useIntlayer("user-dashboard")
  const { success } = Route.useSearch()

  return (
    <DashboardSection>
      <DashboardPageHeader
        title={billing.title.value}
        description={billing.noSubscriptionDesc.value}
      />

      {success && (
        <output
          className="flex items-start gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300"
          aria-live="polite"
        >
          <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
          <span>{billing.statusActive.value}</span>
        </output>
      )}

      <CreditDetail onUpgradeClick={() => setIsPricingVisible(true)} />

      {isPricingVisible && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{billing.upgrade.value}</h2>
          <PricingCards variant="compact" />
        </div>
      )}
    </DashboardSection>
  )
}
