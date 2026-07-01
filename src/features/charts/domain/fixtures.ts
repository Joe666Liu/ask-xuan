import { z } from "zod"
import { chartBirthInputSchema, chartCalculationContextSchema } from "./input"

export const chartGoldenFixtureSchema = z.object({
  id: z.string().trim().min(1),
  source: z.string().trim().min(1),
  input: chartBirthInputSchema,
  context: chartCalculationContextSchema,
  expected: z.object({
    bazi: z.object({
      baziText: z.string(),
      startLuckDateText: z.string(),
      firstFortuneCycle: z.object({
        ganZhi: z.string(),
        startYear: z.number().int(),
        endYear: z.number().int(),
        startAge: z.number().int(),
        endAge: z.number().int(),
        void: z.string(),
      }),
      selectedCycle: z.object({
        sourceIndex: z.number().int(),
        ganZhi: z.string(),
      }),
      selectedFlowYear: z.object({
        year: z.number().int(),
        ganZhi: z.string(),
        void: z.string(),
      }),
      selectedFlowMonth: z.object({
        label: z.string(),
        ganZhi: z.string(),
        void: z.string(),
      }),
      pillars: z.array(
        z.object({
          id: z.enum(["year", "month", "day", "time"]),
          ganZhi: z.string(),
          mainStar: z.string(),
          hiddenStems: z.array(z.string()),
          void: z.string(),
          naYin: z.string(),
        })
      ),
    }),
    ziwei: z.object({
      basicInfo: z.object({
        solarDate: z.string(),
        lunarDate: z.string(),
        chineseDate: z.string(),
        timeIndex: z.number().int(),
        time: z.string(),
        timeRange: z.string(),
        zodiac: z.string(),
        earthlyBranchOfSoulPalace: z.string(),
        earthlyBranchOfBodyPalace: z.string(),
        soul: z.string(),
        body: z.string(),
        fiveElementsClass: z.string(),
      }),
      palaceNames: z.array(z.string()),
      lifePalace: z.object({
        index: z.number().int(),
        isBodyPalace: z.boolean(),
        heavenlyStem: z.string(),
        earthlyBranch: z.string(),
        majorStars: z.array(z.string()),
        decadalRange: z.tuple([z.number().int(), z.number().int()]),
      }),
      horoscope: z.object({
        targetSolarDate: z.string(),
        targetLunarDate: z.string(),
        nominalAge: z.number().int(),
        currentDecadal: z.object({
          index: z.number().int(),
          heavenlyStem: z.string(),
          earthlyBranch: z.string(),
          palaceNames: z.array(z.string()),
        }),
        currentYearly: z.object({
          index: z.number().int(),
          heavenlyStem: z.string(),
          earthlyBranch: z.string(),
          palaceNames: z.array(z.string()),
        }),
      }),
    }),
  }),
})

export type ChartGoldenFixture = z.infer<typeof chartGoldenFixtureSchema>

export function parseChartGoldenFixtures(input: unknown): ChartGoldenFixture[] {
  return z.array(chartGoldenFixtureSchema).parse(input)
}
