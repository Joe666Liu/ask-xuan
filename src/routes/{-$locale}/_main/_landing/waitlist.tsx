import { createFileRoute } from "@tanstack/react-router"
import { ArrowRightIcon, CheckIcon, ClockIcon, Loader2Icon, SparklesIcon } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { type FormEvent, useEffect, useId, useRef, useState } from "react"
import { useIntlayer, useLocale } from "react-intlayer"
import { z } from "zod"
import { joinWaitlistFn } from "@/actions/waitlist.action"
import { siteConfig } from "@/config/site-config"
import { GlowingEffect } from "@/shared/components/motion-primitives/glowing-effect"
import { TextEffect } from "@/shared/components/motion-primitives/text-effect"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/utils"

export const Route = createFileRoute("/{-$locale}/_main/_landing/waitlist")({
  component: WaitlistPage,
  head: () => ({
    meta: [
      {
        title: `Waitlist | ${siteConfig.title}`,
      },
    ],
  }),
  staticData: {
    hideHeader: true,
  },
})

const EARLY_BIRD_END_DATE = new Date("2026-02-28T23:59:59")
const waitlistEmailSchema = z.email().trim()

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate))

  useEffect(() => {
    if (targetDate.getTime() <= Date.now()) return

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return timeLeft
}

function calculateTimeLeft(targetDate: Date) {
  const difference = targetDate.getTime() - Date.now()

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <span className="tabular-nums">
      {String(value).padStart(2, "0")}
      {label}
    </span>
  )
}

function WaitlistPage() {
  const content = useIntlayer("waitlist")
  const { locale } = useLocale()
  const shouldReduceMotion = useReducedMotion()
  const emailId = useId()
  const emailErrorId = useId()
  const emailRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const timeLeft = useCountdown(EARLY_BIRD_END_DATE)
  const isOfferExpired =
    timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const parsed = waitlistEmailSchema.safeParse(email)
    if (!parsed.success) {
      setStatus("error")
      setErrorMessage(content.invalidEmail.value)
      emailRef.current?.focus()
      return
    }

    setStatus("loading")

    try {
      await joinWaitlistFn({ data: { email: parsed.data, locale } })
      setStatus("success")
    } catch {
      setStatus("error")
      setErrorMessage(content.submitError.value)
    }
  }

  return (
    <main className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 h-125 w-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-75 w-100 -translate-y-1/2 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.4 }}
          className="text-center"
        >
          <TextEffect
            preset="fade-in-blur"
            speedSegment={0.3}
            as="h1"
            className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            {content.title.value}
          </TextEffect>

          <TextEffect
            preset="fade-in-blur"
            speedSegment={0.3}
            delay={0.2}
            as="p"
            className="mt-4 text-pretty text-muted-foreground"
          >
            {content.description.value}
          </TextEffect>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.5, delay: 0.3 }}
          className="mt-10"
        >
          {status === "success" ? (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <CheckIcon className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{content.success.title.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {content.success.description.value}
                </p>
              </div>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              noValidate
            >
              <div className="relative rounded-xl">
                <GlowingEffect
                  spread={40}
                  glow
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                />
                <div className="relative flex flex-col gap-2 rounded-xl border bg-card p-2">
                  <Label
                    htmlFor={emailId}
                    className="px-1 pt-1"
                  >
                    {content.emailLabel.value}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      ref={emailRef}
                      id={emailId}
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder={content.emailPlaceholder.value}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (status === "error") {
                          setStatus("idle")
                          setErrorMessage("")
                        }
                      }}
                      className={cn(
                        "h-11 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0",
                        status === "error" && "text-destructive"
                      )}
                      disabled={status === "loading"}
                      aria-invalid={status === "error"}
                      aria-describedby={status === "error" ? emailErrorId : undefined}
                    />
                    <Button
                      type="submit"
                      size="lg"
                      disabled={status === "loading"}
                      className="h-11 gap-2"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2Icon className="size-4 animate-spin" />
                          <span>{content.joinButton.value}</span>
                        </>
                      ) : (
                        <>
                          {content.joinButton.value}
                          <ArrowRightIcon className="size-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {status === "error" && (
                <motion.p
                  id={emailErrorId}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  className="text-center text-sm text-destructive"
                  role="alert"
                >
                  {errorMessage}
                </motion.p>
              )}
            </form>
          )}
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.5, delay: 0.5 }}
          className="mt-10 rounded-xl border bg-card/50 p-6"
        >
          <div className="flex items-center justify-center gap-2 text-sm">
            <SparklesIcon className="size-4 text-primary" />
            <span className="font-medium">
              {isOfferExpired
                ? content.earlyBird.expiredTitle.value
                : content.earlyBird.title.value}
            </span>
          </div>

          {isOfferExpired ? (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {content.earlyBird.expiredDescription.value}
            </p>
          ) : (
            <>
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="text-2xl font-bold">$69</span>
                <span className="text-muted-foreground line-through">$89</span>
                <Badge
                  variant="secondary"
                  className="text-xs"
                >
                  {content.earlyBird.save.value}
                </Badge>
              </div>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ClockIcon className="size-3" />
                <span>{content.earlyBird.endsIn.value}</span>
                <div className="flex items-center gap-1">
                  <CountdownUnit
                    value={timeLeft.days}
                    label="d"
                  />
                  <span>:</span>
                  <CountdownUnit
                    value={timeLeft.hours}
                    label="h"
                  />
                  <span>:</span>
                  <CountdownUnit
                    value={timeLeft.minutes}
                    label="m"
                  />
                  <span>:</span>
                  <CountdownUnit
                    value={timeLeft.seconds}
                    label="s"
                  />
                </div>
              </div>
            </>
          )}
        </motion.div>

        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1 }}
          transition={shouldReduceMotion ? undefined : { duration: 0.5, delay: 0.6 }}
          className="mt-4 text-center text-xs text-muted-foreground"
        >
          {content.footer.value}
        </motion.p>
      </div>
    </main>
  )
}
