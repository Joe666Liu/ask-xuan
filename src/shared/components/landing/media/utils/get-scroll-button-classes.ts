import { cn } from "@/shared/lib/utils"

/**
 * Generate CSS classes for scroll navigation buttons
 * Handles visibility and interaction states based on scroll capability
 *
 * @param canScroll - Whether scrolling is possible in the direction
 * @returns Combined CSS class string for the scroll button
 */
export const getScrollButtonClasses = (canScroll: boolean): string =>
  cn(
    // Position and layout
    "absolute top-1/2 -translate-y-1/2 z-10",
    "size-11 rounded-full sm:size-10",

    // Visual styling
    "bg-background border border-border shadow-lg",
    "flex items-center justify-center",

    // Interaction states
    "transition-[opacity,background-color,box-shadow,transform] duration-200",
    canScroll
      ? cn(
          "opacity-100",
          "hover:bg-muted hover:scale-110",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )
      : "opacity-0 pointer-events-none"
  )
