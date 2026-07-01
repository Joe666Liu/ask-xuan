import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  type BirthProfileCloudRecord,
  parseBirthProfileGoldenFixtures,
  toCanonicalBirthProfileCloudRecord,
} from "@/features/profiles/domain"
import { normalizeCloudRecordsForUser } from "./birth-profile.service"

const fixtures = parseBirthProfileGoldenFixtures(
  JSON.parse(
    readFileSync(
      new URL(
        "../features/profiles/domain/__fixtures__/birth-profile-golden-cases.json",
        import.meta.url
      ),
      "utf8"
    )
  )
)

function firstFixture() {
  const [fixture] = fixtures
  if (!fixture) {
    throw new Error("Expected at least one profile golden fixture")
  }
  return fixture
}

function recordWith(overrides: Partial<BirthProfileCloudRecord>): BirthProfileCloudRecord {
  return toCanonicalBirthProfileCloudRecord({
    ...firstFixture().cloudRecord,
    ...overrides,
  })
}

describe("BirthProfileService normalization", () => {
  it("rejects records that do not belong to the current session user", () => {
    const fixture = firstFixture()

    expect(() =>
      normalizeCloudRecordsForUser("99999999-9999-4999-8999-999999999999", [fixture.cloudRecord])
    ).toThrow(/user_id/)
  })

  it("keeps only the newest incoming primary record before upsert", () => {
    const fixture = firstFixture()
    const olderPrimary = recordWith({
      profile_id: "66666666-6666-4666-8666-666666666666",
      updated_at: "2026-01-02T00:00:00.000Z",
      is_primary: true,
    })
    const newerPrimary = recordWith({
      profile_id: "77777777-7777-4777-8777-777777777777",
      updated_at: "2026-01-05T00:00:00.000Z",
      is_primary: true,
    })
    const normalized = normalizeCloudRecordsForUser(fixture.cloudRecord.user_id, [
      olderPrimary,
      newerPrimary,
    ])
    const primaryRecords = normalized.filter((record) => record.is_primary)

    expect(primaryRecords).toHaveLength(1)
    expect(primaryRecords[0]?.profile_id).toBe(newerPrimary.profile_id)
  })
})
