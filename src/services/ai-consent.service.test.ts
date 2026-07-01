import { describe, expect, it } from "vitest"
import { makeAIConsentCloudRecord } from "@/features/privacy-ai/domain"
import { normalizeAIConsentRecordForUser } from "./ai-consent.service"

const userID = "11111111-1111-4111-8111-111111111111"

describe("AIConsentService normalization", () => {
  it("accepts records that belong to the current session user", () => {
    const record = makeAIConsentCloudRecord({
      userID,
      consentType: "ai_interpretation",
      isGranted: true,
      source: "onboarding",
      now: "2026-06-12T03:04:05.000Z",
    })

    expect(normalizeAIConsentRecordForUser(userID, record)).toEqual(record)
  })

  it("rejects records that do not belong to the current session user", () => {
    const record = makeAIConsentCloudRecord({
      userID,
      consentType: "ai_interpretation",
      isGranted: true,
      source: "onboarding",
      now: "2026-06-12T03:04:05.000Z",
    })

    expect(() =>
      normalizeAIConsentRecordForUser("99999999-9999-4999-8999-999999999999", record)
    ).toThrow(/user_id/)
  })
})
