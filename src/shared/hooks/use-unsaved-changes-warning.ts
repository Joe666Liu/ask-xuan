import { useBlocker } from "@tanstack/react-router"

const DEFAULT_MESSAGE = "You have unsaved changes. Leave this page?"

export function useUnsavedChangesWarning(hasChanges: boolean, message = DEFAULT_MESSAGE) {
  useBlocker({
    disabled: !hasChanges,
    enableBeforeUnload: hasChanges,
    shouldBlockFn: () => {
      if (typeof window === "undefined") return true

      return !window.confirm(message)
    },
  })
}
