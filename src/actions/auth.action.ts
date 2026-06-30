import { createServerFn } from "@tanstack/react-start"
import { sessionMiddleware } from "@/shared/middleware/auth.middleware"
import { isUserAdmin } from "@/shared/model/rabc.model"

export type RouteAuthState = {
  isAuthenticated: boolean
  isAdmin: boolean
}

export const getRouteAuthStateFn = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(async ({ context }): Promise<RouteAuthState> => {
    const userId = context.session?.user.id

    if (!userId) {
      return {
        isAuthenticated: false,
        isAdmin: false,
      }
    }

    return {
      isAuthenticated: true,
      isAdmin: await isUserAdmin(userId),
    }
  })
