import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { useIntlayer } from "react-intlayer"
import { cn } from "@/shared/lib/utils"

const BANNER_DISMISSED_STORAGE_KEY = "landing-banner-dismissed-text"

export default function Banner() {
  const { banner } = useIntlayer("landing")
  const bannerText = banner.text.value.trim()
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    try {
      setDismissed(localStorage.getItem(BANNER_DISMISSED_STORAGE_KEY) === bannerText)
    } catch {
      setDismissed(false)
    }
  }, [bannerText])

  if (!bannerText || (mounted && dismissed)) {
    return null
  }

  const href = banner.button.href.value
  const isExternal = href.startsWith("http")

  const handleDismiss = () => {
    setDismissed(true)

    try {
      localStorage.setItem(BANNER_DISMISSED_STORAGE_KEY, bannerText)
    } catch {
      // Keep the in-memory close behavior even when storage is unavailable.
    }
  }

  return (
    <div
      className={cn(
        "relative w-full bg-black text-white py-2 pl-4 pr-12 text-center text-sm min-h-12",
        "flex items-center justify-center"
      )}
    >
      <span className="text-balance">
        {bannerText}{" "}
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="underline transition-[text-decoration-color,color] hover:no-underline"
        >
          {banner.button.text.value}
        </a>
      </span>
      <button
        type="button"
        aria-label="Close announcement"
        className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-white/80 transition-[color,background-color] hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        onClick={handleDismiss}
      >
        <X
          aria-hidden="true"
          className="size-4"
        />
      </button>
    </div>
  )
}
