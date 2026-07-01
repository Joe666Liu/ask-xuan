import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { getRouteUserAuthStateFn, type RouteUserAuthState } from "@/actions/auth.action"
import { siteConfig } from "@/config/site-config"
import { isAuthConfigured } from "@/shared/lib/auth/auth-config"
import { normalizeAuthRedirect } from "@/shared/lib/auth/auth-redirect"

const APP_AUTH_CACHE_TTL_MS = 30 * 1000

type CachedAppAuthState = {
  authState: RouteUserAuthState
  cookieKey: string
  expiresAt: number
}

let cachedAppAuthState: CachedAppAuthState | undefined
let pendingAppAuthState:
  | {
      cookieKey: string
      promise: Promise<RouteUserAuthState>
    }
  | undefined

export const Route = createFileRoute("/{-$locale}/_main/app")({
  component: RouteComponent,
  ssr: false,
  head: () => ({
    meta: [
      {
        title: `App | ${siteConfig.title}`,
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

    const authState = await getAppRouteAuthState()
    if (!authState.isAuthenticated) {
      throw redirect({
        to: "/{-$locale}/login",
        params: { locale: params.locale },
        search: {
          redirect: normalizeAuthRedirect(location.href, "/app/agent"),
        },
      })
    }

    return { authState }
  },
})

function RouteComponent() {
  return <Outlet />
}

async function getAppRouteAuthState(): Promise<RouteUserAuthState> {
  if (typeof window === "undefined") {
    return getRouteUserAuthStateFn()
  }

  const now = Date.now()
  const cookieKey = document.cookie

  if (
    cachedAppAuthState &&
    cachedAppAuthState.cookieKey === cookieKey &&
    cachedAppAuthState.expiresAt > now
  ) {
    return cachedAppAuthState.authState
  }

  if (pendingAppAuthState?.cookieKey === cookieKey) {
    return pendingAppAuthState.promise
  }

  const promise = getRouteUserAuthStateFn()
    .then((authState) => {
      cachedAppAuthState = authState.isAuthenticated
        ? {
            authState,
            cookieKey,
            expiresAt: Date.now() + APP_AUTH_CACHE_TTL_MS,
          }
        : undefined

      return authState
    })
    .finally(() => {
      if (pendingAppAuthState?.promise === promise) {
        pendingAppAuthState = undefined
      }
    })

  pendingAppAuthState = { cookieKey, promise }

  return promise
}
