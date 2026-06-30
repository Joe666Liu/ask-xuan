import { ArrowRight } from "lucide-react"
import type { Variants } from "motion/react"
import { motion, useReducedMotion } from "motion/react"
import { LocalizedLink, type To } from "@/shared/components/locale/localized-link"
import { cn } from "@/shared/lib/utils"
import type { AnnouncementProps } from "@/shared/types/landing"

const transitionVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      bounce: 0.3,
      duration: 1.5,
    },
  },
} satisfies Variants

export const Announcement = ({ title, href, className }: AnnouncementProps) => {
  const isExternal = href.startsWith("http")
  const shouldReduceMotion = useReducedMotion()

  const linkClassName = cn(
    "group mx-auto flex w-fit max-w-full items-center gap-4",
    "min-h-11 min-w-11 rounded-full border p-1 pl-4",
    "bg-white/80 dark:bg-zinc-900/80",
    "hover:bg-background dark:hover:border-t-border",
    "shadow-md shadow-zinc-950/5 dark:shadow-zinc-950",
    "dark:border-t-white/5",
    "transition-colors duration-300",
    "cursor-pointer select-none",
    className
  )

  const content = (
    <>
      <span className="text-sm text-foreground line-clamp-1">{title}</span>
      <span
        className={cn(
          "block h-4 w-0.5 border-l",
          "bg-white dark:bg-zinc-700",
          "dark:border-background"
        )}
      />
      <div
        className={cn(
          "size-6 overflow-hidden rounded-full",
          "bg-background group-hover:bg-muted",
          "duration-500"
        )}
      >
        <div
          className={cn(
            "flex w-12 -translate-x-1/2",
            "duration-500 ease-in-out",
            "group-hover:translate-x-0"
          )}
        >
          <span className="flex size-6">
            <ArrowRight className="m-auto size-3" />
          </span>
          <span className="flex size-6">
            <ArrowRight className="m-auto size-3" />
          </span>
        </div>
      </div>
    </>
  )

  return (
    <motion.div
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
      variants={transitionVariants}
    >
      {isExternal ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          {content}
        </a>
      ) : (
        <LocalizedLink
          to={href as To}
          className={linkClassName}
        >
          {content}
        </LocalizedLink>
      )}
    </motion.div>
  )
}
