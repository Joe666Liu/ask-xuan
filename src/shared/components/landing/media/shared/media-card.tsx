import { Image } from "@unpic/react"
import { ExternalLink } from "lucide-react"
import { LocalizedLink, type To } from "@/shared/components/locale/localized-link"
import { cn } from "@/shared/lib/utils"
import type { MediaCardProps } from "@/shared/types/landing"

/**
 * Media Coverage Card Component
 * Based on showcase framework, customized for media coverage
 * Supports accessibility and external links
 */
export const MediaCard = ({ item, index }: MediaCardProps) => {
  const cardContent = (
    <div className={cn("shrink-0 w-80 h-full", item.href && "group cursor-pointer")}>
      <article
        className={cn(
          "h-full flex flex-col",
          "bg-card rounded-xl border border-border overflow-hidden",
          "transition-[box-shadow,transform,border-color] duration-300",
          item.href && "hover:shadow-lg hover:-translate-y-1",
          "focus-within:ring-2 focus-within:ring-primary/20",
          "focus-within:ring-offset-2"
        )}
        aria-labelledby={`media-title-${index}`}
        aria-describedby={`media-desc-${index}`}
      >
        <div className={cn("aspect-4/3 relative overflow-hidden", "bg-muted p-1 rounded-t-lg")}>
          <Image
            src={item.imagePath}
            alt={`Cover image for article: ${item.title}`}
            layout="fullWidth"
            className={cn(
              "object-cover",
              item.href && "transition-transform duration-300 group-hover:scale-105"
            )}
          />
        </div>

        <div className="p-4 space-y-3 flex-1 flex flex-col">
          <div className={cn("flex items-center justify-between text-xs", "text-muted-foreground")}>
            <span className="font-medium">{item.source}</span>
            <time
              dateTime={item.date}
              className="font-medium"
            >
              {item.date}
            </time>
          </div>

          <h3
            id={`media-title-${index}`}
            className={cn(
              "font-semibold text-lg leading-tight line-clamp-2",
              item.href && "group-hover:text-primary transition-colors"
            )}
          >
            {item.title}
            {item.external && (
              <ExternalLink
                className="ml-1 inline-block size-4"
                aria-hidden="true"
              />
            )}
          </h3>

          <p
            id={`media-desc-${index}`}
            className={cn("text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-1")}
          >
            {item.description}
          </p>
        </div>
      </article>
    </div>
  )

  if (!item.href) {
    return <li key={`media-${index}`}>{cardContent}</li>
  }

  const linkClassName = cn(
    "focus:outline-none focus:ring-2 focus:ring-primary",
    "focus:ring-offset-2 rounded-xl"
  )

  if (item.external) {
    return (
      <li key={`media-${index}`}>
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
          aria-label={`Read article: ${item.title} (opens in new tab)`}
        >
          {cardContent}
        </a>
      </li>
    )
  }

  return (
    <li key={`media-${index}`}>
      <LocalizedLink
        to={item.href as To}
        className={linkClassName}
        aria-label={`Read article: ${item.title}`}
      >
        {cardContent}
      </LocalizedLink>
    </li>
  )
}
