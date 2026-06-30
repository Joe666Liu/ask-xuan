export function normalizeAuthRedirect(value: unknown, fallback?: string) {
  if (typeof value !== "string" || !value) {
    return fallback
  }

  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback
  }

  try {
    const url = new URL(value, "https://app.local")
    if (url.origin !== "https://app.local") {
      return fallback
    }

    const redirect = `${url.pathname}${url.search}${url.hash}`
    if (redirect.startsWith("/login") || redirect.startsWith("/zh/login")) {
      return fallback
    }

    return redirect || fallback
  } catch {
    return fallback
  }
}
