import { createServerFn } from "@tanstack/react-start"
import type { AuthUser } from "@/shared/lib/auth/auth-types"
import { profileSessionMiddleware, sessionMiddleware } from "@/shared/middleware/auth.middleware"
import { isUserAdmin } from "@/shared/model/rbac.model"

export type RouteAuthState = {
  isAuthenticated: boolean
  isAdmin: boolean
  user: AuthUser | null
}

export type RouteUserAuthState = Omit<RouteAuthState, "isAdmin">

export const getRouteUserAuthStateFn = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(async ({ context }): Promise<RouteUserAuthState> => {
    const user = context.session?.user ?? null

    return {
      isAuthenticated: Boolean(user),
      user,
    }
  })

export const getRouteAuthStateFn = createServerFn({ method: "GET" })
  .middleware([profileSessionMiddleware])
  .handler(async ({ context }): Promise<RouteAuthState> => {
    const user = context.session?.user ?? null

    if (!user) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        user: null,
      }
    }

    return {
      isAuthenticated: true,
      isAdmin: await isUserAdmin(user.id),
      user,
    }
  })
