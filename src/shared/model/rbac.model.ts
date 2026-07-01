import { and, asc, eq, inArray } from "drizzle-orm"
import { getDb, role, rolePermission, user, userRole } from "@/db"
import { getUuid } from "@/shared/lib/tools/hash"

export async function getUserRolesByUserId(userId: string) {
  const db = getDb()
  if (!db) return []
  const roles = await db
    .select({
      role: role,
      userRole: userRole,
    })
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .where(eq(userRole.userId, userId))

  return roles
    .filter((r) => !r.userRole.expiresAt || r.userRole.expiresAt > new Date())
    .map((r) => r.role)
}

export async function getUserRolesWithExpiry(userId: string) {
  const db = getDb()
  if (!db) return []
  const roles = await db
    .select({
      id: userRole.id,
      roleId: role.id,
      name: role.name,
      title: role.title,
      expiresAt: userRole.expiresAt,
    })
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .where(eq(userRole.userId, userId))

  return roles.filter((r) => !r.expiresAt || r.expiresAt > new Date())
}

export async function getAllRoles() {
  const db = getDb()
  if (!db) return []
  return db.select().from(role).orderBy(asc(role.sort))
}

export async function assignRoleToUser(userId: string, roleId: string, expiresAt?: Date) {
  const db = getDb()
  if (!db) throw new Error("Database is not configured")
  const existing = await db
    .select()
    .from(userRole)
    .where(and(eq(userRole.userId, userId), eq(userRole.roleId, roleId)))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(userRole)
      .set({ expiresAt: expiresAt ?? null })
      .where(eq(userRole.id, existing[0].id))
    return existing[0]
  }

  const [result] = await db
    .insert(userRole)
    .values({
      id: getUuid(),
      userId,
      roleId,
      expiresAt: expiresAt ?? null,
    })
    .returning()

  return result
}

export async function removeRoleFromUser(userId: string, roleId: string) {
  const db = getDb()
  if (!db) throw new Error("Database is not configured")
  await db.delete(userRole).where(and(eq(userRole.userId, userId), eq(userRole.roleId, roleId)))
}

export async function isUserBanned(userId: string): Promise<boolean> {
  const db = getDb()
  if (!db) return false
  const [userData] = await db
    .select({ banned: user.banned })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
  return userData?.banned ?? false
}

export async function getUserPermissionRules(userId: string) {
  const db = getDb()
  if (!db) return []
  const roles = await getUserRolesByUserId(userId)
  if (roles.length === 0) return []

  const roleIds = roles.map((r) => r.id)

  const permissions = await db
    .select()
    .from(rolePermission)
    .where(inArray(rolePermission.roleId, roleIds))

  return permissions.map((p) => ({
    permissionCode: p.permissionCode,
    inverted: p.inverted,
    conditions: p.conditions ?? undefined,
  }))
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const roles = await getUserRolesByUserId(userId)
  return roles.some((r) => r.name === "super_admin" || r.name === "admin")
}
