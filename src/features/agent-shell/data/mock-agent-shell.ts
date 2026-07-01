import type {
  AgentActivity,
  AgentArtifact,
  AgentMessage,
  AgentSession,
} from "@/features/agent-shell/types"

const now = Date.now()

export const mockAgentSessions: AgentSession[] = [
  {
    id: "shell-craft-port",
    title: "Port Craft shell into Ask Xuan",
    status: "active",
    workflowState: "todo",
    model: "Claude Sonnet 4.5",
    updatedAt: now - 1000 * 60 * 8,
    summary: "Build a Web agent shell with side sessions, activities, and artifact preview.",
    tags: ["ui-shell", "craft", "tanstack"],
    unread: true,
  },
  {
    id: "billing-rules-audit",
    title: "Audit subscription credit edge cases",
    status: "idle",
    workflowState: "review",
    model: "GPT-5 Codex",
    updatedAt: now - 1000 * 60 * 58,
    summary: "Review purchase, webhook, and credit history paths for broken states.",
    tags: ["billing", "credits"],
    flagged: true,
  },
  {
    id: "long-session-name",
    title:
      "Design a resilient agent panel title that keeps working when user-generated task names are extremely long",
    status: "completed",
    workflowState: "done",
    model: "Gemini 3 Pro",
    updatedAt: now - 1000 * 60 * 60 * 7,
    summary: "Stress test long copy in every rail, tab, and overlay header.",
    tags: ["stress-test", "layout"],
  },
  {
    id: "failed-tool-run",
    title: "Investigate deployment preview failure",
    status: "error",
    workflowState: "review",
    model: "Claude Opus 4.5",
    updatedAt: now - 1000 * 60 * 60 * 23,
    summary: "A build failed while resolving a server-only import from a client component.",
    tags: ["build", "error"],
  },
  {
    id: "cancelled-research",
    title: "Pause AG-UI runtime spike",
    status: "idle",
    workflowState: "cancelled",
    model: "Claude Sonnet 4.5",
    updatedAt: now - 1000 * 60 * 60 * 28,
    summary: "Keep the shell copy separate from the future assistant-ui runtime.",
    tags: ["runtime", "deferred"],
    archived: true,
  },
]

export const mockAgentMessages: Record<string, AgentMessage[]> = {
  "shell-craft-port": [
    {
      id: "msg-1",
      role: "user",
      content:
        "Build the first version of the agent shell. Copy what is safe from Craft, keep our chat engine separate.",
      createdAt: now - 1000 * 60 * 18,
    },
    {
      id: "msg-2",
      role: "assistant",
      content:
        "I will keep the shell as a Web layout: session inbox on the left, thread and activity stream in the center, context and artifacts on the right.",
      createdAt: now - 1000 * 60 * 16,
    },
  ],
  "billing-rules-audit": [
    {
      id: "msg-3",
      role: "user",
      content: "Find weak points in the credit package and payment flow.",
      createdAt: now - 1000 * 60 * 62,
    },
  ],
  "long-session-name": [
    {
      id: "msg-4",
      role: "user",
      content: "Make sure the shell does not break with long titles or dense output.",
      createdAt: now - 1000 * 60 * 60 * 8,
    },
  ],
  "failed-tool-run": [
    {
      id: "msg-5",
      role: "user",
      content: "The preview build failed. Show me where and what to inspect.",
      createdAt: now - 1000 * 60 * 60 * 24,
    },
  ],
}

export const mockAgentActivities: Record<string, AgentActivity[]> = {
  "shell-craft-port": [
    {
      id: "act-plan",
      type: "plan",
      status: "completed",
      label: "Create shell plan",
      detail: "Route, three panels, mock states, and overlay boundary are locked.",
      startedAt: now - 1000 * 60 * 15,
      endedAt: now - 1000 * 60 * 14,
    },
    {
      id: "act-files",
      type: "tool",
      status: "completed",
      label: "Read Craft panel sources",
      detail: "Panel, LoadingIndicator, terminal parser, and overlay primitives are portable.",
      path: "/tmp/craft-agents-oss/packages/ui/src/components",
      startedAt: now - 1000 * 60 * 13,
      endedAt: now - 1000 * 60 * 12,
    },
    {
      id: "act-edit",
      type: "tool",
      status: "running",
      label: "Build Web shell",
      detail: "Creating panels, inspector tabs, and artifact preview without Craft transport.",
      path: "src/features/agent-shell",
      startedAt: now - 1000 * 60 * 6,
      diffStats: { additions: 842, deletions: 0 },
    },
    {
      id: "act-bg",
      type: "status",
      status: "backgrounded",
      label: "Index future chat runtime",
      detail: "assistant-ui and AG-UI integration is intentionally deferred.",
      startedAt: now - 1000 * 60 * 4,
    },
  ],
  "billing-rules-audit": [
    {
      id: "act-billing-plan",
      type: "thinking",
      status: "completed",
      label: "Map payment states",
      detail: "Checkout, webhook, cancellation, and credit history surfaces are identified.",
      startedAt: now - 1000 * 60 * 58,
      endedAt: now - 1000 * 60 * 55,
    },
    {
      id: "act-billing-tool",
      type: "tool",
      status: "pending",
      label: "Inspect webhook handler",
      detail: "Waiting for payment provider credentials before running integration checks.",
      path: "src/routes/api/payment/webhook.$provider.ts",
      startedAt: now - 1000 * 60 * 54,
    },
  ],
  "long-session-name": [
    {
      id: "act-long-copy",
      type: "tool",
      status: "completed",
      label: "Stress long content",
      detail:
        "Long titles, dense metadata, and empty artifact states remain constrained by min-width and truncation rules.",
      startedAt: now - 1000 * 60 * 60 * 7,
      endedAt: now - 1000 * 60 * 60 * 6,
    },
  ],
  "failed-tool-run": [
    {
      id: "act-failed",
      type: "tool",
      status: "error",
      label: "Run production build",
      detail: "Build failed. A server-only module was imported into a client-rendered route.",
      path: "vite build",
      startedAt: now - 1000 * 60 * 60 * 23,
      endedAt: now - 1000 * 60 * 60 * 22,
    },
  ],
}

export const mockAgentArtifacts: Record<string, AgentArtifact[]> = {
  "shell-craft-port": [
    {
      id: "artifact-layout",
      type: "code",
      title: "agent-shell.tsx",
      subtitle: "Craft-style Web shell",
      status: "running",
      language: "tsx",
      content: `export function AgentShell() {
  return (
    <div className="agent-shell-craft">
      <CraftTopBar />
      <CraftLeftSidebar />
      <CraftNavigatorPanel />
      <CraftContentPanel />
    </div>
  )
}`,
    },
    {
      id: "artifact-terminal",
      type: "terminal",
      title: "Validation Output",
      subtitle: "Mock terminal artifact",
      status: "completed",
      language: "bash",
      content:
        "$ pnpm run check\n\n> ask-xuan@ check\n> biome check\n\n\u001b[32mChecked 38 files in 412ms. No fixes applied.\u001b[0m",
    },
    {
      id: "artifact-notes",
      type: "document",
      title: "Copy Boundary",
      subtitle: "Craft code import rules",
      status: "completed",
      language: "md",
      content:
        "Direct-copy only covers pure UI primitives. Craft TurnCard, Electron shell, transport, Jotai atoms, and annotation runtime stay out of V1.",
    },
  ],
  "billing-rules-audit": [
    {
      id: "artifact-billing",
      type: "document",
      title: "Billing audit notes",
      subtitle: "Draft",
      status: "pending",
      language: "md",
      content:
        "Check whether canceled subscriptions leave credits untouched and whether failed webhooks can be replayed safely.",
    },
  ],
  "long-session-name": [],
  "failed-tool-run": [
    {
      id: "artifact-build-error",
      type: "terminal",
      title: "Build failure",
      subtitle: "vite build",
      status: "error",
      language: "bash",
      content:
        "$ pnpm run build\n\n[vite] Error: server-only import reached client bundle\n  at src/routes/example.tsx:3:1",
    },
  ],
}
