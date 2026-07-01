import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { getPrefix } from "intlayer"
import { CoinsIcon, LogOutIcon, UserIcon } from "lucide-react"
import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs"
import { useEffect } from "react"
import { useIntlayer, useLocale } from "react-intlayer"
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
import { useGlobalContext } from "@/shared/context/global.context"
import { signOut, useSession } from "@/shared/lib/auth/auth-client"

const rootRouteApi = getRouteApi("__root__")
const legacyDashboardPanels = ["account", "credit-history", "credit-packages"] as const

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
  const navigate = useNavigate()
  const { locale } = useLocale()
  const { localePrefix } = getPrefix(locale)
  const { userInfo, credits, config } = useGlobalContext()
  const { isAuthEnabled } = rootRouteApi.useLoaderData()
  const { data: authSession, isPending: isLoadingSession } = useSession({
    enabled: isAuthEnabled,
  })
  const creditEnabled = config?.public_credit_enable ?? false
  const [legacyDashboardPanel] = useQueryState(
    "dashboard",
    parseAsStringLiteral(legacyDashboardPanels).withOptions({
      history: "push",
      shallow: true,
      clearOnDefault: true,
    })
  )
  const [creditsPage] = useQueryState(
    "creditsPage",
    parseAsInteger.withOptions({
      history: "push",
      shallow: true,
      clearOnDefault: true,
    })
  )

  useEffect(() => {
    if (!legacyDashboardPanel) return

    const params = { locale: localePrefix }
    if (legacyDashboardPanel === "account") {
      void navigate({
        to: "/{-$locale}/app/settings",
        params,
        replace: true,
      })
      return
    }

    void navigate({
      to: "/{-$locale}/app/settings/credits",
      params,
      replace: true,
      search: {
        tab: legacyDashboardPanel === "credit-packages" ? "packages" : "history",
        creditsPage:
          legacyDashboardPanel === "credit-history" && creditsPage ? creditsPage : undefined,
      },
    })
  }, [creditsPage, legacyDashboardPanel, localePrefix, navigate])

  if (!isAuthEnabled) {
    return null
  }

  const user = userInfo?.user ?? authSession?.user ?? null

  if (!user && isLoadingSession) {
    return <Skeleton className="size-9 rounded-full" />
  }

  if (!user) {
    return (
      <Button
        asChild
        size="sm"
      >
        <LocalizedLink to="/login">{userMenu.login.value}</LocalizedLink>
      </Button>
    )
  }

  return (
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
                asChild
                className="cursor-pointer"
              >
                <LocalizedLink
                  to="/app/settings/credits"
                  search={{ tab: "packages" } as never}
                >
                  <CoinsIcon className="size-4" />
                  <div className="flex flex-1 items-center justify-between">
                    <span>{userMenu.credits.value}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {credits?.userCredits ?? 0}
                    </span>
                  </div>
                </LocalizedLink>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="cursor-pointer"
          >
            <LocalizedLink to="/app/settings">
              <UserIcon className="size-4" />
              <span>{userMenu.profile.value}</span>
            </LocalizedLink>
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
  )
}
