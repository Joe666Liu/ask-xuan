import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  birthProfileFromCloudRecord,
  birthProfileToCloudRecord,
  parseBirthProfileGoldenFixtures,
  toCanonicalBirthProfileCloudRecord,
} from "."

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

describe("birth profile cloud record mapper", () => {
  it("round-trips Swift BirthProfileCloudRecord JSON through the Web domain profile", () => {
    const fixture = firstFixture()
    const profile = birthProfileFromCloudRecord(fixture.cloudRecord)
    const roundTripRecord = birthProfileToCloudRecord(fixture.cloudRecord.user_id, profile)

    expect(profile).toMatchObject({
      id: fixture.cloudRecord.profile_id,
      displayName: fixture.expected.domain.displayName,
      isPrimary: true,
      input: {
        solarBirthAt: fixture.expected.domain.solarBirthAt,
        lunarBirthAt: fixture.expected.domain.lunarBirthAt,
        resolvedBirthPlace: {
          label: "上海",
          timezoneIdentifier: "Asia/Shanghai",
          source: "apple_mapkit",
        },
      },
    })
    expect(roundTripRecord).toEqual(toCanonicalBirthProfileCloudRecord(fixture.cloudRecord))
  })

  it("does not create resolvedBirthPlace without valid coordinates", () => {
    const fixture = firstFixture()
    const record = toCanonicalBirthProfileCloudRecord({
      ...fixture.cloudRecord,
      birth_place_latitude: null,
      birth_place_longitude: null,
      birth_place_timezone: null,
      birth_place_source: null,
      uses_true_solar_time: undefined,
    })
    const profile = birthProfileFromCloudRecord(record)

    expect(profile.input.resolvedBirthPlace).toBeUndefined()
    expect(record.uses_true_solar_time).toBe(false)
  })

  it("falls back to iOS defaults for unknown cloud enum values", () => {
    const fixture = firstFixture()
    const profile = birthProfileFromCloudRecord({
      ...fixture.cloudRecord,
      owner_kind: "invalid",
      gender: 99,
      calendar_kind: "invalid",
      source: "invalid",
    })

    expect(profile.ownerKind).toBe("other")
    expect(profile.input.gender).toBe(1)
    expect(profile.input.calendarKind).toBe("solar")
    expect(profile.source).toBe("manual")
  })
})
