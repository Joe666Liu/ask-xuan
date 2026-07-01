import { createFileRoute } from "@tanstack/react-router"
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNull,
  notInArray,
  or,
  type SQL,
  sql,
} from "drizzle-orm"
import { credits, db, role, subscription, user, userRole } from "@/db"
import { Resp } from "@/shared/lib/tools/response"
import { getConfig } from "@/shared/model/config.model"
import type { AdminUserListItem } from "@/shared/types/admin"

export const Route = createFileRoute("/api/admin/users")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const page = Math.max(1, Number(url.searchParams.get("page")) || 1)
          const pageSize = Math.min(
            100,
            Math.max(1, Number(url.searchParams.get("pageSize")) || 10)
          )
          const offset = (page - 1) * pageSize

          const search = url.searchParams.get("search")?.trim()
          const bannedFilter = url.searchParams.get("banned")
          const subscriptionFilter = url.searchParams.get("subscription")
          const roleFilter = url.searchParams.get("role")
          const sortBy = url.searchParams.get("sortBy") || "createdAt"
          const sortOrder = url.searchParams.get("sortOrder") || "desc"

          const creditEnabled = await getConfig("public_credit_enable")

          const conditions: SQL[] = []

          if (search) {
            conditions.push(or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`))!)
          }

          if (bannedFilter === "true") {
            conditions.push(eq(user.banned, true))
          } else if (bannedFilter === "false") {
            conditions.push(or(eq(user.banned, false), isNull(user.banned))!)
          }

          if (subscriptionFilter === "active") {
            const subscribedUsers = db
              .selectDistinct({ userId: subscription.userId })
              .from(subscription)
              .where(eq(subscription.status, "active"))
            conditions.push(inArray(user.id, subscribedUsers))
          } else if (subscriptionFilter === "none") {
            const subscribedUsers = db
              .selectDistinct({ userId: subscription.userId })
              .from(subscription)
              .where(eq(subscription.status, "active"))
            conditions.push(notInArray(user.id, subscribedUsers))
          }

          if (roleFilter) {
            const usersWithRole = db
              .selectDistinct({ userId: userRole.userId })
              .from(userRole)
              .where(eq(userRole.roleId, roleFilter))
            conditions.push(inArray(user.id, usersWithRole))
          }

          const whereClause = conditions.length > 0 ? and(...conditions) : undefined

          const orderByColumn =
            sortBy === "name" ? user.name : sortBy === "email" ? user.email : user.createdAt
          const orderBy = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn)

          const [[{ total }], users] = await Promise.all([
            db.select({ total: count() }).from(user).where(whereClause),
            db
              .select({
                id: user.id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
                image: user.image,
                createdAt: user.createdAt,
                banned: user.banned,
                bannedAt: user.bannedAt,
              })
              .from(user)
              .where(whereClause)
              .orderBy(orderBy)
              .limit(pageSize)
              .offset(offset),
          ])

          const userIds = users.map((u) => u.id)
          const now = new Date()

          const [roleRows, subscriptionRows, creditRows] =
            userIds.length > 0
              ? await Promise.all([
                  db
                    .select({
                      userId: userRole.userId,
                      id: userRole.id,
                      roleId: role.id,
                      name: role.name,
                      title: role.title,
                      expiresAt: userRole.expiresAt,
                    })
                    .from(userRole)
                    .innerJoin(role, eq(userRole.roleId, role.id))
                    .where(inArray(userRole.userId, userIds)),
                  db
                    .select()
                    .from(subscription)
                    .where(
                      and(
                        inArray(subscription.userId, userIds),
                        or(eq(subscription.status, "active"), eq(subscription.status, "trialing"))
                      )
                    ),
                  creditEnabled
                    ? db
                        .select({
                          userId: credits.userId,
                          balance: sql<number>`coalesce(sum(${credits.credits}), 0)::int`,
                        })
                        .from(credits)
                        .where(
                          and(
                            inArray(credits.userId, userIds),
                            eq(credits.transactionType, "credit"),
                            gt(credits.credits, 0),
                            or(isNull(credits.expiresAt), gte(credits.expiresAt, now))
                          )
                        )
                        .groupBy(credits.userId)
                    : Promise.resolve([]),
                ])
              : [[], [], []]

          const rolesByUserId = new Map<string, typeof roleRows>()
          for (const roleRow of roleRows) {
            if (roleRow.expiresAt && roleRow.expiresAt <= now) continue
            const roles = rolesByUserId.get(roleRow.userId) ?? []
            roles.push(roleRow)
            rolesByUserId.set(roleRow.userId, roles)
          }

          const subscriptionByUserId = new Map<string, (typeof subscriptionRows)[number]>()
          for (const subscriptionRow of subscriptionRows) {
            if (!subscriptionByUserId.has(subscriptionRow.userId)) {
              subscriptionByUserId.set(subscriptionRow.userId, subscriptionRow)
            }
          }

          const creditBalanceByUserId = new Map(
            creditRows.map((row) => [row.userId, Number(row.balance ?? 0)])
          )

          const enrichedUsers: AdminUserListItem[] = users.map((u) => {
            const activeSubscription = subscriptionByUserId.get(u.id)

            return {
              ...u,
              banned: u.banned ?? false,
              bannedAt: u.bannedAt,
              roles: rolesByUserId.get(u.id) ?? [],
              subscription: activeSubscription
                ? {
                    planId: activeSubscription.planId,
                    planName: activeSubscription.planId,
                    status: activeSubscription.status,
                  }
                : null,
              creditBalance: creditBalanceByUserId.get(u.id) ?? 0,
            }
          })

          return Resp.success({
            items: enrichedUsers,
            pagination: {
              page,
              pageSize,
              total,
              totalPages: Math.ceil(total / pageSize),
            },
          })
        } catch (error) {
          console.error("Failed to fetch users:", error)
          return Resp.error("Failed to fetch users")
        }
      },
    },
  },
})
