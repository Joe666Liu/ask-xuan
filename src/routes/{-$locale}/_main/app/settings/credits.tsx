import { createFileRoute } from "@tanstack/react-router"
import { CheckCircle2Icon } from "lucide-react"
import { useIntlayer } from "react-intlayer"
import { SettingsPageHeader, SettingsSection } from "@/shared/components/settings/settings-layout"
import { Button } from "@/shared/components/ui/button"
import { CreditHistoryPanel } from "@/shared/components/user-dashboard/credit-history-panel"
import { CreditPackagesPanel } from "@/shared/components/user-dashboard/credit-packages-panel"
import { cn } from "@/shared/lib/utils"

type CreditsTab = "history" | "packages"

export const Route = createFileRoute("/{-$locale}/_main/app/settings/credits")({
  validateSearch: (
    search: Record<string, unknown>
  ): { tab?: CreditsTab; success?: boolean; creditsPage?: number } => {
    const creditsPage =
      typeof search.creditsPage === "number" && Number.isFinite(search.creditsPage)
        ? Math.max(1, Math.floor(search.creditsPage))
        : undefined

    return {
      tab: search.tab === "packages" ? "packages" : "history",
      ...(search.success === true || search.success === "true" ? { success: true } : {}),
      ...(creditsPage ? { creditsPage } : {}),
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const { menu, credits, history, packages } = useIntlayer("user-dashboard")
  const { tab, success } = Route.useSearch()
  const activeTab = tab ?? "history"

  const setTab = (nextTab: CreditsTab) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        tab: nextTab,
        creditsPage: nextTab === "history" ? prev.creditsPage : undefined,
      }),
    })
  }

  const tabs: Array<{ value: CreditsTab; label: string }> = [
    { value: "history", label: history.title.value },
    { value: "packages", label: packages.title.value },
  ]

  return (
    <SettingsSection className="min-h-[calc(100dvh-13rem)]">
      <SettingsPageHeader
        title={credits.title.value}
        description={menu.usage.value}
      />

      {success && (
        <output
          className="flex items-start gap-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300"
          aria-live="polite"
        >
          <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
          <span>{packages.buy.value}</span>
        </output>
      )}

      <div
        className="inline-flex rounded-md border bg-muted/40 p-1"
        role="tablist"
        aria-label={credits.title.value}
      >
        {tabs.map((item) => (
          <Button
            key={item.value}
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "min-w-24 justify-center",
              activeTab === item.value && "bg-background shadow-sm hover:bg-background"
            )}
            role="tab"
            aria-selected={activeTab === item.value}
            onClick={() => setTab(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {activeTab === "history" ? <CreditHistoryPanel /> : <CreditPackagesPanel />}
    </SettingsSection>
  )
}
