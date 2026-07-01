import type { ChartBirthInput, ChartDateTimeParts } from "./input"
import { timeIndexFromHour } from "./input"

export interface TrueSolarCorrection {
  original: ChartDateTimeParts
  corrected: ChartDateTimeParts
  longitudeCorrectionMinutes: number
  equationOfTimeMinutes: number
  totalCorrectionMinutes: number
  standardMeridian: number
  mayAffectHourBranch: boolean
}

export function correctedSolarBirthAt(input: ChartBirthInput): ChartDateTimeParts | undefined {
  if (input.calendarKind !== "solar") {
    return undefined
  }

  return calculateTrueSolarCorrection(input)?.corrected ?? input.solarBirthAt
}

export function calculateTrueSolarCorrection(
  input: ChartBirthInput
): TrueSolarCorrection | undefined {
  if (
    !input.usesTrueSolarTime ||
    input.calendarKind !== "solar" ||
    !input.solarBirthAt ||
    !input.resolvedBirthPlace
  ) {
    return undefined
  }

  const original = input.solarBirthAt
  const standardMeridian = standardMeridianForTimeZone(
    input.resolvedBirthPlace.timezoneIdentifier,
    original
  )
  const longitudeCorrectionMinutes = 4 * (input.resolvedBirthPlace.longitude - standardMeridian)
  const equationOfTimeMinutes = equationOfTime(original)
  const totalCorrectionMinutes = longitudeCorrectionMinutes + equationOfTimeMinutes
  const corrected = addRoundedSeconds(original, totalCorrectionMinutes * 60)

  return {
    original,
    corrected,
    longitudeCorrectionMinutes,
    equationOfTimeMinutes,
    totalCorrectionMinutes,
    standardMeridian,
    mayAffectHourBranch: timeIndexFromHour(original.hour) !== timeIndexFromHour(corrected.hour),
  }
}

function standardMeridianForTimeZone(
  timezoneIdentifier: string,
  parts: ChartDateTimeParts
): number {
  const offsetSeconds =
    fixedOffsetSeconds(timezoneIdentifier) ?? timeZoneOffsetSeconds(timezoneIdentifier, parts) ?? 0

  return offsetSeconds / 240
}

function fixedOffsetSeconds(raw: string): number | undefined {
  const trimmed = raw.trim()
  if (["Z", "UTC", "Etc/UTC", "GMT"].includes(trimmed)) {
    return 0
  }

  const match = /^([+-])(\d{2})(?::?(\d{2}))?$/.exec(trimmed)
  if (!match) {
    return undefined
  }

  const [, sign, hourText, minuteText = "0"] = match
  const hours = Number(hourText)
  const minutes = Number(minuteText)

  if (hours > 23 || minutes > 59) {
    return undefined
  }

  const multiplier = sign === "-" ? -1 : 1
  return multiplier * (hours * 60 + minutes) * 60
}

function timeZoneOffsetSeconds(
  timezoneIdentifier: string,
  parts: ChartDateTimeParts
): number | undefined {
  try {
    const base = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second
    )
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezoneIdentifier,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
    const dateParts = formatter.formatToParts(new Date(base))
    const value = (type: string) => dateParts.find((part) => part.type === type)?.value
    const zoned = Date.UTC(
      Number(value("year")),
      Number(value("month")) - 1,
      Number(value("day")),
      Number(value("hour")),
      Number(value("minute")),
      Number(value("second"))
    )

    return Math.round((zoned - base) / 1000)
  } catch {
    return undefined
  }
}

function equationOfTime(parts: ChartDateTimeParts): number {
  const day = dayOfYear(parts.year, parts.month, parts.day)
  const decimalHour = parts.hour + parts.minute / 60 + parts.second / 3600
  const gamma = ((2 * Math.PI) / 366) * (day - 1 + (decimalHour - 12) / 24)

  return (
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma))
  )
}

function dayOfYear(year: number, month: number, day: number): number {
  const daysBeforeMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  const monthIndex = Math.min(Math.max(month - 1, 0), daysBeforeMonth.length - 1)
  const leapDay = isLeapYear(year) && month > 2 ? 1 : 0

  return daysBeforeMonth[monthIndex] + day + leapDay
}

function isLeapYear(year: number): boolean {
  if (year % 400 === 0) {
    return true
  }
  if (year % 100 === 0) {
    return false
  }
  return year % 4 === 0
}

function addRoundedSeconds(parts: ChartDateTimeParts, seconds: number): ChartDateTimeParts {
  const base = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  )
  const corrected = new Date(base + Math.round(seconds) * 1000)

  return {
    year: corrected.getUTCFullYear(),
    month: corrected.getUTCMonth() + 1,
    day: corrected.getUTCDate(),
    hour: corrected.getUTCHours(),
    minute: corrected.getUTCMinutes(),
    second: corrected.getUTCSeconds(),
  }
}
