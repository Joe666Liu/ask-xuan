import { ArrowUp } from "lucide-react"
import { useIntlayer } from "react-intlayer"
import { LocalizedLink, type To } from "@/shared/components/locale/localized-link"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

const CURRENT_YEAR = new Date().getFullYear()

export const Footer = () => {
  const { footer } = useIntlayer("landing")

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {footer.sections.map((section, index) => (
            <div key={index}>
              <h3 className="text-sm font-semibold text-foreground">{section.title.value}</h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <LocalizedLink
                      to={link.href.value as To}
                      className={cn(
                        "inline-flex min-h-11 min-w-11 items-center text-sm text-muted-foreground sm:min-h-0 sm:min-w-0",
                        "hover:text-foreground transition-colors"
                      )}
                    >
                      {link.label.value}
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">{footer.companyName}</span>
          </div>

          <p className="text-sm text-muted-foreground">
            © {CURRENT_YEAR} {footer.companyName}. All rights reserved.
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={scrollToTop}
            className="gap-2"
          >
            <ArrowUp className="size-4" />
            {footer.scrollToTop.value}
          </Button>
        </div>
      </div>
    </footer>
  )
}
