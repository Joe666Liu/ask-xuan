import { z } from "zod"

export const chartCalendarKindSchema = z.enum(["solar", "lunar"])
export type ChartCalendarKind = z.infer<typeof chartCalendarKindSchema>

export const chartGenderSchema = z.union([z.literal(0), z.literal(1)])
export type ChartGender = z.infer<typeof chartGenderSchema>

export const ChartGenderCode = {
  female: 0,
  male: 1,
} as const satisfies Record<string, ChartGender>

export const chartDateTimePartsSchema = z.object({
  year: z.number().int().min(1).max(9999),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(23).default(0),
  minute: z.number().int().min(0).max(59).default(0),
  second: z.number().int().min(0).max(59).default(0),
})
export type ChartDateTimeParts = z.infer<typeof chartDateTimePartsSchema>

export const lunarDateTimePartsSchema = chartDateTimePartsSchema.extend({
  day: z.number().int().min(1).max(30),
  isLeapMonth: z.boolean().default(false),
})
export type LunarDateTimeParts = z.infer<typeof lunarDateTimePartsSchema>

export const resolvedBirthPlaceSchema = z.object({
  label: z.string().trim().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezoneIdentifier: z.string().trim().min(1),
  source: z.string().trim().min(1),
  providerPlaceID: z.string().trim().min(1).optional(),
})
export type ResolvedBirthPlace = z.infer<typeof resolvedBirthPlaceSchema>

export const chartBirthInputSchema = z
  .object({
    name: z.string().trim().default(""),
    gender: chartGenderSchema.default(ChartGenderCode.male),
    calendarKind: chartCalendarKindSchema.default("solar"),
    solarBirthAt: chartDateTimePartsSchema.optional(),
    lunarBirthAt: lunarDateTimePartsSchema.optional(),
    birthPlace: z.string().trim().default(""),
    resolvedBirthPlace: resolvedBirthPlaceSchema.optional(),
    usesTrueSolarTime: z.boolean().default(false),
    fixLeapMonth: z.boolean().default(true),
  })
  .superRefine((input, context) => {
    if (input.calendarKind === "solar" && !input.solarBirthAt) {
      context.addIssue({
        code: "custom",
        path: ["solarBirthAt"],
        message: "solarBirthAt is required when calendarKind is solar",
      })
    }

    if (input.calendarKind === "lunar" && !input.lunarBirthAt) {
      context.addIssue({
        code: "custom",
        path: ["lunarBirthAt"],
        message: "lunarBirthAt is required when calendarKind is lunar",
      })
    }
  })
export type ChartBirthInput = z.infer<typeof chartBirthInputSchema>

export const chartCalculationContextSchema = z.object({
  targetDate: chartDateTimePartsSchema,
  selectedCycleSourceIndex: z.number().int().nonnegative().optional(),
  selectedFlowYearIndex: z.number().int().nonnegative().optional(),
  selectedFlowMonthIndex: z.number().int().min(0).max(11).optional(),
  defaultsToCurrentPeriods: z.boolean().default(false),
  swiftFixtureId: z.string().trim().min(1).optional(),
})
export type ChartCalculationContext = z.infer<typeof chartCalculationContextSchema>

export function parseChartBirthInput(input: unknown): ChartBirthInput {
  return chartBirthInputSchema.parse(input)
}

export function parseChartCalculationContext(input: unknown): ChartCalculationContext {
  return chartCalculationContextSchema.parse(input)
}

export function makeChartCalculationContext(
  input: Partial<ChartCalculationContext> = {}
): ChartCalculationContext {
  const now = new Date()

  return chartCalculationContextSchema.parse({
    targetDate: {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
    },
    ...input,
  })
}

export function chartGenderLabel(gender: ChartGender): "男" | "女" {
  return gender === ChartGenderCode.male ? "男" : "女"
}

export function chartGenderDayMasterLabel(gender: ChartGender): "元男" | "元女" {
  return gender === ChartGenderCode.male ? "元男" : "元女"
}

export function formatDate(parts: Pick<ChartDateTimeParts, "year" | "month" | "day">): string {
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function formatDateTime(parts: ChartDateTimeParts): string {
  return `${formatDate(parts)} ${twoDigits(parts.hour)}:${twoDigits(parts.minute)}:${twoDigits(
    parts.second
  )}`
}

export function timeIndexFromHour(hour: number): number {
  if (hour === 0) {
    return 0
  }
  if (hour === 23) {
    return 12
  }
  return Math.min(Math.max(Math.trunc((hour + 1) / 2), 1), 11)
}

export function twoDigits(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}
