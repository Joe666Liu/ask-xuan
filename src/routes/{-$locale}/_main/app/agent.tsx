import { createFileRoute } from "@tanstack/react-router"
import { siteConfig } from "@/config/site-config"
import { AgentShell, type AgentShellView } from "@/features/agent-shell"

type AgentSearch = {
  session?: string
  view?: AgentShellView
  artifact?: string
}

export const Route = createFileRoute("/{-$locale}/_main/app/agent")({
  validateSearch: (search: Record<string, unknown>): AgentSearch => ({
    session: typeof search.session === "string" ? search.session : undefined,
    view: toAgentShellView(search.view),
    artifact: typeof search.artifact === "string" ? search.artifact : undefined,
  }),
  head: () => ({
    meta: [
      {
        title: `Agent | ${siteConfig.title}`,
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const activeView = search.view ?? "todo"

  return (
    <AgentShell
      selectedSessionId={search.session}
      activeView={activeView}
      openArtifactId={search.artifact}
      onSessionChange={(sessionId) => {
        if (search.session === sessionId && !search.artifact) return

        void navigate({
          search: (prev) => ({
            ...prev,
            session: sessionId,
            artifact: undefined,
          }),
        })
      }}
      onViewChange={(view, sessionId) => {
        if (activeView === view && (!sessionId || search.session === sessionId)) return

        void navigate({
          search: (prev) => ({
            ...prev,
            view,
            ...(sessionId ? { session: sessionId, artifact: undefined } : {}),
          }),
        })
      }}
      onArtifactChange={(artifactId) => {
        if (search.artifact === artifactId) return

        void navigate({
          search: (prev) => ({
            ...prev,
            artifact: artifactId,
          }),
        })
      }}
    />
  )
}

function toAgentShellView(value: unknown): AgentShellView {
  if (
    value === "all" ||
    value === "todo" ||
    value === "review" ||
    value === "done" ||
    value === "cancelled" ||
    value === "flagged" ||
    value === "archived" ||
    value === "sources" ||
    value === "skills" ||
    value === "automations" ||
    value === "settings"
  ) {
    return value
  }

  return "todo"
}
