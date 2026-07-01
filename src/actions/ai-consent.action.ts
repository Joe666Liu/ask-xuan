import { createServerFn } from "@tanstack/react-start"
import {
  type AIConsentOverview,
  aiConsentOverviewFromCloudRecords,
  aiConsentUpdateInputSchema,
} from "@/features/privacy-ai/domain"
import { profileSessionMiddleware } from "@/shared/middleware/auth.middleware"

export const getAIConsentOverview = createServerFn({ method: "GET" })
  .middleware([profileSessionMiddleware])
  .handler(async ({ context }): Promise<AIConsentOverview> => {
    const userId = context.session?.user.id

    if (!userId) {
      return aiConsentOverviewFromCloudRecords([])
    }

    const { AIConsentService } = await import("@/services/ai-consent.service")
    const service = new AIConsentService()

    return service.getOverview(userId)
  })

export const updateAIConsent = createServerFn({ method: "POST" })
  .middleware([profileSessionMiddleware])
  .validator((input: unknown) => aiConsentUpdateInputSchema.parse(input))
  .handler(async ({ context, data }): Promise<AIConsentOverview> => {
    const userId = context.session?.user.id

    if (!userId) {
      throw new Error("Unauthorized")
    }

    const { AIConsentService } = await import("@/services/ai-consent.service")
    const service = new AIConsentService()

    return service.updateConsent(userId, data)
  })
