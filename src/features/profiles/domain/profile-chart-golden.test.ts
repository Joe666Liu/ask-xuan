import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { calculateBaziChart, calculateZiweiChart } from "@/features/charts/domain"
import { birthProfileFromCloudRecord, parseBirthProfileGoldenFixtures } from "."

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

describe("profile-driven chart golden calibration", () => {
  it("calculates bazi luck cycles and flow periods from the shared cloud profile input", () => {
    const fixture = firstFixture()
    const profile = birthProfileFromCloudRecord(fixture.cloudRecord)
    const chart = calculateBaziChart(profile.input, fixture.context)

    expect(chart.profile.baziText).toBe(fixture.expected.bazi.baziText)
    expect(chart.startLuckDateText).toBe(fixture.expected.bazi.startLuckDateText)
    expect(chart.fortuneCycles[0]).toMatchObject(fixture.expected.bazi.firstFortuneCycle)
    expect(chart.selectedFlowYear).toMatchObject(fixture.expected.bazi.selectedFlowYear)
    expect(chart.selectedFlowMonth).toMatchObject(fixture.expected.bazi.selectedFlowMonth)
  })

  it("calculates ziwei palace and horoscope scopes from the shared cloud profile input", () => {
    const fixture = firstFixture()
    const profile = birthProfileFromCloudRecord(fixture.cloudRecord)
    const chart = calculateZiweiChart(profile.input, fixture.context)
    const lifePalace = chart.palaces.find((palace) => palace.name === "命宫")

    expect(chart.basicInfo).toMatchObject(fixture.expected.ziwei.basicInfo)
    expect(lifePalace).toMatchObject({
      index: fixture.expected.ziwei.lifePalace.index,
      isBodyPalace: fixture.expected.ziwei.lifePalace.isBodyPalace,
      decadal: {
        range: fixture.expected.ziwei.lifePalace.decadalRange,
      },
    })
    expect(lifePalace?.majorStars.map((star) => star.name)).toEqual(
      fixture.expected.ziwei.lifePalace.majorStars
    )
    expect(chart.horoscope.targetSolarDate).toBe(fixture.expected.ziwei.horoscope.targetSolarDate)
    expect(chart.horoscope.nominalAge).toBe(fixture.expected.ziwei.horoscope.nominalAge)
    expect(chart.horoscope.currentDecadal.index).toBe(
      fixture.expected.ziwei.horoscope.currentDecadalIndex
    )
    expect(chart.horoscope.currentYearly.index).toBe(
      fixture.expected.ziwei.horoscope.currentYearlyIndex
    )
  })
})
