import { describe, expect, it } from "vitest"
import { parseChartBirthInput, timeIndexFromHour } from "./input"
import { calculateTrueSolarCorrection } from "./true-solar-time"

describe("chart birth input", () => {
  it("applies Swift-aligned defaults for optional fields", () => {
    const input = parseChartBirthInput({
      gender: 1,
      calendarKind: "solar",
      solarBirthAt: {
        year: 1990,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
      },
    })

    expect(input.name).toBe("")
    expect(input.gender).toBe(1)
    expect(input.birthPlace).toBe("")
    expect(input.usesTrueSolarTime).toBe(false)
    expect(input.fixLeapMonth).toBe(true)
  })

  it("rejects unsupported gender and missing calendar-specific dates", () => {
    expect(() =>
      parseChartBirthInput({
        gender: 2,
        calendarKind: "solar",
        solarBirthAt: {
          year: 1990,
          month: 1,
          day: 1,
        },
      })
    ).toThrow()

    expect(() =>
      parseChartBirthInput({
        gender: 1,
        calendarKind: "lunar",
      })
    ).toThrow()
  })

  it("uses the same hour to timeIndex mapping as the Swift Ziwei input", () => {
    expect(timeIndexFromHour(0)).toBe(0)
    expect(timeIndexFromHour(1)).toBe(1)
    expect(timeIndexFromHour(2)).toBe(1)
    expect(timeIndexFromHour(22)).toBe(11)
    expect(timeIndexFromHour(23)).toBe(12)
  })
})

describe("true solar time", () => {
  it("matches the Shangrao Swift correction reference", () => {
    const input = parseChartBirthInput({
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
    })
    const correction = calculateTrueSolarCorrection(input)

    expect(correction?.corrected).toEqual({
      year: 1996,
      month: 8,
      day: 2,
      hour: 21,
      minute: 20,
      second: 14,
    })
    expect(correction?.longitudeCorrectionMinutes).toBeCloseTo(-8.364, 3)
    expect(correction?.equationOfTimeMinutes).toBeCloseTo(-6.409, 3)
    expect(correction?.totalCorrectionMinutes).toBeCloseTo(-14.773, 3)
    expect(correction?.standardMeridian).toBe(120)
    expect(correction?.mayAffectHourBranch).toBe(false)
  })
})
