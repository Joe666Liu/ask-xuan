import * as React from "react"
import { cn } from "@/shared/lib/utils"

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export type SpinnerProps = {
  className?: string
}

const delays = ["0s", "0.2s", "0.4s", "0.1s", "0.3s", "0.5s", "0.2s", "0.4s", "0.6s"]

export function Spinner({ className }: SpinnerProps) {
  return (
    <output
      className={cn("inline-grid size-[1em] grid-cols-3 grid-rows-3 gap-[0.08em]", className)}
      aria-label="Loading"
    >
      <style>
        {`@keyframes agent-shell-spinner-cube{0%,70%,100%{transform:scale3d(1,1,1)}35%{transform:scale3d(0,0,1)}}`}
      </style>
      {delays.map((delay) => (
        <span
          key={delay}
          className="block bg-current"
          style={{
            animation: "agent-shell-spinner-cube 1.3s infinite ease-in-out",
            animationDelay: delay,
          }}
        />
      ))}
    </output>
  )
}

export type LoadingIndicatorProps = {
  label?: string
  animated?: boolean
  showElapsed?: boolean | number
  className?: string
  spinnerClassName?: string
}

export function LoadingIndicator({
  label,
  animated = true,
  showElapsed = false,
  className,
  spinnerClassName,
}: LoadingIndicatorProps) {
  const [elapsed, setElapsed] = React.useState(0)
  const startTimeRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (!showElapsed) return

    if (typeof showElapsed === "number") {
      startTimeRef.current = showElapsed
    } else if (!startTimeRef.current) {
      startTimeRef.current = Date.now()
    }

    const interval = window.setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Date.now() - startTimeRef.current)
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [showElapsed])

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {animated ? (
        <Spinner className={spinnerClassName} />
      ) : (
        <span className="inline-flex size-[1em] items-center justify-center">.</span>
      )}
      {label && <span className="text-muted-foreground">{label}</span>}
      {showElapsed && elapsed >= 1000 && (
        <span className="tabular-nums text-muted-foreground/70">({formatDuration(elapsed)})</span>
      )}
    </span>
  )
}
