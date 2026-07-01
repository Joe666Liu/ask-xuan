# Copied From

This feature intentionally ports small UI shell primitives from Craft Agents OSS.

- Source repository: https://github.com/craft-ai-agents/craft-agents-oss
- Local inspection path during implementation:
  `/Users/liuzhuoyi/Documents/learnDemo/craft-agents-oss`
- License: Apache-2.0

Adapted files:

- `apps/electron/src/renderer/components/app-shell/Panel.tsx`
- `apps/electron/src/renderer/components/app-shell/AppShell.tsx`
- `apps/electron/src/renderer/components/app-shell/TopBar.tsx`
- `apps/electron/src/renderer/components/app-shell/PanelHeader.tsx`
- `apps/electron/src/renderer/components/app-shell/PanelStackContainer.tsx`
- `apps/electron/src/renderer/components/app-shell/CompactPanelTransition.tsx`
- `apps/electron/src/renderer/components/app-shell/LeftSidebar.tsx`
- `apps/electron/src/renderer/components/app-shell/SessionList.tsx`
- `apps/electron/src/renderer/components/app-shell/SessionItem.tsx`
- `apps/electron/src/renderer/components/ui/EntityList.tsx`
- `apps/electron/src/renderer/components/ui/EntityRow.tsx`
- `apps/electron/src/renderer/components/app-shell/input/ChatInputZone.tsx`
- `apps/electron/src/renderer/components/app-shell/input/InputContainer.tsx`
- `packages/ui/src/components/ui/LoadingIndicator.tsx`
- `packages/ui/src/components/terminal/ansi-parser.ts`
- `packages/ui/src/components/terminal/TerminalOutput.tsx`
- `packages/ui/src/components/overlay/CopyButton.tsx`
- `packages/ui/src/components/overlay/FullscreenOverlayBase.tsx`

V1 copies visible shell structure and styling behavior, not Craft runtime state.
Electron APIs, transport, Jotai atoms, context menus, DnD, annotation runtime,
browser panels, and full `TurnCard.tsx` remain out of scope. The thread body and
input are local mock implementations against Ask Xuan's own `AgentActivity`
types so assistant-ui or AG-UI can replace only the center runtime later.
