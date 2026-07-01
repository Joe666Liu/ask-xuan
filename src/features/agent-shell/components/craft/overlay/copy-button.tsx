import { CheckIcon, CopyIcon } from "lucide-react"
import * as React from "react"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

export type CopyButtonProps = {
  content: string
  title?: string
  className?: string
}

export function CopyButton({ content, title = "Copy", className }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = React.useCallback(async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }, [content])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(copied && "text-primary", className)}
      aria-label={copied ? "Copied" : title}
      title={copied ? "Copied" : title}
      onClick={() => void handleCopy()}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}
