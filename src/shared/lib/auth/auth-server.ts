import { createServerClient } from "@supabase/ssr"
import { eq, sql } from "drizzle-orm"
import { db, isDatabaseEnabled, user as userTable } from "@/db"
import { type AuthSession, type AuthUser, mapSupabaseUser } from "./auth-types"
import { getSupabaseConfig } from "./supabase-config"

const legacyProfileEmail = (userId: string) => `${userId}@supabase-auth-migration.local`

type UserReference = {
  tableName: string
  columnName: string
}

function sqlIdentifier(identifier: string) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Unsafe SQL identifier: ${identifier}`)
  }
  return `"${identifier}"`
}

function parseCookieHeader(cookieHeader: string | null): Array<{ name: string; value: string }> {
  if (!cookieHeader) return []

  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .map((cookie) => {
      const separatorIndex = cookie.indexOf("=")
      if (separatorIndex === -1) {
        return { name: cookie, value: "" }
      }

      const name = cookie.slice(0, separatorIndex)
      const value = cookie.slice(separatorIndex + 1)

      try {
        return {
          name,
          value: decodeURIComponent(value),
        }
      } catch {
        return { name, value }
      }
    })
}

export function createSupabaseServerClient(headers: Headers) {
  const config = getSupabaseConfig()
  if (!config) return null

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll: () => parseCookieHeader(headers.get("cookie")),
      setAll: () => {
        // TanStack Start route middleware does not expose a single response-cookie
        // writer here. Browser Supabase SSR clients keep auth cookies current.
      },
    },
  })
}

export async function getSessionFromHeaders(headers: Headers): Promise<AuthSession | null> {
  const supabase = createSupabaseServerClient(headers)
  if (!supabase) return null

  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return null
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return {
    session,
    user: mapSupabaseUser(data.user),
  }
}

export async function ensureUserProfile(authUser: AuthUser) {
  if (!isDatabaseEnabled) return null

  const now = new Date()
  const values = {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    emailVerified: authUser.emailVerified,
    image: authUser.image,
    createdAt: now,
    updatedAt: now,
  }
  const updateValues = {
    name: authUser.name,
    email: authUser.email,
    emailVerified: authUser.emailVerified,
    image: authUser.image,
    updatedAt: now,
  }

  return await db.transaction(async (tx) => {
    const retargetUserReferences = async (fromUserId: string, toUserId: string) => {
      const references = await tx.execute<UserReference>(sql`
        select
          kcu.table_name as "tableName",
          kcu.column_name as "columnName"
        from information_schema.table_constraints tc
        join information_schema.key_column_usage kcu
          on tc.constraint_name = kcu.constraint_name
          and tc.table_schema = kcu.table_schema
        join information_schema.constraint_column_usage ccu
          on ccu.constraint_name = tc.constraint_name
          and ccu.constraint_schema = tc.constraint_schema
        where tc.constraint_type = 'FOREIGN KEY'
          and tc.table_schema = 'public'
          and ccu.table_schema = 'public'
          and ccu.table_name = 'user'
          and ccu.column_name = 'id'
      `)

      for (const reference of references) {
        const tableName = sqlIdentifier(reference.tableName)
        const columnName = sqlIdentifier(reference.columnName)
        await tx.execute(sql`
          update ${sql.raw(`public.${tableName}`)}
          set ${sql.raw(columnName)} = ${toUserId}
          where ${sql.raw(columnName)} = ${fromUserId}
        `)
      }
    }

    const [existingByEmail] = await tx
      .select()
      .from(userTable)
      .where(eq(userTable.email, authUser.email))
      .limit(1)

    if (existingByEmail && existingByEmail.id !== authUser.id) {
      const [existingById] = await tx
        .select()
        .from(userTable)
        .where(eq(userTable.id, authUser.id))
        .limit(1)

      if (!existingById) {
        await tx.insert(userTable).values({
          ...values,
          email: legacyProfileEmail(authUser.id),
        })
      }

      await retargetUserReferences(existingByEmail.id, authUser.id)
      await tx.delete(userTable).where(eq(userTable.id, existingByEmail.id))

      const [profile] = await tx
        .update(userTable)
        .set(updateValues)
        .where(eq(userTable.id, authUser.id))
        .returning()

      return profile
    }

    const [profile] = await tx
      .insert(userTable)
      .values(values)
      .onConflictDoUpdate({
        target: userTable.id,
        set: {
          name: authUser.name,
          email: authUser.email,
          emailVerified: authUser.emailVerified,
          image: authUser.image,
          updatedAt: now,
        },
      })
      .returning()

    return profile
  })
}

export async function requireAuth(headers: Headers): Promise<AuthSession> {
  const session = await getSessionFromHeaders(headers)
  if (!session) {
    throw new Error("Authentication is not configured or no Supabase Auth session is active.")
  }
  return session
}
