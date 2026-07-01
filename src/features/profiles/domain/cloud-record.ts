import { Lunar, Solar } from "lunar-javascript"
import { z } from "zod"
import {
  type ChartCalendarKind,
  type ChartDateTimeParts,
  type ChartGender,
  ChartGenderCode,
  chartBirthInputSchema,
  type LunarDateTimeParts,
  type ResolvedBirthPlace,
} from "@/features/charts/domain"
import {
  type BirthProfile,
  type BirthProfileOwnerKind,
  type BirthProfileSource,
  birthProfileOwnerKindSchema,
  birthProfileSchema,
  birthProfileSourceSchema,
  isoTimestampSchema,
  normalizeBirthProfile,
} from "./profile"
import {
  DEFAULT_BIRTH_TIME_ZONE,
  dateTimePartsFromInstant,
  instantFromDateTimeParts,
  normalizeTimeZoneIdentifier,
} from "./time"

const nullableTrimmedStringSchema = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.string().trim().optional()
)
const nullableNumberSchema = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.number().optional()
)
const cloudTimestampSchema = z.preprocess((value) => {
  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === "string") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toISOString()
  }

  return value
}, isoTimestampSchema)

export const birthProfileCloudRecordSchema = z.object({
  user_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  owner_kind: z.string().trim().default("other"),
  display_name: z.string().trim().default(""),
  relation_note: z.string().trim().default(""),
  name: z.string().trim().default(""),
  gender: z.number().int(),
  calendar_kind: z.string().trim().default("solar"),
  solar_birth_at: cloudTimestampSchema,
  lunar_year: z.number().int(),
  lunar_month: z.number().int().min(1).max(12),
  lunar_day: z.number().int().min(1).max(30),
  lunar_hour: z.number().int().min(0).max(23),
  lunar_minute: z.number().int().min(0).max(59),
  lunar_second: z.number().int().min(0).max(59),
  birth_place: z.string().trim().default(""),
  birth_place_label: nullableTrimmedStringSchema,
  birth_place_latitude: nullableNumberSchema,
  birth_place_longitude: nullableNumberSchema,
  birth_place_timezone: nullableTrimmedStringSchema,
  birth_place_source: nullableTrimmedStringSchema,
  birth_place_provider_place_id: nullableTrimmedStringSchema,
  uses_true_solar_time: z.boolean().default(false),
  is_primary: z.boolean().default(false),
  source: z.string().trim().default("manual"),
  created_at: cloudTimestampSchema,
  updated_at: cloudTimestampSchema,
})
export type BirthProfileCloudRecord = z.infer<typeof birthProfileCloudRecordSchema>

export function parseBirthProfileCloudRecord(input: unknown): BirthProfileCloudRecord {
  return toCanonicalBirthProfileCloudRecord(input)
}

export function toCanonicalBirthProfileCloudRecord(input: unknown): BirthProfileCloudRecord {
  const record = birthProfileCloudRecordSchema.parse(input)

  return {
    user_id: record.user_id,
    profile_id: record.profile_id,
    owner_kind: record.owner_kind,
    display_name: record.display_name,
    relation_note: record.relation_note,
    name: record.name,
    gender: record.gender,
    calendar_kind: record.calendar_kind,
    solar_birth_at: record.solar_birth_at,
    lunar_year: record.lunar_year,
    lunar_month: record.lunar_month,
    lunar_day: record.lunar_day,
    lunar_hour: record.lunar_hour,
    lunar_minute: record.lunar_minute,
    lunar_second: record.lunar_second,
    birth_place: record.birth_place,
    birth_place_label: emptyToUndefined(record.birth_place_label),
    birth_place_latitude: finiteNumberOrUndefined(record.birth_place_latitude),
    birth_place_longitude: finiteNumberOrUndefined(record.birth_place_longitude),
    birth_place_timezone: emptyToUndefined(record.birth_place_timezone),
    birth_place_source: emptyToUndefined(record.birth_place_source),
    birth_place_provider_place_id: emptyToUndefined(record.birth_place_provider_place_id),
    uses_true_solar_time: record.uses_true_solar_time,
    is_primary: record.is_primary,
    source: record.source,
    created_at: record.created_at,
    updated_at: record.updated_at,
  }
}

export function birthProfileFromCloudRecord(input: unknown): BirthProfile {
  const record = toCanonicalBirthProfileCloudRecord(input)
  const birthPlaceTimeZone = normalizeTimeZoneIdentifier(record.birth_place_timezone)
  const solarBirthAt = dateTimePartsFromInstant(record.solar_birth_at, birthPlaceTimeZone)
  const lunarBirthAt = {
    year: record.lunar_year,
    month: record.lunar_month,
    day: record.lunar_day,
    hour: record.lunar_hour,
    minute: record.lunar_minute,
    second: record.lunar_second,
    isLeapMonth: false,
  }
  const inputValue = chartBirthInputSchema.parse({
    name: record.name,
    gender: normalizeGender(record.gender),
    calendarKind: normalizeCalendarKind(record.calendar_kind),
    solarBirthAt,
    lunarBirthAt,
    birthPlace: record.birth_place,
    resolvedBirthPlace: resolvedBirthPlaceFromCloudRecord(record),
    usesTrueSolarTime: record.uses_true_solar_time,
    fixLeapMonth: true,
  })

  return normalizeBirthProfile(
    birthProfileSchema.parse({
      id: record.profile_id,
      ownerKind: normalizeOwnerKind(record.owner_kind),
      displayName: record.display_name,
      relationNote: record.relation_note,
      input: inputValue,
      isPrimary: record.is_primary,
      source: normalizeSource(record.source),
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    })
  )
}

export function birthProfileToCloudRecord(userID: string, input: unknown): BirthProfileCloudRecord {
  const profile = normalizeBirthProfile(input)
  const user_id = z.string().uuid().parse(userID)
  const resolvedBirthPlace = profile.input.resolvedBirthPlace
  const timeZone = normalizeTimeZoneIdentifier(resolvedBirthPlace?.timezoneIdentifier)
  const solarBirthAt = profile.input.solarBirthAt ?? solarBirthAtFromLunar(profile.input)
  const lunarBirthAt = profile.input.lunarBirthAt ?? lunarBirthAtFromSolar(solarBirthAt)

  return toCanonicalBirthProfileCloudRecord({
    user_id,
    profile_id: profile.id,
    owner_kind: profile.ownerKind,
    display_name: profile.displayName,
    relation_note: profile.relationNote,
    name: profile.input.name,
    gender: profile.input.gender,
    calendar_kind: profile.input.calendarKind,
    solar_birth_at: instantFromDateTimeParts(solarBirthAt, timeZone),
    lunar_year: lunarBirthAt.year,
    lunar_month: lunarBirthAt.month,
    lunar_day: lunarBirthAt.day,
    lunar_hour: lunarBirthAt.hour,
    lunar_minute: lunarBirthAt.minute,
    lunar_second: lunarBirthAt.second,
    birth_place: profile.input.birthPlace,
    birth_place_label: resolvedBirthPlace?.label,
    birth_place_latitude: resolvedBirthPlace?.latitude,
    birth_place_longitude: resolvedBirthPlace?.longitude,
    birth_place_timezone: resolvedBirthPlace?.timezoneIdentifier,
    birth_place_source: resolvedBirthPlace?.source,
    birth_place_provider_place_id: resolvedBirthPlace?.providerPlaceID,
    uses_true_solar_time: profile.input.usesTrueSolarTime,
    is_primary: profile.isPrimary,
    source: profile.source,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  })
}

export function birthProfilesFromCloudRecords(inputs: unknown[]): BirthProfile[] {
  return inputs.map((input) => birthProfileFromCloudRecord(input))
}

export function birthProfilesToCloudRecords(
  userID: string,
  profiles: unknown[]
): BirthProfileCloudRecord[] {
  return profiles.map((profile) => birthProfileToCloudRecord(userID, profile))
}

function resolvedBirthPlaceFromCloudRecord(
  record: BirthProfileCloudRecord
): ResolvedBirthPlace | undefined {
  const label = record.birth_place_label?.trim() || record.birth_place.trim()
  const latitude = record.birth_place_latitude
  const longitude = record.birth_place_longitude

  if (
    !label ||
    latitude === undefined ||
    longitude === undefined ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return undefined
  }

  return {
    label,
    latitude,
    longitude,
    timezoneIdentifier: normalizeTimeZoneIdentifier(record.birth_place_timezone),
    source: record.birth_place_source?.trim() || "cloud",
    providerPlaceID: emptyToUndefined(record.birth_place_provider_place_id),
  }
}

function solarBirthAtFromLunar(input: { lunarBirthAt?: LunarDateTimeParts }): ChartDateTimeParts {
  if (!input.lunarBirthAt) {
    throw new Error("solarBirthAt or lunarBirthAt is required for profile cloud mapping")
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

function normalizeOwnerKind(value: string): BirthProfileOwnerKind {
  const result = birthProfileOwnerKindSchema.safeParse(value)
  return result.success ? result.data : "other"
}

function normalizeSource(value: string): BirthProfileSource {
  const result = birthProfileSourceSchema.safeParse(value)
  return result.success ? result.data : "manual"
}

function normalizeGender(value: number): ChartGender {
  return value === ChartGenderCode.female ? ChartGenderCode.female : ChartGenderCode.male
}

function normalizeCalendarKind(value: string): ChartCalendarKind {
  return value === "lunar" ? "lunar" : "solar"
}

function emptyToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function finiteNumberOrUndefined(value: number | undefined): number | undefined {
  return value !== undefined && Number.isFinite(value) ? value : undefined
}

export { DEFAULT_BIRTH_TIME_ZONE }
