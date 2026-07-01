import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { calculateBaziChart } from "./bazi-lunar-provider"
import { parseChartGoldenFixtures } from "./fixtures"

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

describe("calculateBaziChart", () => {
  it("maps lunar-javascript output into the Swift-aligned bazi artifact", () => {
    const fixture = firstFixture()
    const chart = calculateBaziChart(fixture.input, fixture.context)
    const expected = fixture.expected.bazi

    expect(chart.artifactVersion).toBe("bazi.v1")
    expect(chart.provider).toMatchObject({
      name: "lunar-javascript",
      version: "1.7.7",
      parityStatus: "swift-fixture-matched",
      swiftFixtureId: fixture.id,
    })
    expect(chart.profile.baziText).toBe(expected.baziText)
    expect(chart.startLuckDateText).toBe(expected.startLuckDateText)
    expect(
      chart.pillars.map(({ id, ganZhi, mainStar, hiddenStems, void: voidText, naYin }) => ({
        id,
        ganZhi,
        mainStar,
        hiddenStems,
        void: voidText,
        naYin,
      }))
    ).toEqual(expected.pillars)

    expect(chart.fortuneCycles[0]).toMatchObject(expected.firstFortuneCycle)
    expect(chart.selectedCycle).toMatchObject(expected.selectedCycle)
    expect(chart.selectedFlowYear).toMatchObject(expected.selectedFlowYear)
    expect(chart.selectedFlowMonth).toMatchObject(expected.selectedFlowMonth)
  })

  it("rejects lunar dates that the provider cannot round-trip", () => {
    expect(() =>
      calculateBaziChart({
        gender: 1,
        calendarKind: "lunar",
        lunarBirthAt: {
          year: 2021,
          month: 4,
          day: 30,
          hour: 0,
          minute: 0,
          second: 0,
        },
      })
    ).toThrow(/Invalid lunar date/)
  })
})
