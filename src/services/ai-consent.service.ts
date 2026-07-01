import { z } from "zod"
import {
  type AIConsentCloudRecord,
  type AIConsentOverview,
  type AIConsentUpdateInput,
  aiConsentOverviewFromCloudRecords,
  aiConsentUpdateInputSchema,
  makeAIConsentCloudRecord,
  toCanonicalAIConsentCloudRecord,
} from "@/features/privacy-ai/domain"
import {
  findAIConsentRecordsByUserId,
  upsertAIConsentRecord,
} from "@/shared/model/ai-consent.model"

export class AIConsentService {
  async getOverview(userId: string): Promise<AIConsentOverview> {
    const userID = z.string().uuid().parse(userId)
    const records = await findAIConsentRecordsByUserId(userID)

    return aiConsentOverviewFromCloudRecords(records)
  }

  async updateConsent(userId: string, input: AIConsentUpdateInput): Promise<AIConsentOverview> {
    const userID = z.string().uuid().parse(userId)
    const record = makeAIConsentCloudRecord({
      ...aiConsentUpdateInputSchema.parse(input),
      userID,
    })

    await upsertAIConsentRecord(record)
    return this.getOverview(userID)
  }
}

export function normalizeAIConsentRecordForUser(
  userID: string,
  record: AIConsentCloudRecord
): AIConsentCloudRecord {
  const normalizedUserID = z.string().uuid().parse(userID)
  const canonical = toCanonicalAIConsentCloudRecord(record)

  if (canonical.user_id !== normalizedUserID) {
    throw new Error("AI consent record user_id does not match the current session user")
  }

  return canonical
}
