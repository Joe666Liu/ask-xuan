import { createFileRoute } from "@tanstack/react-router"
import { eq } from "drizzle-orm"
import { db, user } from "@/db"
import { Resp } from "@/shared/lib/tools/response"
import {
  assignRoleToUser,
  getUserRolesWithExpiry,
  removeRoleFromUser,
} from "@/shared/model/rbac.model"

export const Route = createFileRoute("/api/admin/users/$id/roles")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const { id } = params
          const roles = await getUserRolesWithExpiry(id)
          return Resp.success(roles)
        } catch (error) {
          console.error("Failed to fetch user roles:", error)
          return Resp.error("Failed to fetch user roles")
        }
      },

      POST: async ({ params, request }) => {
        try {
          const { id } = params

          const [userData] = await db.select().from(user).where(eq(user.id, id)).limit(1)

          if (!userData) {
            return Resp.error("User not found", 404)
          }

          const body = await request.json()
          const { roleId, expiresAt } = body as { roleId: string; expiresAt?: string }

          if (!roleId) {
            return Resp.error("roleId is required", 400)
          }

          await assignRoleToUser(id, roleId, expiresAt ? new Date(expiresAt) : undefined)
          const roles = await getUserRolesWithExpiry(id)

          return Resp.success(roles)
        } catch (error) {
          console.error("Failed to assign role:", error)
          return Resp.error("Failed to assign role")
        }
      },

      DELETE: async ({ params, request }) => {
        try {
          const { id } = params

          const body = await request.json()
          const { roleId } = body as { roleId: string }

          if (!roleId) {
            return Resp.error("roleId is required", 400)
          }

          await removeRoleFromUser(id, roleId)
          const roles = await getUserRolesWithExpiry(id)

          return Resp.success(roles)
        } catch (error) {
          console.error("Failed to remove role:", error)
          return Resp.error("Failed to remove role")
        }
      },
    },
  },
})
