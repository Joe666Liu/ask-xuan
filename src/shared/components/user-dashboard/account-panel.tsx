import { InfoIcon, LogOutIcon, RefreshCwIcon, SparklesIcon, UserPenIcon } from "lucide-react"
import { useState } from "react"
import { useIntlayer } from "react-intlayer"
import { PricingDialog } from "@/shared/components/landing/pricing/pricing-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { useGlobalContext } from "@/shared/context/global.context"
import { signOut } from "@/shared/lib/auth/auth-client"

export function AccountPanel() {
  const [isPricingOpen, setIsPricingOpen] = useState(false)
  const { userInfo, isLoadingUserInfo } = useGlobalContext()

  const user = userInfo?.user
  if (isLoadingUserInfo) {
    return <AccountPanelSkeleton />
  }

  if (!user) return null

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-14 md:size-16">
          <AvatarImage
            src={user.image ?? undefined}
            alt={user.name ?? "User"}
            cache
          />
          <AvatarFallback className="text-lg md:text-xl bg-amber-400 text-white">
            {initials || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base md:text-lg truncate">{user.name}</div>
          <div className="text-muted-foreground text-sm truncate">{user.email}</div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Edit profile"
          >
            <UserPenIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Sign out"
            className="text-destructive/60 hover:text-destructive"
            onClick={() => signOut({ fetchOptions: { onSuccess: () => window.location.reload() } })}
          >
            <LogOutIcon className="size-4" />
          </Button>
        </div>
      </div>

      <PlanDetail onUpgradeClick={() => setIsPricingOpen(true)} />

      <PricingDialog
        open={isPricingOpen}
        onOpenChange={setIsPricingOpen}
      />
    </div>
  )
}

function AccountPanelSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-full md:size-16" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="size-9 rounded-md" />
        <Skeleton className="size-9 rounded-md" />
      </div>
      <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
        <Skeleton className="h-px w-full" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  )
}

function PlanDetail({ onUpgradeClick }: { onUpgradeClick: () => void }) {
  const [isCanceling, setIsCanceling] = useState(false)
  const { userInfo, config, credits, refreshUserInfo } = useGlobalContext()
  const { billing: bt, credits: ct } = useIntlayer("user-dashboard")

  const subscription = userInfo?.payment?.activeSubscription
  const plan = userInfo?.payment?.activePlan
  const planName = plan?.name ?? plan?.id ?? "Free"

  const creditEnabled = config?.public_credit_enable
  const dailyEnabled = config?.public_credit_daily_enabled
  const dailyAmount = config?.public_credit_daily_amount ?? 0
  const userCredits = credits?.userCredits ?? 0
  const dailyBonusCredits = credits?.dailyBonusCredits ?? 0
  const nextRefreshTime = credits?.nextRefreshTime
  const totalCredits = userCredits + dailyBonusCredits

  const isScheduledCancel = subscription?.cancelAtPeriodEnd
  const canCancel = subscription && !isScheduledCancel && subscription.status !== "canceled"
  const periodEnd = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null

  const formatDate = (date: Date) =>
    date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })

  const formatNextRefreshTime = (isoString: string | null | undefined): string => {
    if (!isoString) return ""
    const date = new Date(isoString)
    if (date <= new Date()) return ""
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleCancel = async () => {
    if (!subscription) return
    setIsCanceling(true)
    try {
      const res = await fetch("/api/payment/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      })
      if (res.ok) {
        await refreshUserInfo()
      }
    } finally {
      setIsCanceling(false)
    }
  }

  const formattedRefreshTime = formatNextRefreshTime(nextRefreshTime)

  return (
    <div className="rounded-lg bg-muted/50 p-4 space-y-4 border">
      <div className="flex items-center justify-between">
        <span className="font-medium capitalize">{planName}</span>
        <Button
          size="sm"
          onClick={onUpgradeClick}
        >
          {ct.upgrade.value}
        </Button>
      </div>

      {isScheduledCancel && periodEnd && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <InfoIcon className="size-3.5 shrink-0" />
          <span>{bt.scheduledCancel.value.replace("{date}", formatDate(periodEnd))}</span>
        </div>
      )}

      {creditEnabled && (
        <>
          <Separator className="border-dashed" />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <SparklesIcon className="size-4" />
                <span>{ct.totalCredits.value}</span>
              </div>
              <span className="font-medium tabular-nums">{totalCredits}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground text-sm">
              <span className="pl-6">{ct.purchasedCredits.value}</span>
              <span className="tabular-nums">{userCredits}</span>
            </div>
          </div>

          {dailyEnabled && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <RefreshCwIcon className="size-4" />
                  <span>{ct.dailyBonus.value}</span>
                </div>
                <span className="font-medium tabular-nums">{dailyBonusCredits}</span>
              </div>
              <div className="text-muted-foreground text-xs space-y-0.5">
                <div>{ct.dailyAmount.value.replace("{amount}", String(dailyAmount))}</div>
                {formattedRefreshTime && (
                  <div>{ct.dailyRefreshAt.value.replace("{time}", formattedRefreshTime)}</div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {canCancel && (
        <>
          <Separator className="border-dashed" />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="inline-flex min-h-11 items-center text-xs text-muted-foreground transition-colors hover:text-destructive sm:min-h-6"
              >
                {bt.cancelSubscription.value}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{bt.cancelConfirmTitle.value}</AlertDialogTitle>
                <AlertDialogDescription className="text-pretty">
                  {bt.cancelConfirmDesc.value}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{bt.cancelConfirmCancel.value}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  disabled={isCanceling}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isCanceling ? bt.canceling.value : bt.cancelConfirmAction.value}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
}

export function CreditDetail({
  onUpgradeClick,
}: {
  planName?: string
  onUpgradeClick: () => void
}) {
  return <PlanDetail onUpgradeClick={onUpgradeClick} />
}
