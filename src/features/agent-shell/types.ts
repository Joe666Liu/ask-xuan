export type AgentSessionStatus = "active" | "idle" | "completed" | "error"

export type AgentShellView =
  | "all"
  | "todo"
  | "review"
  | "done"
  | "cancelled"
  | "flagged"
  | "archived"
  | "sources"
  | "skills"
  | "automations"
  | "settings"

export type AgentSessionWorkflowState = "todo" | "review" | "done" | "cancelled"

export type AgentActivityStatus = "pending" | "running" | "completed" | "error" | "backgrounded"

export type AgentActivityType = "tool" | "thinking" | "intermediate" | "status" | "plan"

export type AgentArtifactType = "code" | "terminal" | "document" | "diff" | "preview"

export type AgentMessageRole = "user" | "assistant"

export type AgentSession = {
  id: string
  title: string
  status: AgentSessionStatus
  workflowState: AgentSessionWorkflowState
  model: string
  updatedAt: number
  summary: string
  tags: string[]
  flagged?: boolean
  archived?: boolean
  unread?: boolean
}

export type AgentActivity = {
  id: string
  type: AgentActivityType
  status: AgentActivityStatus
  label: string
  detail: string
  startedAt: number
  endedAt?: number
  path?: string
  diffStats?: {
    additions: number
    deletions: number
  }
}

export type AgentArtifact = {
  id: string
  type: AgentArtifactType
  title: string
  subtitle: string
  status: AgentActivityStatus
  language?: string
  content: string
}

export type AgentMessage = {
  id: string
  role: AgentMessageRole
  content: string
  createdAt: number
}
