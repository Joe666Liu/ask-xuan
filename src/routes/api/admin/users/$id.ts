import { createFileRoute } from "@tanstack/react-router"
import { eq } from "drizzle-orm"
import { db, user } from "@/db"
import { Resp } from "@/shared/lib/tools/response"
import { getConfig } from "@/shared/model/config.model"
import { getUserCreditBalance } from "@/shared/model/credit.model"
import { getUserRolesWithExpiry } from "@/shared/model/rbac.model"
import { findActiveSubscriptionByUserId } from "@/shared/model/subscription.model"
import type { AdminUserDetail } from "@/shared/types/admin"

export const Route = createFileRoute("/api/admin/users/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const { id } = params
          const creditEnabled = await getConfig("public_credit_enable")

          const [userData] = await db.select().from(user).where(eq(user.id, id)).limit(1)

          if (!userData) {
            return Resp.error("User not found", 404)
          }

          const [roles, subscription, creditBalance] = await Promise.all([
            getUserRolesWithExpiry(id),
            findActiveSubscriptionByUserId(id),
            creditEnabled ? getUserCreditBalance(id) : Promise.resolve(0),
          ])

          const result: AdminUserDetail = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            emailVerified: userData.emailVerified,
            image: userData.image,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
            providerCustomers: userData.providerCustomers,
            banned: userData.banned ?? false,
            bannedAt: userData.bannedAt ?? null,
            roles,
            subscription: subscription
              ? {
                  planId: subscription.planId,
                  planName: subscription.planId,
                  status: subscription.status,
                }
              : null,
            creditBalance,
          }

          return Resp.success(result)
        } catch (error) {
          console.error("Failed to fetch user:", error)
          return Resp.error("Failed to fetch user")
        }
      },
    },
  },
})
