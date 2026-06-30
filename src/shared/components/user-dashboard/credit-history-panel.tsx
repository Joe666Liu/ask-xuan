import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HistoryIcon,
  Loader2Icon,
  RefreshCwIcon,
} from "lucide-react"
import { parseAsInteger, useQueryState } from "nuqs"
import { useCallback, useEffect, useRef, useState } from "react"
import { useIntlayer } from "react-intlayer"
import { PricingDialog } from "@/shared/components/landing/pricing/pricing-dialog"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { useGlobalContext } from "@/shared/context/global.context"
import { http } from "@/shared/lib/tools/http-client"
import { cn } from "@/shared/lib/utils"
import { CreditsType } from "@/shared/types/credit"
import { CreditDetail } from "./account-panel"

interface CreditRecord {
  id: string
  credits: number
  creditsType: string
  transactionType: string
  description: string | null
  expiresAt: string | null
  createdAt: string
}

interface CreditHistoryResponse {
  data: CreditRecord[]
  total: number
  page: number
  limit: number
}

function formatDate(dateString: string, locale: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function CreditHistoryPanel() {
  const [data, setData] = useState<CreditHistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [rawPage, setPage] = useQueryState(
    "creditsPage",
    parseAsInteger
      .withOptions({ history: "push", shallow: true, clearOnDefault: true })
      .withDefault(1)
  )
  const [isPricingOpen, setIsPricingOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const isPulling = useRef(false)
  const { userInfo } = useGlobalContext()
  const { history: t, creditTypes } = useIntlayer("user-dashboard")
  const locale = typeof window !== "undefined" ? document.documentElement.lang : "en"
  const planName = userInfo?.payment?.activePlan?.id ?? "free"
  const limit = 10
  const pullThreshold = 60
  const page = Math.max(1, rawPage)

  const creditTypeLabels: Record<string, string> = {
    [CreditsType.ADD_FIRST_REGISTRATION]: creditTypes.add_first_registration.value,
    [CreditsType.ADD_SUBSCRIPTION_PAYMENT]: creditTypes.add_subscription_payment.value,
    [CreditsType.ADD_ONE_TIME_PAYMENT]: creditTypes.add_one_time_payment.value,
    [CreditsType.ADD_DAILY_BONUS]: creditTypes.add_daily_bonus.value,
    [CreditsType.ADD_ADMIN]: creditTypes.add_admin.value,
    [CreditsType.ADD_REFUND]: creditTypes.add_refund.value,
    [CreditsType.DEDUCT_AI_USE]: creditTypes.deduct_ai_use.value,
    [CreditsType.DEDUCT_AI_TEXT]: creditTypes.ai_text.value,
    [CreditsType.DEDUCT_AI_IMAGE]: creditTypes.ai_image.value,
    [CreditsType.DEDUCT_AI_SPEECH]: creditTypes.ai_speech.value,
    [CreditsType.DEDUCT_AI_VIDEO]: creditTypes.ai_video.value,
    [CreditsType.DEDUCT_EXPIRED]: creditTypes.deduct_expired.value,
  }

  const fetchHistory = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      try {
        const result = await http<CreditHistoryResponse>(
          `/api/credit/history?page=${page}&limit=${limit}`,
          { silent: true }
        )
        if (result) {
          setData(result)
        }
      } catch {
        // error handled by http client
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [page]
  )

  useEffect(() => {
    if (rawPage < 1) {
      void setPage(1)
    }
  }, [rawPage, setPage])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollElement = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]")
    if (scrollElement && scrollElement.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      isPulling.current = true
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling.current || refreshing) return
      const currentY = e.touches[0].clientY
      const diff = currentY - startY.current
      if (diff > 0) {
        setPullDistance(Math.min(diff * 0.5, pullThreshold * 1.5))
      }
    },
    [refreshing, pullThreshold]
  )

  const handleTouchEnd = useCallback(() => {
    if (pullDistance >= pullThreshold && !refreshing) {
      fetchHistory(true)
    }
    setPullDistance(0)
    isPulling.current = false
  }, [pullDistance, pullThreshold, refreshing, fetchHistory])

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">{t.title.value}</h2>
          <p className="text-muted-foreground text-sm">{t.description.value}</p>
        </div>
        <CreditDetail
          planName={planName}
          onUpgradeClick={() => setIsPricingOpen(true)}
        />
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data?.data.length ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <HistoryIcon className="size-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">{t.empty.value}</p>
        </div>
      ) : (
        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          <div
            ref={scrollRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative min-h-0 flex-1"
          >
            <div
              className={cn(
                "absolute left-0 right-0 flex items-center justify-center transition-opacity",
                pullDistance > 0 || refreshing ? "opacity-100" : "opacity-0"
              )}
              style={{ top: -40, height: 40 }}
            >
              <RefreshCwIcon
                className={cn(
                  "size-5 text-muted-foreground transition-transform",
                  refreshing && "animate-spin",
                  pullDistance >= pullThreshold && !refreshing && "text-primary"
                )}
                style={{
                  transform: refreshing ? undefined : `rotate(${pullDistance * 2}deg)`,
                }}
              />
            </div>

            <ScrollArea
              className="h-full"
              style={{
                transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
                transition: pullDistance === 0 ? "transform 0.2s ease-out" : undefined,
              }}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.time.value}</TableHead>
                    <TableHead>{t.type.value}</TableHead>
                    <TableHead className="text-right">{t.change.value}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(record.createdAt, locale)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={record.credits > 0 ? "secondary" : "outline"}
                          className="font-normal"
                        >
                          {creditTypeLabels[record.creditsType] || record.creditsType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 font-medium tabular-nums",
                            record.credits > 0 ? "text-emerald-600" : "text-muted-foreground"
                          )}
                        >
                          {record.credits > 0 ? (
                            <ArrowUpIcon className="size-3" />
                          ) : (
                            <ArrowDownIcon className="size-3" />
                          )}
                          {record.credits > 0 ? `+${record.credits}` : record.credits}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {totalPages > 1 && (
            <div className="flex shrink-0 items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {t.totalRecords.value.replace("{count}", String(data.total))}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="sm:size-8"
                  disabled={page <= 1}
                  onClick={() => void setPage(page - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <span className="text-sm tabular-nums">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="sm:size-8"
                  disabled={page >= totalPages}
                  onClick={() => void setPage(page + 1)}
                  aria-label="Next page"
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <PricingDialog
        open={isPricingOpen}
        onOpenChange={setIsPricingOpen}
      />
    </div>
  )
}
