import { FileTextIcon, TerminalIcon } from "lucide-react"
import type { AgentArtifact } from "../types"
import { FullscreenOverlayBase } from "./craft/overlay/fullscreen-overlay-base"
import { TerminalOutput } from "./craft/terminal/terminal-output"

type ArtifactOverlayProps = {
  artifact?: AgentArtifact
  onClose: () => void
}

export function ArtifactOverlay({ artifact, onClose }: ArtifactOverlayProps) {
  return (
    <FullscreenOverlayBase
      isOpen={!!artifact}
      onClose={onClose}
      accessibleTitle={artifact ? artifact.title : "Artifact preview"}
      typeBadge={artifact?.type}
      title={artifact?.title}
      subtitle={artifact?.subtitle}
      copyContent={artifact?.content}
    >
      {artifact && <ArtifactPreview artifact={artifact} />}
    </FullscreenOverlayBase>
  )
}

function ArtifactPreview({ artifact }: { artifact: AgentArtifact }) {
  if (artifact.type === "terminal") {
    const [command, ...outputLines] = artifact.content.split("\n")
    return (
      <TerminalOutput
        command={command || "$"}
        output={outputLines.join("\n")}
        exitCode={artifact.status === "error" ? 1 : 0}
        description={artifact.subtitle}
      />
    )
  }

  if (artifact.type === "code" || artifact.type === "diff") {
    return (
      <div className="h-full bg-background p-5">
        <pre className="min-h-full overflow-auto rounded-md border bg-muted/30 p-4 text-sm leading-6">
          <code>{artifact.content}</code>
        </pre>
      </div>
    )
  }

  return (
    <div className="flex min-h-full justify-center bg-background p-5">
      <article className="w-full max-w-3xl rounded-md border bg-background p-5">
        <div className="mb-4 flex items-center gap-2 text-muted-foreground">
          {artifact.type === "preview" ? (
            <TerminalIcon className="size-4" />
          ) : (
            <FileTextIcon className="size-4" />
          )}
          <span className="text-xs uppercase tracking-wide">
            {artifact.language ?? artifact.type}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-7">{artifact.content}</p>
      </article>
    </div>
  )
}
