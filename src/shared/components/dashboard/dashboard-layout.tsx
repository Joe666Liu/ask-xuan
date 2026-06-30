import { Outlet, useRouterState } from "@tanstack/react-router"
import { CreditCardIcon, HomeIcon, type LucideIcon, UserIcon, WalletCardsIcon } from "lucide-react"
import type { ReactNode } from "react"
import { useIntlayer } from "react-intlayer"
import { siteConfig } from "@/config/site-config"
import { LocalizedLink, type To } from "@/shared/components/locale/localized-link"
import { Button } from "@/shared/components/ui/button"
import { useGlobalContext } from "@/shared/context/global.context"
import { cn } from "@/shared/lib/utils"

type DashboardNavItem = {
  label: string
  to: To
  match: string
  icon: LucideIcon
  search?: Record<string, unknown>
}

export function DashboardLayout() {
  const { menu } = useIntlayer("user-dashboard")
  const { config } = useGlobalContext()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const creditEnabled = config?.public_credit_enable ?? false

  const navItems: DashboardNavItem[] = [
    {
      label: menu.account.value,
      to: "/dashboard",
      match: "/dashboard",
      icon: UserIcon,
    },
    {
      label: menu.billing.value,
      to: "/dashboard/billing",
      match: "/dashboard/billing",
      icon: CreditCardIcon,
    },
  ]

  if (creditEnabled) {
    navItems.push({
      label: menu.usage.value,
      to: "/dashboard/credits",
      match: "/dashboard/credits",
      icon: WalletCardsIcon,
      search: { tab: "history" },
    })
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b bg-background/95">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
          <LocalizedLink
            to="/"
            className="flex min-w-0 items-center gap-2 font-semibold"
          >
            <img
              src="/logo.svg"
              alt=""
              className="size-5"
            />
            <span className="truncate">{siteConfig.title}</span>
          </LocalizedLink>
          <div className="ml-auto">
            <Button
              asChild
              variant="ghost"
              size="sm"
            >
              <LocalizedLink to="/">
                <HomeIcon className="size-4" />
                <span>Home</span>
              </LocalizedLink>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-[13rem_minmax(0,1fr)] md:py-8">
        <aside className="md:sticky md:top-6 md:self-start">
          <nav className="flex gap-1 overflow-x-auto border-b pb-2 md:flex-col md:overflow-visible md:border-b-0 md:pb-0">
            {navItems.map((item) => {
              const isActive =
                item.match === "/dashboard"
                  ? pathname.endsWith("/dashboard")
                  : pathname.includes(item.match)
              return (
                <LocalizedLink
                  key={item.match}
                  to={item.to}
                  search={item.search as never}
                  className={cn(
                    "flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    isActive && "bg-muted text-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </LocalizedLink>
              )
            })}
          </nav>
        </aside>

        <main
          id="main-content"
          className="min-w-0"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function DashboardPageHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}

export function DashboardSection({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={cn("space-y-6", className)}>{children}</section>
}
