type SupabaseConfig = {
  url: string
  anonKey: string
}

function readEnv(name: string): string | undefined {
  const viteValue = import.meta.env[name]
  if (typeof viteValue === "string" && viteValue.length > 0) {
    return viteValue
  }

  if (typeof process !== "undefined") {
    const processValue = process.env[name]
    if (typeof processValue === "string" && processValue.length > 0) {
      return processValue
    }
  }

  return undefined
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = readEnv("VITE_SUPABASE_URL")
  const anonKey = readEnv("VITE_SUPABASE_ANON_KEY")

  if (!url || !anonKey) {
    return null
  }

  return { url, anonKey }
}

export function requireSupabaseConfig(): SupabaseConfig {
  const config = getSupabaseConfig()
  if (!config) {
    throw new Error(
      "Supabase Auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    )
  }
  return config
}
