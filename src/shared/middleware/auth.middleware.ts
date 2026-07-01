import { redirect } from "@tanstack/react-router"
import { createMiddleware } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { ensureUserProfile, getSessionFromHeaders } from "@/shared/lib/auth/auth-server"
import type { AuthSession } from "@/shared/lib/auth/auth-types"
import { Resp } from "@/shared/lib/tools/response"
import { isUserAdmin } from "@/shared/model/rbac.model"
import { isAuthConfigured } from "../lib/auth/auth-config"

type Session = AuthSession | null

/**
 * session middleware, pass session to handler context (can be null)
 */
export const sessionMiddleware = createMiddleware().server(async ({ next }) => {
  if (!isAuthConfigured) {
    return await next({ context: { session: null } })
  }
  try {
    const headers = getRequestHeaders()
    const session = await getSessionFromHeaders(headers)
    return await next({ context: { session } })
  } catch (error) {
    console.error("[sessionMiddleware] Failed to get session:", error)
    return await next({ context: { session: null } })
  }
})

/**
 * Profile session middleware, syncs authenticated users into the local user table.
 * Use this only for server work that needs local user-owned database records.
 */
export const profileSessionMiddleware = createMiddleware()
  .middleware([sessionMiddleware])
  .server(async ({ next, context }) => {
    if (context.session) {
      try {
        await ensureUserProfile(context.session.user)
      } catch (error) {
        console.error("[profileSessionMiddleware] Failed to ensure user profile:", error)
      }
    }

    return await next({ context: { session: context.session } })
  })

/**
 * API auth middleware, require user to be logged in, returns HTTP error responses
 * Use this for API routes (/api/*)
 */
export const apiAuthMiddleware = createMiddleware()
  .middleware([profileSessionMiddleware])
  .server(async ({ next, context }) => {
    if (!isAuthConfigured) {
      return Resp.error("Authentication is not configured", 503)
    }
    if (!context.session) {
      return Resp.error("Unauthorized", 401, "FORBIDDEN")
    }
    return await next({ context: { session: context.session as NonNullable<Session> } })
  })

/**
 * Page auth middleware, redirects to login page if user is not logged in
 * Use this for page routes
 */
export const pageAuthMiddleware = createMiddleware()
  .middleware([sessionMiddleware])
  .server(async ({ next, context }) => {
    if (!isAuthConfigured) {
      throw redirect({ to: "/{-$locale}/404" })
    }
    if (!context.session) {
      throw redirect({ to: "/{-$locale}/login" })
    }
    return await next({ context: { session: context.session as NonNullable<Session> } })
  })

/**
 * API admin middleware, requires admin role, returns HTTP error responses
 * Use this for admin API routes (/api/admin/*)
 */
export const apiAdminMiddleware = createMiddleware()
  .middleware([profileSessionMiddleware])
  .server(async ({ next, context }) => {
    if (!isAuthConfigured) {
      return Resp.error("Authentication is not configured", 503)
    }
    if (!context.session) {
      return Resp.error("Unauthorized", 401, "FORBIDDEN")
    }

    const isAdmin = await isUserAdmin(context.session.user.id)
    if (!isAdmin) {
      return Resp.error("Forbidden", 403, "FORBIDDEN")
    }

    return await next()
  })

/**
 * Page admin middleware, requires admin role, redirects to 404 if not admin
 * Use this for admin page routes
 */
export const pageAdminMiddleware = createMiddleware()
  .middleware([profileSessionMiddleware])
  .server(async ({ next, context }) => {
    if (!isAuthConfigured) {
      throw redirect({ to: "/{-$locale}/404" })
    }
    if (!context.session) {
      throw redirect({ to: "/{-$locale}/login" })
    }

    const isAdmin = await isUserAdmin(context.session.user.id)
    if (!isAdmin) {
      throw redirect({ to: "/{-$locale}/404" })
    }

    return await next()
  })
