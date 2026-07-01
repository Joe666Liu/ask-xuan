import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"
import { CopyButton } from "./copy-button"

export type FullscreenOverlayBaseProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  accessibleTitle?: string
  typeBadge?: string
  title?: string
  subtitle?: string
  copyContent?: string
  headerActions?: ReactNode
}

export function FullscreenOverlayBase({
  isOpen,
  onClose,
  children,
  className,
  accessibleTitle = "Artifact preview",
  typeBadge,
  title,
  subtitle,
  copyContent,
  headerActions,
}: FullscreenOverlayBaseProps) {
  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col overflow-hidden bg-background outline-none",
            className
          )}
        >
          <DialogPrimitive.Title className="sr-only">{accessibleTitle}</DialogPrimitive.Title>
          <div className="flex min-h-12 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur">
            {typeBadge && (
              <span className="shrink-0 rounded-md border bg-muted/40 px-2 py-1 text-xs font-medium text-muted-foreground">
                {typeBadge}
              </span>
            )}
            <div className="min-w-0 flex-1">
              {title && <div className="truncate text-sm font-medium">{title}</div>}
              {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {headerActions}
              {copyContent && (
                <CopyButton
                  content={copyContent}
                  title="Copy artifact"
                />
              )}
              <DialogPrimitive.Close asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close artifact preview"
                >
                  <XIcon />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
