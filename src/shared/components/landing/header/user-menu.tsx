import { getRouteApi } from "@tanstack/react-router"
import { CoinsIcon, LogOutIcon, UserIcon } from "lucide-react"
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs"
import { useIntlayer } from "react-intlayer"
import { LocalizedLink } from "@/shared/components/locale/localized-link"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
  type DashboardPanel,
  dashboardPanels,
  UserDashboard,
} from "@/shared/components/user-dashboard"
import { useGlobalContext } from "@/shared/context/global.context"
import { signOut } from "@/shared/lib/auth/auth-client"

const rootRouteApi = getRouteApi("__root__")

function getInitials(name: string | undefined | null) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function UserMenu() {
  const { userMenu } = useIntlayer("auth")
  const { userInfo, credits, config, isLoadingUserInfo } = useGlobalContext()
  const { isAuthEnabled } = rootRouteApi.useLoaderData()
  const creditEnabled = config?.public_credit_enable ?? false
  const [dashboardPanel, setDashboardPanel] = useQueryState(
    "dashboard",
    parseAsStringLiteral(dashboardPanels).withOptions({
      history: "push",
      shallow: true,
      clearOnDefault: true,
    })
  )
  const [, setCreditsPage] = useQueryState(
    "creditsPage",
    parseAsInteger.withOptions({
      history: "push",
      shallow: true,
      clearOnDefault: true,
    })
  )
  if (!isAuthEnabled) {
    return null
  }

  if (isLoadingUserInfo) {
    return <Skeleton className="size-9 rounded-full" />
  }

  if (!userInfo?.user) {
    return (
      <Button
        asChild
        size="sm"
      >
        <LocalizedLink to="/login">{userMenu.login.value}</LocalizedLink>
      </Button>
    )
  }

  const { user } = userInfo
  const activePanel: DashboardPanel =
    dashboardPanel && (creditEnabled || dashboardPanel === "account") ? dashboardPanel : "account"
  const isOpenUserDashboard = dashboardPanel !== null

  const openDashboard = (panel: DashboardPanel) => {
    void setDashboardPanel(panel)
    if (panel !== "credit-history") {
      void setCreditsPage(null)
    }
  }

  const handleDashboardOpenChange = (open: boolean) => {
    if (open) {
      if (!dashboardPanel) {
        void setDashboardPanel("account")
      }
      return
    }

    void setDashboardPanel(null)
    void setCreditsPage(null)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <Avatar className="size-8">
              <AvatarImage
                src={user.image ?? undefined}
                alt={user.name ?? userMenu.avatarAlt.value}
                cache
              />
              <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-72"
          align="end"
        >
          <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2 font-normal">
            <Avatar className="size-10">
              <AvatarImage
                src={user.image ?? undefined}
                alt={user.name ?? userMenu.avatarAlt.value}
                cache
              />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col items-start overflow-hidden">
              <span className="text-foreground font-medium truncate w-full">{user.name}</span>
              <span className="text-muted-foreground text-sm truncate w-full">{user.email}</span>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {creditEnabled && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => openDashboard("credit-packages")}
                  className="cursor-pointer"
                >
                  <CoinsIcon className="size-4" />
                  <div className="flex flex-1 items-center justify-between">
                    <span>{userMenu.credits.value}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {credits?.userCredits ?? 0}
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => openDashboard("account")}
              className="cursor-pointer"
            >
              <UserIcon className="size-4" />
              <span>{userMenu.profile.value}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOut({ fetchOptions: { onSuccess: () => window.location.reload() } })}
            className="cursor-pointer"
          >
            <LogOutIcon className="size-4" />
            <span>{userMenu.logout.value}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserDashboard
        open={isOpenUserDashboard}
        onOpenChange={handleDashboardOpenChange}
        panel={activePanel}
        onPanelChange={openDashboard}
      />
    </>
  )
}
