import { CheckIcon, CopyIcon, TerminalIcon } from "lucide-react"
import * as React from "react"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import { isGrepContentOutput, parseAnsi, parseGrepOutput, stripAnsi } from "./ansi-parser"

export type ToolType = "bash" | "grep" | "glob"

export type TerminalOutputProps = {
  command: string
  output: string
  exitCode?: number
  toolType?: ToolType
  description?: string
  className?: string
}

export function TerminalOutput({
  command,
  output,
  exitCode,
  description,
  className,
}: TerminalOutputProps) {
  const [copied, setCopied] = React.useState<"command" | "output" | null>(null)

  const copyToClipboard = React.useCallback(async (text: string, type: "command" | "output") => {
    await navigator.clipboard.writeText(stripAnsi(text))
    setCopied(type)
    window.setTimeout(() => setCopied(null), 2000)
  }, [])

  const parsedOutput = React.useMemo(() => parseAnsi(output), [output])
  const isGrepOutput = React.useMemo(() => isGrepContentOutput(output), [output])
  const grepLines = React.useMemo(
    () => (isGrepOutput ? parseGrepOutput(output) : []),
    [isGrepOutput, output]
  )

  return (
    <div
      className={cn(
        "h-full w-full overflow-auto bg-background px-5 py-4 font-mono text-sm",
        className
      )}
    >
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <TerminalIcon className="size-3" />
            <span>Command</span>
            {description && <span className="truncate">{description}</span>}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={copied === "command" ? "Command copied" : "Copy command"}
            onClick={() => void copyToClipboard(command, "command")}
          >
            {copied === "command" ? <CheckIcon /> : <CopyIcon />}
          </Button>
        </div>
        <div className="overflow-x-auto rounded-md border bg-muted/30 p-3">
          <code className="text-foreground">{command}</code>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <TerminalIcon className="size-3" />
            <span>Output</span>
            {exitCode !== undefined && (
              <span className="rounded-md border px-1.5 py-0.5 text-[10px] tabular-nums">
                exit {exitCode}
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={copied === "output" ? "Output copied" : "Copy output"}
            onClick={() => void copyToClipboard(output, "output")}
          >
            {copied === "output" ? <CheckIcon /> : <CopyIcon />}
          </Button>
        </div>
        <pre className="min-h-48 overflow-auto rounded-md border bg-muted/30 p-3 text-foreground">
          {isGrepOutput && grepLines.length > 0 ? (
            <span className="flex flex-col">
              {grepLines.map((line, index) => (
                <span
                  key={`${line.lineNum}-${index}`}
                  className={cn("flex", line.isMatch && "bg-ring/10")}
                >
                  {line.lineNum && (
                    <span className="w-12 shrink-0 select-none pr-3 text-right text-muted-foreground">
                      {line.lineNum}
                    </span>
                  )}
                  <span className="whitespace-pre-wrap break-words">{line.content}</span>
                </span>
              ))}
            </span>
          ) : parsedOutput.length > 0 ? (
            <span className="whitespace-pre-wrap break-words">
              {parsedOutput.map((span, index) => (
                <span
                  key={`${span.text}-${index}`}
                  style={{
                    color: span.fg,
                    backgroundColor: span.bg,
                    fontWeight: span.bold ? 700 : undefined,
                    padding: span.bg ? "0 2px" : undefined,
                    borderRadius: span.bg ? "2px" : undefined,
                  }}
                >
                  {span.text}
                </span>
              ))}
            </span>
          ) : (
            <span className="text-muted-foreground">(no output)</span>
          )}
        </pre>
      </div>
    </div>
  )
}
