import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { parseChartGoldenFixtures } from "./fixtures"
import { calculateZiweiChart } from "./ziwei-iztro-provider"

const fixtures = parseChartGoldenFixtures(
  JSON.parse(
    readFileSync(new URL("./__fixtures__/swift-golden-cases.json", import.meta.url), "utf8")
  )
)

function firstFixture() {
  const [fixture] = fixtures
  if (!fixture) {
    throw new Error("Expected at least one chart golden fixture")
  }
  return fixture
}

describe("calculateZiweiChart", () => {
  it("maps iztro output into the Swift-aligned ziwei artifact", () => {
    const fixture = firstFixture()
    const chart = calculateZiweiChart(fixture.input, fixture.context)
    const expected = fixture.expected.ziwei
    const lifePalace = chart.palaces.find((palace) => palace.name === "命宫")

    expect(chart.artifactVersion).toBe("ziwei.v1")
    expect(chart.provider).toMatchObject({
      name: "iztro",
      version: "2.5.8",
      parityStatus: "swift-fixture-matched",
      swiftFixtureId: fixture.id,
    })
    expect(chart.basicInfo).toMatchObject(expected.basicInfo)
    expect(chart.palaces.map((palace) => palace.name)).toEqual(expected.palaceNames)
    expect(lifePalace).toMatchObject({
      index: expected.lifePalace.index,
      isBodyPalace: expected.lifePalace.isBodyPalace,
      heavenlyStem: expected.lifePalace.heavenlyStem,
      earthlyBranch: expected.lifePalace.earthlyBranch,
      decadal: {
        range: expected.lifePalace.decadalRange,
      },
    })
    expect(lifePalace?.majorStars.map((star) => star.name)).toEqual(expected.lifePalace.majorStars)
    expect(chart.horoscope.targetSolarDate).toBe(expected.horoscope.targetSolarDate)
    expect(chart.horoscope.targetLunarDate).toBe(expected.horoscope.targetLunarDate)
    expect(chart.horoscope.nominalAge).toBe(expected.horoscope.nominalAge)
    expect(chart.horoscope.currentDecadal).toMatchObject(expected.horoscope.currentDecadal)
    expect(chart.horoscope.currentYearly).toMatchObject(expected.horoscope.currentYearly)
  })

  it("uses the true-solar corrected hour for solar charts", () => {
    const chart = calculateZiweiChart(
      {
        gender: 1,
        calendarKind: "solar",
        solarBirthAt: {
          year: 1996,
          month: 8,
          day: 2,
          hour: 21,
          minute: 35,
          second: 0,
        },
        usesTrueSolarTime: true,
        resolvedBirthPlace: {
          label: "江西省上饶市广信区",
          latitude: 28.4486,
          longitude: 117.909,
          timezoneIdentifier: "Asia/Shanghai",
          source: "test",
        },
      },
      {
        targetDate: {
          year: 2026,
          month: 5,
          day: 23,
          hour: 0,
          minute: 0,
          second: 0,
        },
      }
    )

    expect(chart.trueSolarCorrection?.corrected).toMatchObject({
      hour: 21,
      minute: 20,
      second: 14,
    })
    expect(chart.basicInfo.timeIndex).toBe(11)
  })
})
