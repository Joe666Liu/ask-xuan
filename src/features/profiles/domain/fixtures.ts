import { z } from "zod"
import {
  chartCalculationContextSchema,
  chartDateTimePartsSchema,
  lunarDateTimePartsSchema,
} from "@/features/charts/domain"
import { birthProfileCloudRecordSchema } from "./cloud-record"

export const birthProfileGoldenFixtureSchema = z.object({
  id: z.string().trim().min(1),
  source: z.string().trim().min(1),
  cloudRecord: birthProfileCloudRecordSchema,
  context: chartCalculationContextSchema,
  expected: z.object({
    domain: z.object({
      displayName: z.string(),
      solarBirthAt: chartDateTimePartsSchema,
      lunarBirthAt: lunarDateTimePartsSchema,
    }),
    cache: z.object({
      targetDateBucket: z.string(),
      solarBirthDateSeconds: z.number().int(),
    }),
    bazi: z.object({
      baziText: z.string(),
      startLuckDateText: z.string(),
      firstFortuneCycle: z.object({
        ganZhi: z.string(),
        startYear: z.number().int(),
        endYear: z.number().int(),
      }),
      selectedFlowYear: z.object({
        year: z.number().int(),
        ganZhi: z.string(),
      }),
      selectedFlowMonth: z.object({
        label: z.string(),
        ganZhi: z.string(),
      }),
    }),
    ziwei: z.object({
      basicInfo: z.object({
        earthlyBranchOfSoulPalace: z.string(),
        earthlyBranchOfBodyPalace: z.string(),
        fiveElementsClass: z.string(),
      }),
      lifePalace: z.object({
        index: z.number().int(),
        isBodyPalace: z.boolean(),
        majorStars: z.array(z.string()),
        decadalRange: z.tuple([z.number().int(), z.number().int()]),
      }),
      horoscope: z.object({
        targetSolarDate: z.string(),
        nominalAge: z.number().int(),
        currentDecadalIndex: z.number().int(),
        currentYearlyIndex: z.number().int(),
      }),
    }),
  }),
})
export type BirthProfileGoldenFixture = z.infer<typeof birthProfileGoldenFixtureSchema>

export function parseBirthProfileGoldenFixtures(input: unknown): BirthProfileGoldenFixture[] {
  return z.array(birthProfileGoldenFixtureSchema).parse(input)
}
