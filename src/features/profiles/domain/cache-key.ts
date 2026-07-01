import { Lunar, Solar } from "lunar-javascript"
import {
  type ChartBirthInput,
  type ChartDateTimeParts,
  chartBirthInputSchema,
  type LunarDateTimeParts,
} from "@/features/charts/domain"
import { normalizeChartBirthInput } from "./profile"
import { dateBucket, dateTimePartsToEpochSeconds, normalizeTimeZoneIdentifier } from "./time"

export const CHART_CACHE_ENGINE_VERSION = 1

export type ChartCacheKind = "bazi" | "ziwei"

export interface NormalizedChartBirthInput {
  name: string
  gender: number
  calendarKind: "solar" | "lunar"
  solarBirthDateSeconds: number
  lunarYear: number
  lunarMonth: number
  lunarDay: number
  lunarHour: number
  lunarMinute: number
  lunarSecond: number
  lunarIsLeapMonth: boolean
  birthPlace: string
  resolvedBirthPlace?: {
    label: string
    latitude: number
    longitude: number
    timezoneIdentifier: string
    source: string
    providerPlaceID?: string
  }
  usesTrueSolarTime: boolean
  fixLeapMonth: boolean
}

export interface ChartCacheKey {
  kind: ChartCacheKind
  engineVersion: number
  normalizedInput: NormalizedChartBirthInput
  targetYear: number
  targetDateBucket: string
}

export function makeChartCacheKey(params: {
  kind: ChartCacheKind
  input: unknown
  targetDate: ChartDateTimeParts
  engineVersion?: number
}): ChartCacheKey {
  return {
    kind: params.kind,
    engineVersion: params.engineVersion ?? CHART_CACHE_ENGINE_VERSION,
    normalizedInput: normalizeChartBirthInputForCache(params.input),
    targetYear: params.targetDate.year,
    targetDateBucket: dateBucket(params.targetDate),
  }
}

export function serializeChartCacheKey(key: ChartCacheKey): string {
  return stableJson(key)
}

export function normalizeChartBirthInputForCache(input: unknown): NormalizedChartBirthInput {
  const parsed = normalizeChartBirthInput(chartBirthInputSchema.parse(input))
  const solarBirthAt = parsed.solarBirthAt ?? solarBirthAtFromLunar(parsed)
  const lunarBirthAt = parsed.lunarBirthAt ?? lunarBirthAtFromSolar(solarBirthAt)
  const timezoneIdentifier = normalizeTimeZoneIdentifier(
    parsed.resolvedBirthPlace?.timezoneIdentifier
  )
  const resolvedBirthPlace = parsed.resolvedBirthPlace
    ? {
        label: parsed.resolvedBirthPlace.label,
        latitude: parsed.resolvedBirthPlace.latitude,
        longitude: parsed.resolvedBirthPlace.longitude,
        timezoneIdentifier,
        source: parsed.resolvedBirthPlace.source,
        providerPlaceID: parsed.resolvedBirthPlace.providerPlaceID,
      }
    : undefined

  return {
    name: parsed.name,
    gender: parsed.gender,
    calendarKind: parsed.calendarKind,
    solarBirthDateSeconds: dateTimePartsToEpochSeconds(solarBirthAt, timezoneIdentifier),
    lunarYear: lunarBirthAt.year,
    lunarMonth: lunarBirthAt.month,
    lunarDay: lunarBirthAt.day,
    lunarHour: lunarBirthAt.hour,
    lunarMinute: lunarBirthAt.minute,
    lunarSecond: lunarBirthAt.second,
    lunarIsLeapMonth: lunarBirthAt.isLeapMonth,
    birthPlace: parsed.birthPlace,
    resolvedBirthPlace,
    usesTrueSolarTime: parsed.usesTrueSolarTime,
    fixLeapMonth: parsed.fixLeapMonth,
  }
}

export function stableJson(value: unknown): string {
  if (value === undefined) {
    return "null"
  }

  if (value === null || typeof value !== "object") {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJson(item)).join(",")}]`
  }

  const entries = Object.entries(value)
    .filter(([, entryValue]) => entryValue !== undefined)
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
  const properties = entries.map(
    ([key, entryValue]) => `${JSON.stringify(key)}:${stableJson(entryValue)}`
  )

  return `{${properties.join(",")}}`
}

function solarBirthAtFromLunar(input: ChartBirthInput): ChartDateTimeParts {
  if (!input.lunarBirthAt) {
    throw new Error("lunarBirthAt is required to build a chart cache key")
  }

  const lunarMonth = input.lunarBirthAt.isLeapMonth
    ? -input.lunarBirthAt.month
    : input.lunarBirthAt.month
  const solar = Lunar.fromYmdHms(
    input.lunarBirthAt.year,
    lunarMonth,
    input.lunarBirthAt.day,
    input.lunarBirthAt.hour,
    input.lunarBirthAt.minute,
    input.lunarBirthAt.second
  ).getSolar()

  return {
    year: solar.getYear(),
    month: solar.getMonth(),
    day: solar.getDay(),
    hour: solar.getHour(),
    minute: solar.getMinute(),
    second: solar.getSecond(),
  }
}

function lunarBirthAtFromSolar(solarBirthAt: ChartDateTimeParts): LunarDateTimeParts {
  const lunar = Solar.fromYmdHms(
    solarBirthAt.year,
    solarBirthAt.month,
    solarBirthAt.day,
    solarBirthAt.hour,
    solarBirthAt.minute,
    solarBirthAt.second
  ).getLunar()
  const lunarMonth = lunar.getMonth()

  return {
    year: lunar.getYear(),
    month: Math.abs(lunarMonth),
    day: lunar.getDay(),
    hour: lunar.getHour(),
    minute: lunar.getMinute(),
    second: lunar.getSecond(),
    isLeapMonth: lunarMonth < 0,
  }
}
