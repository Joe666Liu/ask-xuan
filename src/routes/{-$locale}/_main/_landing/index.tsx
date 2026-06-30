import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"
import { useIntlayer } from "react-intlayer"
import { siteConfig } from "@/config/site-config"
import { ThreeBenefits } from "@/shared/components/landing/benefits"
import { Cta } from "@/shared/components/landing/cta"
import { Faq } from "@/shared/components/landing/faq"
import { Features } from "@/shared/components/landing/features"
import { Hero } from "@/shared/components/landing/hero"
import { Introduction } from "@/shared/components/landing/introduction"
import { MediaCoverage } from "@/shared/components/landing/media"
import PowerBy from "@/shared/components/landing/powerby"
import { Pricing } from "@/shared/components/landing/pricing"
import { HorizontalShowcase } from "@/shared/components/landing/showcase"
import { Testimonials } from "@/shared/components/landing/testimonials"

export const Route = createFileRoute("/{-$locale}/_main/_landing/")({
  component: RouteComponent,
  ssr: true,
  head: () => ({
    meta: [
      {
        title: `${siteConfig.title} | AI SaaS Starter`,
      },
    ],
  }),
})

function resetWindowScrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" })
}

function useResetHomeScrollOnEntry() {
  useEffect(() => {
    if (window.location.hash && window.location.hash !== "#") {
      return
    }

    resetWindowScrollToTop()

    const firstFrame = window.requestAnimationFrame(resetWindowScrollToTop)
    let nestedFrame: number | undefined
    const secondFrame = window.requestAnimationFrame(() => {
      nestedFrame = window.requestAnimationFrame(resetWindowScrollToTop)
    })
    const shortTimer = window.setTimeout(resetWindowScrollToTop, 150)
    const layoutTimer = window.setTimeout(resetWindowScrollToTop, 600)

    return () => {
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
      if (nestedFrame) {
        window.cancelAnimationFrame(nestedFrame)
      }
      window.clearTimeout(shortTimer)
      window.clearTimeout(layoutTimer)
    }
  }, [])
}

function RouteComponent() {
  const landing = useIntlayer("landing")
  useResetHomeScrollOnEntry()

  return (
    <div>
      <Hero />
      {landing.powerBy.display && <PowerBy />}
      {landing.threeBenefits.display && <ThreeBenefits />}
      {landing.introduction.display && <Introduction />}
      {landing.features.display && <Features />}
      {landing.pricing.display && <Pricing />}
      {landing.horizontalShowcase.display && <HorizontalShowcase />}
      {landing.userTestimonials.display && <Testimonials />}
      {landing.mediaCoverage.display && <MediaCoverage />}
      {landing.faq.display && <Faq />}
      {landing.cta.display && <Cta />}
    </div>
  )
}
