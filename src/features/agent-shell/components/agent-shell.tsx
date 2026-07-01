import {
  ArchiveIcon,
  ArrowUpIcon,
  BotIcon,
  BoxIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleIcon,
  ClockIcon,
  DatabaseIcon,
  FileTextIcon,
  FolderOpenIcon,
  GlobeIcon,
  HelpCircleIcon,
  InboxIcon,
  LayersIcon,
  ListFilterIcon,
  ListTodoIcon,
  type LucideIcon,
  MoreHorizontalIcon,
  PanelLeftIcon,
  PaperclipIcon,
  PlusIcon,
  RadioIcon,
  SettingsIcon,
  ShareIcon,
  SparklesIcon,
  SquarePenIcon,
  TagIcon,
  WaypointsIcon,
  XIcon,
  ZapIcon,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import * as React from "react"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { cn } from "@/shared/lib/utils"
import {
  mockAgentActivities,
  mockAgentArtifacts,
  mockAgentMessages,
  mockAgentSessions,
} from "../data/mock-agent-shell"
import type {
  AgentActivity,
  AgentArtifact,
  AgentMessage,
  AgentSession,
  AgentSessionWorkflowState,
  AgentShellView,
} from "../types"
import { ArtifactOverlay } from "./artifact-overlay"
import { LoadingIndicator } from "./craft/loading-indicator"
import "./craft-agent-shell.css"

type AgentShellProps = {
  selectedSessionId?: string
  activeView: AgentShellView
  openArtifactId?: string
  onSessionChange: (sessionId: string) => void
  onViewChange: (view: AgentShellView, sessionId?: string) => void
  onArtifactChange: (artifactId?: string) => void
}

const SESSION_VIEWS = new Set<AgentShellView>([
  "all",
  "todo",
  "review",
  "done",
  "cancelled",
  "flagged",
  "archived",
])

const VIEW_LABELS: Record<AgentShellView, string> = {
  all: "所有会话",
  todo: "待办",
  review: "待审查",
  done: "完成",
  cancelled: "已取消",
  flagged: "已标记",
  archived: "已归档",
  sources: "数据源",
  skills: "技能",
  automations: "自动化",
  settings: "设置",
}

const WORKFLOW_STATES: Record<
  AgentSessionWorkflowState,
  {
    label: string
    icon: LucideIcon
    color: string
  }
> = {
  todo: {
    label: "待办",
    icon: CircleIcon,
    color: "var(--foreground)",
  },
  review: {
    label: "待审查",
    icon: CircleIcon,
    color: "var(--ds-amber-700)",
  },
  done: {
    label: "完成",
    icon: CheckCircle2Icon,
    color: "var(--ds-purple-700)",
  },
  cancelled: {
    label: "已取消",
    icon: XIcon,
    color: "var(--muted-foreground)",
  },
}

const MOCK_SOURCES = [
  {
    id: "api",
    title: "API",
    description: "Connected HTTP and REST context",
    icon: GlobeIcon,
    count: 3,
  },
  {
    id: "mcp",
    title: "MCP",
    description: "Model Context Protocol servers",
    icon: WaypointsIcon,
    count: 2,
  },
  {
    id: "local",
    title: "本地文件夹",
    description: "Workspace files and repo context",
    icon: FolderOpenIcon,
    count: 4,
  },
]

const MOCK_SKILLS = [
  {
    id: "research",
    title: "Research brief",
    description: "Search, synthesize, and cite sources",
    icon: ZapIcon,
  },
  {
    id: "code-review",
    title: "Code review",
    description: "Find regressions and missing tests",
    icon: BotIcon,
  },
  {
    id: "ship",
    title: "Ship checklist",
    description: "Prepare release notes and validation",
    icon: CheckCircle2Icon,
  },
]

const MOCK_AUTOMATIONS = [
  {
    id: "scheduled",
    title: "定时任务",
    description: "Run daily and weekly agent checks",
    icon: ClockIcon,
    count: 2,
  },
  {
    id: "event",
    title: "事件触发",
    description: "Start when webhooks or records change",
    icon: RadioIcon,
    count: 1,
  },
  {
    id: "agentic",
    title: "智能体",
    description: "Long-running monitored workflows",
    icon: BotIcon,
    count: 3,
  },
]

const MOCK_SETTINGS = [
  {
    id: "profile",
    title: "个人资料",
    description: "Name, email, and account identity",
    icon: SettingsIcon,
  },
  {
    id: "billing",
    title: "订阅",
    description: "Plan, invoices, and payment method",
    icon: BoxIcon,
  },
  { id: "credits", title: "积分", description: "Credit balance and packages", icon: LayersIcon },
]

export function AgentShell({
  selectedSessionId,
  activeView,
  openArtifactId,
  onSessionChange,
  onViewChange,
  onArtifactChange,
}: AgentShellProps) {
  const isCompact = useIsCompact()
  const [sidebarVisible, setSidebarVisible] = React.useState(true)
  const [compactDetailActive, setCompactDetailActive] = React.useState(Boolean(selectedSessionId))

  React.useEffect(() => {
    if (selectedSessionId) setCompactDetailActive(true)
  }, [selectedSessionId])

  const filteredSessions = React.useMemo(
    () => getSessionsForView(activeView, mockAgentSessions),
    [activeView]
  )
  const selectedSession =
    mockAgentSessions.find((session) => session.id === selectedSessionId) ??
    filteredSessions[0] ??
    mockAgentSessions[0]
  const activities = mockAgentActivities[selectedSession.id] ?? []
  const artifacts = mockAgentArtifacts[selectedSession.id] ?? []
  const messages = mockAgentMessages[selectedSession.id] ?? []
  const openArtifact = artifacts.find((artifact) => artifact.id === openArtifactId)

  const handleViewChange = React.useCallback(
    (view: AgentShellView) => {
      const nextSessions = getSessionsForView(view, mockAgentSessions)
      const nextSessionId =
        isSessionView(view) && !nextSessions.some((session) => session.id === selectedSession.id)
          ? nextSessions[0]?.id
          : undefined

      onViewChange(view, nextSessionId)
      if (isCompact) setCompactDetailActive(false)
    },
    [isCompact, onViewChange, selectedSession.id]
  )

  const handleSessionSelect = React.useCallback(
    (sessionId: string) => {
      onSessionChange(sessionId)
      if (isCompact) setCompactDetailActive(true)
    },
    [isCompact, onSessionChange]
  )

  const handleTopbarPanelToggle = React.useCallback(() => {
    if (isCompact) {
      setCompactDetailActive(false)
      return
    }

    setSidebarVisible((visible) => !visible)
  }, [isCompact])

  return (
    <div className="agent-shell-craft h-dvh min-h-dvh overflow-hidden bg-[var(--craft-foreground-2)] text-foreground">
      <CraftTopBar
        activeSession={selectedSession}
        isCompact={isCompact}
        onToggleSidebar={handleTopbarPanelToggle}
      />

      <div className="h-full pt-[var(--craft-topbar-height)]">
        <div
          className="flex h-full items-stretch"
          style={{
            gap: "var(--craft-panel-gap)",
            paddingRight: isCompact ? 0 : "var(--craft-panel-edge-inset)",
            paddingBottom: isCompact ? 0 : "var(--craft-panel-edge-inset)",
          }}
        >
          {isCompact ? (
            <CraftCompactPanelStack
              activeView={activeView}
              selectedSession={selectedSession}
              sessions={filteredSessions}
              activities={activities}
              artifacts={artifacts}
              messages={messages}
              detailActive={compactDetailActive}
              onBackToNavigator={() => setCompactDetailActive(false)}
              onSessionSelect={handleSessionSelect}
              onOpenArtifact={onArtifactChange}
            />
          ) : (
            <CraftDesktopPanelStack
              activeView={activeView}
              sidebarVisible={sidebarVisible}
              selectedSession={selectedSession}
              sessions={filteredSessions}
              activities={activities}
              artifacts={artifacts}
              messages={messages}
              onViewChange={handleViewChange}
              onSessionSelect={handleSessionSelect}
              onOpenArtifact={onArtifactChange}
            />
          )}
        </div>
      </div>

      <ArtifactOverlay
        artifact={openArtifact}
        onClose={() => onArtifactChange(undefined)}
      />
    </div>
  )
}

function CraftDesktopPanelStack({
  activeView,
  sidebarVisible,
  selectedSession,
  sessions,
  activities,
  artifacts,
  messages,
  onViewChange,
  onSessionSelect,
  onOpenArtifact,
}: {
  activeView: AgentShellView
  sidebarVisible: boolean
  selectedSession: AgentSession
  sessions: AgentSession[]
  activities: AgentActivity[]
  artifacts: AgentArtifact[]
  messages: AgentMessage[]
  onViewChange: (view: AgentShellView) => void
  onSessionSelect: (sessionId: string) => void
  onOpenArtifact: (artifactId: string) => void
}) {
  return (
    <div className="craft-scrollbar-hidden relative z-10 flex min-w-0 flex-1 overflow-x-auto overflow-y-hidden">
      <div
        className="flex h-full min-w-0 flex-1"
        style={{
          gap: "var(--craft-panel-gap)",
          paddingLeft: sidebarVisible ? 0 : "var(--craft-panel-edge-inset)",
        }}
      >
        {sidebarVisible && (
          <aside
            className="h-full shrink-0 overflow-hidden"
            style={{ width: "var(--craft-sidebar-width)" }}
          >
            <CraftLeftSidebar
              activeView={activeView}
              onViewChange={onViewChange}
            />
          </aside>
        )}

        <section
          className="craft-shadow-middle relative z-[2] h-full shrink-0 overflow-hidden bg-background"
          style={{
            width: "var(--craft-navigator-width)",
            borderTopLeftRadius: "var(--craft-radius-inner)",
            borderTopRightRadius: "var(--craft-radius-inner)",
            borderBottomLeftRadius: sidebarVisible
              ? "var(--craft-radius-inner)"
              : "var(--craft-radius-edge)",
            borderBottomRightRadius: "var(--craft-radius-inner)",
          }}
        >
          <CraftNavigatorPanel
            activeView={activeView}
            sessions={sessions}
            selectedSessionId={selectedSession.id}
            onSessionSelect={onSessionSelect}
          />
        </section>

        <CraftContentPanel
          activeView={activeView}
          session={selectedSession}
          activities={activities}
          artifacts={artifacts}
          messages={messages}
          onOpenArtifact={onOpenArtifact}
        />
      </div>
    </div>
  )
}

function CraftCompactPanelStack({
  activeView,
  selectedSession,
  sessions,
  activities,
  artifacts,
  messages,
  detailActive,
  onBackToNavigator,
  onSessionSelect,
  onOpenArtifact,
}: {
  activeView: AgentShellView
  selectedSession: AgentSession
  sessions: AgentSession[]
  activities: AgentActivity[]
  artifacts: AgentArtifact[]
  messages: AgentMessage[]
  detailActive: boolean
  onBackToNavigator: () => void
  onSessionSelect: (sessionId: string) => void
  onOpenArtifact: (artifactId: string) => void
}) {
  const reduceMotion = useReducedMotion()
  const transition = reduceMotion
    ? { type: "tween" as const, duration: 0.12 }
    : { type: "spring" as const, stiffness: 400, damping: 36, mass: 0.8 }

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden">
      <motion.div
        className="craft-compact-slot overflow-hidden bg-background craft-shadow-middle"
        style={{
          borderTopLeftRadius: "var(--craft-radius-inner)",
          borderTopRightRadius: "var(--craft-radius-inner)",
          pointerEvents: detailActive ? "none" : "auto",
        }}
        aria-hidden={detailActive || undefined}
        initial={false}
        animate={{ x: detailActive ? "-30%" : "0%" }}
        transition={transition}
      >
        <CraftNavigatorPanel
          activeView={activeView}
          sessions={sessions}
          selectedSessionId={selectedSession.id}
          onSessionSelect={onSessionSelect}
        />
      </motion.div>

      <motion.div
        className="craft-compact-slot z-10 flex"
        style={{
          pointerEvents: detailActive ? "auto" : "none",
        }}
        aria-hidden={!detailActive || undefined}
        initial={false}
        animate={{ x: detailActive ? "0%" : "100%" }}
        transition={transition}
      >
        <CraftContentPanel
          activeView={activeView}
          session={selectedSession}
          activities={activities}
          artifacts={artifacts}
          messages={messages}
          onBack={onBackToNavigator}
          onOpenArtifact={onOpenArtifact}
          compact
        />
      </motion.div>
    </div>
  )
}

function CraftTopBar({
  activeSession,
  isCompact,
  onToggleSidebar,
}: {
  activeSession: AgentSession
  isCompact: boolean
  onToggleSidebar: () => void
}) {
  return (
    <header
      className="fixed inset-x-0 top-0 z-[50]"
      style={{ height: "var(--craft-topbar-height)" }}
    >
      <div className="flex h-full w-full items-center justify-between gap-2">
        <div
          className="flex min-w-0 flex-1 items-center gap-0.5"
          style={{ paddingLeft: 12, paddingRight: isCompact ? 12 : 0 }}
        >
          <TopBarButton
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
          >
            <PanelLeftIcon className="size-[18px] text-foreground/70" />
          </TopBarButton>
          <TopBarButton aria-label="Agent menu">
            <SparklesIcon className="size-[18px] text-foreground/70" />
          </TopBarButton>

          <div
            className={cn(
              "ml-1 flex min-w-0 items-center gap-1",
              isCompact ? "flex-1" : "w-[clamp(220px,42vw,640px)]"
            )}
          >
            {!isCompact && (
              <>
                <TopBarButton
                  aria-label="Back"
                  disabled
                >
                  <ChevronLeftIcon
                    className="size-[18px] text-foreground/70"
                    strokeWidth={1.5}
                  />
                </TopBarButton>
                <TopBarButton
                  aria-label="Forward"
                  disabled
                >
                  <ChevronRightIcon
                    className="size-[18px] text-foreground/70"
                    strokeWidth={1.5}
                  />
                </TopBarButton>
              </>
            )}

            <button
              type="button"
              className="craft-shadow-minimal flex h-[30px] min-w-0 flex-1 items-center justify-start gap-1 rounded-[8px] border border-foreground/5 bg-background px-3 text-[13px] text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
              aria-label="Workspace"
            >
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--craft-foreground-5)] text-[10px] font-medium text-foreground/70">
                M
              </span>
              <span className="truncate">{isCompact ? activeSession.title : "My Workspace"}</span>
              <ChevronDownIcon className="ml-auto size-3.5 shrink-0 opacity-60" />
            </button>
          </div>
        </div>

        {!isCompact && (
          <div className="flex min-w-0 shrink-0 items-center justify-end gap-1 pr-3">
            <div className="hidden max-w-[320px] items-center gap-1 rounded-[8px] bg-foreground/3 px-2 py-1 text-[12px] text-foreground/45 xl:flex">
              <BotIcon className="size-3.5" />
              <span className="truncate">{activeSession.title}</span>
            </div>
            <TopBarButton aria-label="Add panel">
              <PlusIcon
                className="size-4 text-foreground/50"
                strokeWidth={1.5}
              />
            </TopBarButton>
            <TopBarButton aria-label="Help">
              <HelpCircleIcon
                className="size-4 text-foreground/50"
                strokeWidth={1.5}
              />
            </TopBarButton>
          </div>
        )}
      </div>
    </header>
  )
}

function TopBarButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex size-7 items-center justify-center rounded-[6px] transition-colors duration-100 hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function CraftLeftSidebar({
  activeView,
  onViewChange,
}: {
  activeView: AgentShellView
  onViewChange: (view: AgentShellView) => void
}) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({
    sessions: true,
    labels: false,
    sources: true,
    automations: true,
  })

  const counts = React.useMemo(() => getSessionCounts(mockAgentSessions), [])
  const toggle = (id: string) => setExpanded((current) => ({ ...current, [id]: !current[id] }))

  const items: SidebarItem[] = [
    {
      id: "sessions",
      title: "所有会话",
      icon: InboxIcon,
      label: String(mockAgentSessions.length),
      view: "all",
      expandable: true,
      expanded: expanded.sessions,
      onToggle: () => toggle("sessions"),
      items: [
        ...Object.entries(WORKFLOW_STATES).map(([state, config]) => ({
          id: `state:${state}`,
          title: config.label,
          icon: config.icon,
          iconColor: config.color,
          view: state as AgentShellView,
          label: String(counts[state as AgentSessionWorkflowState]),
        })),
        { id: "separator:states", type: "separator" as const },
        {
          id: "flagged",
          title: "已标记",
          icon: TagIcon,
          view: "flagged" as const,
          label: String(counts.flagged),
        },
        {
          id: "archived",
          title: "已归档",
          icon: ArchiveIcon,
          view: "archived" as const,
          label: String(counts.archived),
        },
      ],
    },
    {
      id: "labels",
      title: "标签",
      icon: TagIcon,
      expandable: true,
      expanded: expanded.labels,
      onToggle: () => toggle("labels"),
      items: [
        { id: "label:ui", title: "ui-shell", icon: TagIcon, label: "2" },
        { id: "label:billing", title: "billing", icon: TagIcon, label: "1" },
      ],
    },
    { id: "separator:main", type: "separator" },
    {
      id: "sources",
      title: "数据源",
      icon: DatabaseIcon,
      label: String(MOCK_SOURCES.length),
      view: "sources",
      expandable: true,
      expanded: expanded.sources,
      onToggle: () => toggle("sources"),
      items: MOCK_SOURCES.map((source) => ({
        id: `source:${source.id}`,
        title: source.title,
        icon: source.icon,
        view: "sources" as const,
        label: String(source.count),
      })),
    },
    {
      id: "skills",
      title: "技能",
      icon: ZapIcon,
      label: String(MOCK_SKILLS.length),
      view: "skills",
    },
    {
      id: "automations",
      title: "自动化",
      icon: ListTodoIcon,
      label: String(MOCK_AUTOMATIONS.length),
      view: "automations",
      expandable: true,
      expanded: expanded.automations,
      onToggle: () => toggle("automations"),
      items: MOCK_AUTOMATIONS.map((automation) => ({
        id: `automation:${automation.id}`,
        title: automation.title,
        icon: automation.icon,
        view: "automations" as const,
        label: automation.count ? String(automation.count) : undefined,
      })),
    },
    { id: "separator:settings", type: "separator" },
    {
      id: "settings",
      title: "设置",
      icon: SettingsIcon,
      view: "settings",
    },
    {
      id: "whats-new",
      title: "最新动态",
      icon: ClockIcon,
    },
  ]

  return (
    <div className="flex h-full select-none flex-col">
      <div className="shrink-0 px-2 pb-2">
        <button
          type="button"
          className="craft-shadow-minimal flex w-full items-center justify-start gap-2 rounded-[6px] bg-background px-2 py-[7px] text-[13px] font-normal transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <SquarePenIcon className="size-3.5 shrink-0" />
          新建
        </button>
      </div>

      <ScrollArea className="min-h-0 flex-1 craft-mask-fade-bottom">
        <nav
          className="grid gap-0.5 px-2 pb-4"
          aria-label="Agent navigation"
        >
          {items.map((item) => (
            <SidebarItemButton
              key={item.id}
              item={item}
              activeView={activeView}
              onViewChange={onViewChange}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  )
}

type SidebarItem =
  | {
      id: string
      title: string
      icon: LucideIcon
      iconColor?: string
      label?: string
      view?: AgentShellView
      expandable?: boolean
      expanded?: boolean
      onToggle?: () => void
      items?: SidebarItem[]
    }
  | {
      id: string
      type: "separator"
    }

function SidebarItemButton({
  item,
  activeView,
  onViewChange,
  nested = false,
}: {
  item: SidebarItem
  activeView: AgentShellView
  onViewChange: (view: AgentShellView) => void
  nested?: boolean
}) {
  if ("type" in item) {
    return (
      <div
        className="px-2 py-1"
        aria-hidden="true"
      >
        <div className="h-px bg-foreground/5" />
      </div>
    )
  }

  const Icon = item.icon
  const active = item.view === activeView

  return (
    <div className="group/section">
      <button
        type="button"
        className={cn(
          "group flex w-full items-center gap-2 rounded-[6px] px-2 py-[5px] text-[13px] outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring",
          active ? "bg-foreground/[0.07]" : "hover:bg-foreground/5",
          nested && "text-foreground/80"
        )}
        onClick={() => {
          if (item.view) onViewChange(item.view)
        }}
      >
        <span className="relative flex size-3.5 shrink-0 items-center justify-center">
          {item.expandable ? (
            <>
              <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-150 group-hover:opacity-0">
                <Icon
                  className="size-3.5"
                  style={{
                    color:
                      item.iconColor ?? "color-mix(in srgb, var(--foreground) 60%, transparent)",
                  }}
                />
              </span>
              <span
                className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                onClick={(event) => {
                  event.stopPropagation()
                  item.onToggle?.()
                }}
              >
                <ChevronRightIcon
                  className={cn(
                    "size-3.5 text-muted-foreground transition-transform duration-200",
                    item.expanded && "rotate-90"
                  )}
                />
              </span>
            </>
          ) : (
            <Icon
              className="size-3.5"
              style={{
                color: item.iconColor ?? "color-mix(in srgb, var(--foreground) 60%, transparent)",
              }}
            />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate text-left">{item.title}</span>
        {item.label && (
          <span className="text-xs text-foreground/30 opacity-0 transition-opacity group-hover/section:opacity-100">
            {item.label}
          </span>
        )}
      </button>

      {item.expandable && item.items && item.expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.16, ease: "easeInOut" }}
          className="relative mt-0.5 mb-2 overflow-hidden pl-5"
        >
          <div
            className="absolute bottom-1 left-[13px] top-1 w-px bg-foreground/10"
            aria-hidden="true"
          />
          <div className="grid gap-0.5">
            {item.items.map((child) => (
              <SidebarItemButton
                key={child.id}
                item={child}
                activeView={activeView}
                onViewChange={onViewChange}
                nested
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function CraftNavigatorPanel({
  activeView,
  sessions,
  selectedSessionId,
  onSessionSelect,
}: {
  activeView: AgentShellView
  sessions: AgentSession[]
  selectedSessionId: string
  onSessionSelect: (sessionId: string) => void
}) {
  const groupedSessions = React.useMemo(() => groupSessionsByDate(sessions), [sessions])

  return (
    <div className="flex h-full min-w-0 flex-col">
      <PanelHeader
        title={VIEW_LABELS[activeView]}
        actions={
          isSessionView(activeView) ? (
            <HeaderIconButton aria-label="Filter sessions">
              <ListFilterIcon className="size-4" />
            </HeaderIconButton>
          ) : (
            <HeaderIconButton aria-label="Add item">
              <PlusIcon className="size-4" />
            </HeaderIconButton>
          )
        }
      />

      {isSessionView(activeView) ? (
        <ScrollArea className="min-h-0 flex-1 select-none craft-mask-fade-y">
          <div className="flex flex-col pb-2 pt-1">
            {groupedSessions.length === 0 ? (
              <EmptyNavigatorState
                title="没有会话"
                description="这个视图下还没有 agent 会话。"
              />
            ) : (
              groupedSessions.map((group) => (
                <div key={group.key}>
                  <div className="px-4 py-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </span>
                  </div>
                  {group.items.map((session, index) => (
                    <CraftSessionRow
                      key={session.id}
                      session={session}
                      selected={session.id === selectedSessionId}
                      showSeparator={index > 0}
                      onSelect={() => onSessionSelect(session.id)}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      ) : (
        <NavigatorEntityList activeView={activeView} />
      )}
    </div>
  )
}

function NavigatorEntityList({ activeView }: { activeView: AgentShellView }) {
  const rows =
    activeView === "sources"
      ? MOCK_SOURCES
      : activeView === "skills"
        ? MOCK_SKILLS
        : activeView === "automations"
          ? MOCK_AUTOMATIONS
          : MOCK_SETTINGS

  return (
    <ScrollArea className="min-h-0 flex-1 select-none craft-mask-fade-y">
      <div className="flex flex-col pb-2 pt-1">
        <div className="px-4 py-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {VIEW_LABELS[activeView]}
          </span>
        </div>
        {rows.map((row, index) => (
          <CraftEntityRow
            key={row.id}
            icon={row.icon}
            title={row.title}
            description={row.description}
            count={"count" in row && typeof row.count === "number" ? row.count : undefined}
            showSeparator={index > 0}
          />
        ))}
      </div>
    </ScrollArea>
  )
}

function CraftSessionRow({
  session,
  selected,
  showSeparator,
  onSelect,
}: {
  session: AgentSession
  selected: boolean
  showSeparator: boolean
  onSelect: () => void
}) {
  const state = WORKFLOW_STATES[session.workflowState]
  const StateIcon = state.icon

  return (
    <div data-selected={selected || undefined}>
      {showSeparator && (
        <div className="pl-[38px] pr-4">
          <div className="h-px bg-border" />
        </div>
      )}
      <div className="relative group select-none pl-2 mr-2">
        {selected && <div className="absolute left-0 inset-y-0 w-[2px] bg-ring" />}
        <button
          type="button"
          className={cn(
            "flex w-full items-start gap-2 rounded-[8px] py-3 pl-2 pr-4 text-left text-sm outline-none transition-colors duration-75",
            selected ? "bg-foreground/3" : "hover:bg-foreground/2"
          )}
          onClick={onSelect}
          aria-current={selected ? "true" : undefined}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex w-full min-w-0 items-center gap-[10px]">
              <div className="flex shrink-0 items-center gap-[10px] [&>*]:size-3">
                <StateIcon
                  className="size-3"
                  style={{ color: state.color }}
                />
                {(session.status === "active" || session.unread) && (
                  <span className="size-2 rounded-full bg-accent" />
                )}
              </div>
              <div className="min-w-0 flex-1 truncate font-sans font-medium text-[13px]">
                {session.title}
              </div>
              <span className="shrink-0 text-[11px] text-foreground/40">
                {formatTimeAgo(session.updatedAt)}
              </span>
            </div>
            <div className="flex w-full min-w-0 items-start gap-[10px] -mt-1 text-[12px] leading-[1.35] text-foreground/55">
              <div
                className="invisible flex shrink-0 items-center gap-[10px] [&>*]:size-3"
                aria-hidden="true"
              >
                <StateIcon className="size-3" />
                <span className="size-2 rounded-full" />
              </div>
              <div className="line-clamp-2 min-w-0 flex-1">{session.summary}</div>
            </div>
            {session.tags.length > 0 && (
              <div className="flex w-full min-w-0 items-center gap-[10px] text-xs text-foreground/70 -mb-[2px]">
                <div
                  className="invisible flex shrink-0 items-center gap-[10px] [&>*]:size-3"
                  aria-hidden="true"
                >
                  <StateIcon className="size-3" />
                  <span className="size-2 rounded-full" />
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
                  {session.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="h-[18px] shrink-0 rounded bg-foreground/5 px-1.5 text-[10px] font-medium leading-[18px] text-foreground/55"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </button>
      </div>
    </div>
  )
}

function CraftEntityRow({
  icon: Icon,
  title,
  description,
  count,
  showSeparator,
}: {
  icon: LucideIcon
  title: string
  description: string
  count?: number
  showSeparator: boolean
}) {
  return (
    <div>
      {showSeparator && (
        <div className="pl-[38px] pr-4">
          <div className="h-px bg-border" />
        </div>
      )}
      <div className="relative group select-none pl-2 mr-2">
        <button
          type="button"
          className="flex w-full items-start gap-2 rounded-[8px] py-3 pl-2 pr-4 text-left text-sm outline-none transition-colors duration-75 hover:bg-foreground/2 focus-visible:ring-1 focus-visible:ring-ring"
        >
          <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-foreground/55">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 flex-1 truncate text-[13px] font-medium">{title}</div>
              {typeof count === "number" && (
                <span className="text-[11px] text-foreground/40">{count}</span>
              )}
            </div>
            <div className="mt-1 line-clamp-2 text-[12px] leading-[1.35] text-foreground/55">
              {description}
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

function CraftContentPanel({
  activeView,
  session,
  activities,
  artifacts,
  messages,
  compact,
  onBack,
  onOpenArtifact,
}: {
  activeView: AgentShellView
  session: AgentSession
  activities: AgentActivity[]
  artifacts: AgentArtifact[]
  messages: AgentMessage[]
  compact?: boolean
  onBack?: () => void
  onOpenArtifact: (artifactId: string) => void
}) {
  const isUtilityView = !isSessionView(activeView)

  return (
    <main
      className={cn(
        "craft-shadow-middle flex h-full min-w-[var(--craft-panel-min-width)] flex-1 flex-col overflow-hidden bg-[var(--craft-foreground-2)]",
        compact
          ? "min-w-0 rounded-t-[var(--craft-radius-inner)]"
          : "rounded-[var(--craft-radius-inner)]"
      )}
    >
      <PanelHeader
        title={isUtilityView ? VIEW_LABELS[activeView] : session.title}
        leadingAction={
          compact ? (
            <PanelHeaderCenterButton
              aria-label="Back to sessions"
              onClick={onBack}
            >
              <ChevronLeftIcon className="size-4" />
            </PanelHeaderCenterButton>
          ) : undefined
        }
        actions={
          <>
            <PanelHeaderCenterButton aria-label="Share session">
              <ShareIcon className="size-4" />
            </PanelHeaderCenterButton>
            <PanelHeaderCenterButton
              aria-label="Close panel"
              onClick={onBack}
            >
              <XIcon className="size-4" />
            </PanelHeaderCenterButton>
          </>
        }
      />

      {isUtilityView ? (
        <UtilityPanelContent activeView={activeView} />
      ) : (
        <CraftThread
          session={session}
          messages={messages}
          activities={activities}
          artifacts={artifacts}
          compact={compact}
          onOpenArtifact={onOpenArtifact}
        />
      )}
    </main>
  )
}

function PanelHeader({
  title,
  leadingAction,
  actions,
}: {
  title: string
  leadingAction?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="relative flex h-[50px] shrink-0 items-center justify-center px-3">
      <div className="absolute left-2 flex items-center gap-1">{leadingAction}</div>
      <button
        type="button"
        className="flex max-w-[min(70%,560px)] items-center gap-1 rounded-[8px] px-2 py-1 text-sm font-semibold outline-none transition-colors hover:bg-foreground/3 focus-visible:ring-1 focus-visible:ring-ring"
      >
        <span className="truncate">{title}</span>
        <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
      </button>
      <div className="absolute right-2 flex items-center gap-1">{actions}</div>
    </div>
  )
}

function HeaderIconButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-[4px] text-muted-foreground transition-colors hover:bg-foreground/3 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function PanelHeaderCenterButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "craft-shadow-minimal inline-flex shrink-0 items-center justify-center rounded-[6px] bg-background p-1.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function CraftThread({
  session,
  messages,
  activities,
  artifacts,
  compact,
  onOpenArtifact,
}: {
  session: AgentSession
  messages: AgentMessage[]
  activities: AgentActivity[]
  artifacts: AgentArtifact[]
  compact?: boolean
  onOpenArtifact: (artifactId: string) => void
}) {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      data-session-id={session.id}
    >
      <div className="relative min-h-0 flex-1">
        <div className="h-full craft-mask-fade-y">
          <ScrollArea className="h-full min-w-0">
            <div
              className={cn(
                "mx-auto min-w-0 max-w-[840px]",
                compact ? "space-y-2 px-3 py-4" : "space-y-2.5 px-5 py-8"
              )}
            >
              {messages.map((message) => (
                <CraftMessageBubble
                  key={message.id}
                  message={message}
                />
              ))}

              <CraftAgentRunCard
                activities={activities}
                artifacts={artifacts}
                onOpenArtifact={onOpenArtifact}
              />
            </div>
          </ScrollArea>
        </div>
      </div>

      <CraftChatInputZone
        session={session}
        compact={compact}
      />
    </div>
  )
}

function CraftMessageBubble({ message }: { message: AgentMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end pt-4 pb-2">
        <div className="max-w-[78%] rounded-[10px] bg-[var(--craft-user-message-bubble)] px-4 py-2.5 text-sm leading-6 text-foreground">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[10px] bg-background px-4 py-3 text-sm leading-6 craft-shadow-minimal">
      {message.content}
    </div>
  )
}

function CraftAgentRunCard({
  activities,
  artifacts,
  onOpenArtifact,
}: {
  activities: AgentActivity[]
  artifacts: AgentArtifact[]
  onOpenArtifact: (artifactId: string) => void
}) {
  const running = activities.some((activity) => activity.status === "running")
  const failed = activities.some((activity) => activity.status === "error")
  const completed = activities.filter((activity) => activity.status === "completed").length

  return (
    <section className="overflow-hidden rounded-[10px] bg-background craft-shadow-middle">
      <div className="flex items-center gap-3 border-b border-border/50 bg-[var(--craft-foreground-2)] px-4 py-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-background craft-shadow-minimal">
          <BotIcon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-sm font-semibold">Agent Run</h2>
            {running && (
              <LoadingIndicator
                label="Running"
                showElapsed
                className="text-xs"
                spinnerClassName="text-[10px]"
              />
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {completed} completed, {activities.length - completed} open
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium craft-shadow-minimal",
            failed ? "bg-destructive/10 text-destructive" : "bg-background text-foreground/70"
          )}
        >
          {failed ? "Needs review" : running ? "Live" : "Ready"}
        </span>
      </div>

      <div className="flex flex-col p-2">
        {activities.map((activity) => (
          <ActivityRow
            key={activity.id}
            activity={activity}
          />
        ))}
      </div>

      {artifacts.length > 0 && (
        <div className="grid gap-2 border-t border-border/50 p-3 sm:grid-cols-2">
          {artifacts.slice(0, 2).map((artifact) => (
            <button
              key={artifact.id}
              type="button"
              className="min-w-0 rounded-[8px] bg-[var(--craft-foreground-2)] p-3 text-left transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring craft-shadow-minimal"
              onClick={() => onOpenArtifact(artifact.id)}
            >
              <div className="truncate text-[13px] font-semibold">{artifact.title}</div>
              <div className="mt-1 truncate text-xs text-muted-foreground">{artifact.subtitle}</div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

function ActivityRow({ activity }: { activity: AgentActivity }) {
  const TypeIcon = getActivityTypeIcon(activity.type)
  const StatusIcon = getActivityStatusIcon(activity.status)

  return (
    <div className="group flex min-w-0 gap-2 rounded-[8px] px-2 py-2 transition-colors hover:bg-foreground/3">
      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-background text-muted-foreground craft-shadow-minimal">
        <TypeIcon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <ChevronRightIcon className="size-3 shrink-0 text-muted-foreground" />
          <span className="truncate text-[13px] font-semibold">{activity.label}</span>
          <StatusIcon
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground",
              activity.status === "running" && "animate-spin text-foreground",
              activity.status === "error" && "text-destructive"
            )}
          />
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {activity.detail}
        </p>
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
          {activity.path && (
            <span className="max-w-full truncate rounded-[6px] bg-[var(--craft-foreground-2)] px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground craft-shadow-minimal">
              {activity.path}
            </span>
          )}
          {activity.diffStats && (
            <span className="rounded-[6px] bg-[var(--craft-foreground-2)] px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground craft-shadow-minimal">
              +{activity.diffStats.additions} -{activity.diffStats.deletions}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function CraftChatInputZone({ session, compact }: { session: AgentSession; compact?: boolean }) {
  const [draft, setDraft] = React.useState("")
  const state = WORKFLOW_STATES[session.workflowState]
  const StateIcon = state.icon

  return (
    <form
      className={cn(
        "mx-auto mt-1 w-full max-w-[840px]",
        compact ? "px-2 pb-3" : "px-3 pb-4 sm:px-4"
      )}
      onSubmit={(event) => {
        event.preventDefault()
        setDraft("")
      }}
    >
      <div className="mb-2 flex items-start gap-2 px-px pt-px pb-0.5">
        <button
          type="button"
          className="flex h-[30px] items-center gap-1.5 rounded-[8px] bg-foreground/5 px-2.5 pr-2 text-xs font-medium text-foreground/60 craft-shadow-minimal"
        >
          <CircleIcon className="size-3.5" />
          探索
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </button>
        <button
          type="button"
          className="flex h-[30px] items-center gap-1.5 rounded-[8px] bg-background px-2.5 pr-2 text-xs font-medium text-foreground/70 craft-shadow-minimal"
        >
          <StateIcon
            className="size-3.5"
            style={{ color: state.color }}
          />
          {state.label}
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </button>
        <button
          type="button"
          className="ml-auto hidden h-[30px] items-center gap-1.5 rounded-[8px] bg-background px-2.5 text-xs font-medium text-foreground/60 craft-shadow-minimal sm:flex"
        >
          <MoreHorizontalIcon className="size-3.5" />
          信息
        </button>
      </div>

      <div className="relative overflow-hidden rounded-[12px] bg-background transition-colors craft-shadow-middle">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.currentTarget.form?.requestSubmit()
            }
          }}
          placeholder="按 ⌘ + . 进入专注模式"
          className="min-h-[88px] w-full resize-none bg-transparent px-5 pt-4 pb-3 text-sm outline-none placeholder:text-muted-foreground/65"
          rows={3}
        />
        <div className="flex items-center gap-1 border-t border-border/50 px-2 py-2">
          <IconToolButton aria-label="Attach files">
            <PaperclipIcon className="size-4" />
          </IconToolButton>
          <IconToolButton aria-label="Sources">
            <DatabaseIcon className="size-4" />
          </IconToolButton>
          <IconToolButton aria-label="Workspace root">
            <FolderOpenIcon className="size-4" />
          </IconToolButton>
          <button
            type="button"
            className="ml-auto flex min-w-0 items-center gap-1 rounded-[8px] px-2 py-1 text-xs text-foreground/55 transition-colors hover:bg-foreground/5"
          >
            <span className="max-w-[160px] truncate">kimi-for-coding</span>
            <ChevronDownIcon className="size-3.5 shrink-0" />
          </button>
          <button
            type="submit"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-35"
            aria-label="Send message"
            disabled={draft.trim().length === 0}
          >
            <ArrowUpIcon className="size-4" />
          </button>
        </div>
      </div>
    </form>
  )
}

function IconToolButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex size-8 items-center justify-center rounded-[8px] text-foreground/55 transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function UtilityPanelContent({ activeView }: { activeView: AgentShellView }) {
  const rows =
    activeView === "sources"
      ? MOCK_SOURCES
      : activeView === "skills"
        ? MOCK_SKILLS
        : activeView === "automations"
          ? MOCK_AUTOMATIONS
          : MOCK_SETTINGS

  return (
    <ScrollArea className="min-h-0 flex-1 craft-mask-fade-y">
      <div className="mx-auto max-w-[840px] px-5 py-8">
        <div className="rounded-[10px] bg-background p-4 craft-shadow-middle">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">{VIEW_LABELS[activeView]}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              V1 keeps Craft's shell layout while these operational panels stay mocked.
            </p>
          </div>
          <div className="grid gap-2">
            {rows.map((row) => {
              const Icon = row.icon

              return (
                <div
                  key={row.id}
                  className="flex items-center gap-3 rounded-[8px] bg-[var(--craft-foreground-2)] p-3 craft-shadow-minimal"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-background craft-shadow-minimal">
                    <Icon className="size-4 text-foreground/60" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold">{row.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{row.description}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

function EmptyNavigatorState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <InboxIcon className="mb-2 size-7 text-muted-foreground/45" />
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 max-w-[220px] text-xs leading-5 text-muted-foreground">
        {description}
      </div>
    </div>
  )
}

function useIsCompact() {
  const [isCompact, setIsCompact] = React.useState(() =>
    typeof window === "undefined" ? false : window.matchMedia("(max-width: 767px)").matches
  )

  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)")
    const update = () => setIsCompact(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  return isCompact
}

function isSessionView(view: AgentShellView) {
  return SESSION_VIEWS.has(view)
}

function getSessionsForView(view: AgentShellView, sessions: AgentSession[]) {
  switch (view) {
    case "all":
      return sessions.filter((session) => !session.archived)
    case "flagged":
      return sessions.filter((session) => session.flagged && !session.archived)
    case "archived":
      return sessions.filter((session) => session.archived)
    case "todo":
    case "review":
    case "done":
    case "cancelled":
      return sessions.filter((session) => session.workflowState === view && !session.archived)
    case "sources":
    case "skills":
    case "automations":
    case "settings":
      return sessions
  }
}

function getSessionCounts(sessions: AgentSession[]) {
  return {
    todo: sessions.filter((session) => session.workflowState === "todo" && !session.archived)
      .length,
    review: sessions.filter((session) => session.workflowState === "review" && !session.archived)
      .length,
    done: sessions.filter((session) => session.workflowState === "done" && !session.archived)
      .length,
    cancelled: sessions.filter(
      (session) => session.workflowState === "cancelled" && !session.archived
    ).length,
    flagged: sessions.filter((session) => session.flagged && !session.archived).length,
    archived: sessions.filter((session) => session.archived).length,
  }
}

function groupSessionsByDate(sessions: AgentSession[]) {
  const groups = new Map<string, { key: string; label: string; items: AgentSession[] }>()

  for (const session of sessions) {
    const date = new Date(session.updatedAt)
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: formatDateGroupLabel(date),
        items: [],
      })
    }
    groups.get(key)?.items.push(session)
  }

  return Array.from(groups.values()).sort((a, b) => b.items[0].updatedAt - a.items[0].updatedAt)
}

function formatDateGroupLabel(date: Date) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const diffDays = Math.round((today - day) / 86_400_000)

  if (diffDays === 0) return "今天"
  if (diffDays === 1) return "昨天"
  return `${date.getMonth() + 1}月 ${date.getDate()}`
}

function formatTimeAgo(timestamp: number) {
  const diff = Math.max(0, Date.now() - timestamp)
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function getActivityTypeIcon(type: AgentActivity["type"]) {
  switch (type) {
    case "plan":
      return ListTodoIcon
    case "tool":
      return ZapIcon
    case "thinking":
      return BotIcon
    case "intermediate":
      return FileTextIcon
    case "status":
      return CircleIcon
  }
}

function getActivityStatusIcon(status: AgentActivity["status"]) {
  switch (status) {
    case "running":
      return CircleIcon
    case "completed":
      return CheckCircle2Icon
    case "error":
      return XIcon
    case "backgrounded":
      return ClockIcon
    case "pending":
      return CircleIcon
  }
}
