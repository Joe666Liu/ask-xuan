import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { birthProfileFromCloudRecord, makeChartCacheKey, parseBirthProfileGoldenFixtures } from "."

const fixtures = parseBirthProfileGoldenFixtures(
  JSON.parse(
    readFileSync(new URL("./__fixtures__/birth-profile-golden-cases.json", import.meta.url), "utf8")
  )
)

function firstFixture() {
  const [fixture] = fixtures
  if (!fixture) {
    throw new Error("Expected at least one profile golden fixture")
  }
  return fixture
}

describe("chart cache key", () => {
  it("builds the iOS-style key from normalized birth input and target date bucket", () => {
    const fixture = firstFixture()
    const profile = birthProfileFromCloudRecord(fixture.cloudRecord)
    const key = makeChartCacheKey({
      kind: "bazi",
      input: profile.input,
      targetDate: fixture.context.targetDate,
    })

    expect(key).toMatchObject({
      kind: "bazi",
      engineVersion: 1,
      targetYear: 2026,
      targetDateBucket: fixture.expected.cache.targetDateBucket,
      normalizedInput: {
        name: "案例14",
        solarBirthDateSeconds: fixture.expected.cache.solarBirthDateSeconds,
        lunarYear: 1989,
        lunarMonth: 12,
        lunarDay: 5,
        usesTrueSolarTime: false,
      },
    })
  })
})
