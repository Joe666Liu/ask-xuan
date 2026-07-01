import type { ChartDateTimeParts } from "@/features/charts/domain"

export const DEFAULT_BIRTH_TIME_ZONE = "Asia/Shanghai"

export function normalizeTimeZoneIdentifier(value: string | null | undefined): string {
  const trimmed = value?.trim()

  if (!trimmed) {
    return DEFAULT_BIRTH_TIME_ZONE
  }

  return isValidTimeZoneIdentifier(trimmed) || fixedOffsetSeconds(trimmed) !== undefined
    ? trimmed
    : DEFAULT_BIRTH_TIME_ZONE
}

export function isValidTimeZoneIdentifier(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date(0))
    return true
  } catch {
    return false
  }
}

export function dateTimePartsFromInstant(
  instant: string | Date,
  timeZoneIdentifier = DEFAULT_BIRTH_TIME_ZONE
): ChartDateTimeParts {
  const date = instant instanceof Date ? instant : new Date(instant)

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid timestamp")
  }

  const timeZone = normalizeTimeZoneIdentifier(timeZoneIdentifier)
  const fixedOffset = fixedOffsetSeconds(timeZone)

  if (fixedOffset !== undefined) {
    return dateTimePartsFromUtcMilliseconds(date.getTime() + fixedOffset * 1000)
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
  const parts = formatter.formatToParts(date)

  return {
    year: numberPart(parts, "year"),
    month: numberPart(parts, "month"),
    day: numberPart(parts, "day"),
    hour: numberPart(parts, "hour"),
    minute: numberPart(parts, "minute"),
    second: numberPart(parts, "second"),
  }
}

export function instantFromDateTimeParts(
  parts: ChartDateTimeParts,
  timeZoneIdentifier = DEFAULT_BIRTH_TIME_ZONE
): string {
  const timeZone = normalizeTimeZoneIdentifier(timeZoneIdentifier)
  const wallClockAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  )
  const fixedOffset = fixedOffsetSeconds(timeZone)

  if (fixedOffset !== undefined) {
    return new Date(wallClockAsUtc - fixedOffset * 1000).toISOString()
  }

  let instant = wallClockAsUtc

  for (let index = 0; index < 3; index += 1) {
    const offsetSeconds = timeZoneOffsetSecondsAtInstant(timeZone, instant)
    const nextInstant = wallClockAsUtc - offsetSeconds * 1000

    if (Math.abs(nextInstant - instant) < 1000) {
      instant = nextInstant
      break
    }

    instant = nextInstant
  }

  return new Date(instant).toISOString()
}

export function dateTimePartsToEpochSeconds(
  parts: ChartDateTimeParts,
  timeZoneIdentifier = DEFAULT_BIRTH_TIME_ZONE
): number {
  return Math.trunc(new Date(instantFromDateTimeParts(parts, timeZoneIdentifier)).getTime() / 1000)
}

export function dateBucket(parts: Pick<ChartDateTimeParts, "year" | "month" | "day">): string {
  return `${parts.year}-${twoDigits(parts.month)}-${twoDigits(parts.day)}`
}

function dateTimePartsFromUtcMilliseconds(milliseconds: number): ChartDateTimeParts {
  const date = new Date(milliseconds)

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
  }
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

  const sign = match[1]
  const hourText = match[2]
  const minuteText = match[3] ?? "0"
  const hours = Number(hourText)
  const minutes = Number(minuteText)

  if (hours > 23 || minutes > 59) {
    return undefined
  }

  const multiplier = sign === "-" ? -1 : 1
  return multiplier * (hours * 60 + minutes) * 60
}

function timeZoneOffsetSecondsAtInstant(timeZoneIdentifier: string, milliseconds: number): number {
  const zoned = dateTimePartsFromInstant(new Date(milliseconds), timeZoneIdentifier)
  const zonedAsUtc = Date.UTC(
    zoned.year,
    zoned.month - 1,
    zoned.day,
    zoned.hour,
    zoned.minute,
    zoned.second
  )

  return Math.round((zonedAsUtc - milliseconds) / 1000)
}

function numberPart(parts: Intl.DateTimeFormatPart[], type: string): number {
  const part = parts.find((item) => item.type === type)

  if (!part) {
    throw new Error(`Missing ${type} in formatted date`)
  }

  return Number(part.value)
}

function twoDigits(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}
