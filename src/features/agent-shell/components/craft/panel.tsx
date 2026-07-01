import type * as React from "react"
import { cn } from "@/shared/lib/utils"

export type AgentPanelProps = {
  variant?: "shrink" | "grow"
  width?: number
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function AgentPanel({
  variant = "grow",
  width,
  className,
  style,
  children,
}: AgentPanelProps) {
  return (
    <div
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden",
        variant === "grow" && "flex-1",
        variant === "shrink" && "shrink-0",
        className
      )}
      style={{
        ...(variant === "shrink" && width ? { width } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  )
}
