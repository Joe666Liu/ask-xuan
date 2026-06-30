import { createBrowserClient } from "@supabase/ssr"
import type { AuthChangeEvent, AuthError, Provider, Session } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { type AuthSession, mapSupabaseUser } from "./auth-types"
import { requireSupabaseConfig } from "./supabase-config"

type AuthErrorLike = {
  code?: string
  message?: string
  status?: number
}

type FetchOptions = {
  headers?: HeadersInit
  onSuccess?: () => void
  onError?: (ctx: { error: AuthErrorLike }) => void
}

type EmailOptions = {
  email: string
  password: string
  callbackURL?: string
  name?: string
  fetchOptions?: FetchOptions
}

type SocialOptions = {
  provider: Provider
  callbackURL?: string
  fetchOptions?: FetchOptions
}

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const config = requireSupabaseConfig()
    browserClient = createBrowserClient(config.url, config.anonKey)
  }
  return browserClient
}

function mapError(error: AuthError): AuthErrorLike {
  const message = error.message.toLowerCase()
  const code =
    error.code === "invalid_credentials" || message.includes("invalid login credentials")
      ? "INVALID_EMAIL_OR_PASSWORD"
      : error.code === "email_not_confirmed"
        ? "EMAIL_NOT_VERIFIED"
        : error.code === "user_already_exists" || error.code === "email_exists"
          ? "USER_ALREADY_EXISTS"
          : error.code

  return {
    code,
    message: error.message,
    status: error.status,
  }
}

function emitError(error: AuthError, fetchOptions?: FetchOptions) {
  const mappedError = mapError(error)
  fetchOptions?.onError?.({ error: mappedError })
  return { data: null, error: mappedError }
}

function mapSession(session: Session | null): AuthSession | null {
  if (!session?.user) return null
  return {
    session,
    user: mapSupabaseUser(session.user),
  }
}

export const authClient = {
  signIn: {
    email: async ({ email, password, fetchOptions }: EmailOptions) => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return emitError(error, fetchOptions)

      fetchOptions?.onSuccess?.()
      return {
        data: mapSession(data.session),
        error: null,
      }
    },
    social: async ({ provider, callbackURL, fetchOptions }: SocialOptions) => {
      const supabase = getSupabaseBrowserClient()
      const redirectTo = callbackURL
        ? new URL(callbackURL, window.location.origin).toString()
        : window.location.origin
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      })
      if (error) return emitError(error, fetchOptions)

      fetchOptions?.onSuccess?.()
      return { data, error: null }
    },
  },
  signUp: {
    email: async ({ email, password, name, callbackURL, fetchOptions }: EmailOptions) => {
      const supabase = getSupabaseBrowserClient()
      const redirectTo = callbackURL
        ? new URL(callbackURL, window.location.origin).toString()
        : undefined
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: redirectTo,
        },
      })
      if (error) return emitError(error, fetchOptions)

      fetchOptions?.onSuccess?.()
      return {
        data: mapSession(data.session),
        error: null,
      }
    },
  },
  getSession: async () => {
    const supabase = getSupabaseBrowserClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      return { data: null, error: mapError(error) }
    }

    return { data: mapSession(session), error: null }
  },
}

export async function signOut({ fetchOptions }: { fetchOptions?: FetchOptions } = {}) {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.signOut()
  if (error) return emitError(error, fetchOptions)

  fetchOptions?.onSuccess?.()
  return { data: null, error: null }
}

export const signIn = authClient.signIn
export const signUp = authClient.signUp

type UseSessionOptions = {
  enabled?: boolean
}

export function useSession({ enabled = true }: UseSessionOptions = {}) {
  const [data, setData] = useState<AuthSession | null>(null)
  const [isPending, setIsPending] = useState(enabled)

  useEffect(() => {
    if (!enabled) {
      setData(null)
      setIsPending(false)
      return
    }

    let mounted = true
    const supabase = getSupabaseBrowserClient()

    authClient.getSession().then((result) => {
      if (!mounted) return
      setData(result.data)
      setIsPending(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setData(mapSession(session))
      setIsPending(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [enabled])

  return { data, isPending }
}
