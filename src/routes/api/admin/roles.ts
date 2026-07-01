import { createFileRoute } from "@tanstack/react-router"
import { Resp } from "@/shared/lib/tools/response"
import { getAllRoles } from "@/shared/model/rbac.model"

export const Route = createFileRoute("/api/admin/roles")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const roles = await getAllRoles()
          return Resp.success(
            roles.map((r) => ({
              id: r.id,
              name: r.name,
              title: r.title,
              description: r.description,
              isSystem: r.isSystem,
            }))
          )
        } catch (error) {
          console.error("Failed to fetch roles:", error)
          return Resp.error("Failed to fetch roles")
        }
      },
    },
  },
})
