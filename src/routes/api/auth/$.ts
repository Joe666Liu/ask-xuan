import { createFileRoute } from "@tanstack/react-router"
import { isAuthConfigured } from "@/shared/lib/auth/auth-config"
import { getSessionFromHeaders } from "@/shared/lib/auth/auth-server"

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

const notConfiguredResponse = () =>
  json({ error: "Supabase Auth is not configured" }, { status: 503 })

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        if (!isAuthConfigured) return notConfiguredResponse()

        const pathname = new URL(request.url).pathname
        if (pathname.endsWith("/get-session")) {
          return json(await getSessionFromHeaders(request.headers))
        }

        return json({ error: "Use Supabase Auth client APIs for this endpoint" }, { status: 404 })
      },
      POST: async () => {
        if (!isAuthConfigured) return notConfiguredResponse()
        return json({ error: "Use Supabase Auth client APIs for this endpoint" }, { status: 404 })
      },
    },
  },
})
