import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  AI_CONSENT_CURRENT_VERSION,
  aiConsentOverviewFromCloudRecords,
  aiConsentSnapshotFromCloudRecord,
  makeAIConsentCloudRecord,
  parseAIConsentGoldenFixtures,
  toCanonicalAIConsentCloudRecord,
} from "."

const fixtures = parseAIConsentGoldenFixtures(
  JSON.parse(
    readFileSync(new URL("./__fixtures__/ai-consent-golden-cases.json", import.meta.url), "utf8")
  )
)

describe("AI consent domain", () => {
  it("keeps the iOS current consent version fixed", () => {
    expect(AI_CONSENT_CURRENT_VERSION).toBe("2026-06-ai-v1")
  })

  it("round-trips Swift user_consents JSON into the current snapshot shape", () => {
    for (const fixture of fixtures) {
      const record = toCanonicalAIConsentCloudRecord(fixture.cloudRecord)
      const snapshot = aiConsentSnapshotFromCloudRecord(record)

      expect(snapshot).toEqual(fixture.expected.snapshot)
    }
  })

  it("requires a fresh grant when the stored consent version is old", () => {
    const overview = aiConsentOverviewFromCloudRecords(
      fixtures.map((fixture) => fixture.cloudRecord)
    )

    expect(overview.ai_interpretation.isGranted).toBe(true)
    expect(overview.china_model_provider.isGranted).toBe(false)
  })

  it("creates iOS-compatible grant and revoke payloads", () => {
    const userID = "11111111-1111-4111-8111-111111111111"
    const now = "2026-06-12T03:04:05.000Z"
    const granted = makeAIConsentCloudRecord({
      userID,
      consentType: "ai_interpretation",
      isGranted: true,
      source: "chat",
      locale: "zh-Hans",
      region: "CN",
      now,
    })
    const revoked = makeAIConsentCloudRecord({
      userID,
      consentType: "ai_interpretation",
      isGranted: false,
      source: "settings",
      now,
    })

    expect(granted).toMatchObject({
      user_id: userID,
      consent_version: "2026-06-ai-v1",
      is_granted: true,
      granted_at: now,
      revoked_at: undefined,
    })
    expect(revoked).toMatchObject({
      user_id: userID,
      consent_version: "2026-06-ai-v1",
      is_granted: false,
      granted_at: undefined,
      revoked_at: now,
    })
  })

  it("defaults missing consent records to not granted", () => {
    const overview = aiConsentOverviewFromCloudRecords([])

    expect(overview.version).toBe("2026-06-ai-v1")
    expect(overview.ai_interpretation.isGranted).toBe(false)
    expect(overview.china_model_provider.isGranted).toBe(false)
  })
})
