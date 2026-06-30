import type { Session as SupabaseSession, User as SupabaseUser } from "@supabase/supabase-js"

export type AuthUser = {
  id: string
  email: string
  name: string
  image: string | null
  emailVerified: boolean
}

export type AuthSession = {
  session: SupabaseSession | null
  user: AuthUser
}

export function mapSupabaseUser(user: SupabaseUser): AuthUser {
  const metadata = user.user_metadata ?? {}
  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : undefined
  const avatarUrl =
    typeof metadata.avatar_url === "string"
      ? metadata.avatar_url
      : typeof metadata.picture === "string"
        ? metadata.picture
        : null
  const email = user.email ?? ""

  return {
    id: user.id,
    email,
    name: fullName || email.split("@")[0] || "User",
    image: avatarUrl,
    emailVerified: Boolean(user.email_confirmed_at),
  }
}
