import { astro } from "iztro"
import type {
  ChartBirthInput,
  ChartCalculationContext,
  ChartDateTimeParts,
  LunarDateTimeParts,
} from "./input"
import {
  chartGenderLabel,
  formatDate,
  makeChartCalculationContext,
  parseChartBirthInput,
  timeIndexFromHour,
} from "./input"
import { createProviderMeta } from "./provider"
import { calculateTrueSolarCorrection } from "./true-solar-time"
import type {
  ZiweiChartArtifact,
  ZiweiHoroscopeScope,
  ZiweiPalace,
  ZiweiStar,
  ZiweiStarScope,
  ZiweiStarType,
} from "./ziwei"

const IZTRO_VERSION = "2.5.8"
const ZIWEI_STAR_TYPES = [
  "major",
  "soft",
  "tough",
  "flower",
  "helper",
  "lucun",
  "tianma",
  "adjective",
] as const satisfies readonly ZiweiStarType[]
const ZIWEI_STAR_SCOPES = [
  "origin",
  "decadal",
  "yearly",
  "monthly",
  "daily",
  "hourly",
] as const satisfies readonly ZiweiStarScope[]

type IztroAstrolabe = ReturnType<typeof astro.bySolar>
type IztroPalace = IztroAstrolabe["palaces"][number]
type IztroStar = IztroPalace["majorStars"][number]
type IztroHoroscope = ReturnType<IztroAstrolabe["horoscope"]>
type IztroHoroscopeItem = IztroHoroscope["decadal"]

export function calculateZiweiChart(
  rawInput: unknown,
  rawContext: Partial<ChartCalculationContext> = {}
): ZiweiChartArtifact {
  const input = parseChartBirthInput(rawInput)
  const context = makeChartCalculationContext(rawContext)
  const trueSolarCorrection = calculateTrueSolarCorrection(input)
  const astrolabe = makeAstrolabe(input, trueSolarCorrection?.corrected)
  const targetTimeIndex = timeIndexFromHour(context.targetDate.hour)
  const horoscope = astrolabe.horoscope(formatDate(context.targetDate), targetTimeIndex)
  const palaces = astrolabe.palaces.map(mapPalace)
  const currentDecadalPalace = palaces.find((palace) => palace.index === horoscope.decadal.index)

  return {
    artifactVersion: "ziwei.v1",
    input,
    context,
    provider: createProviderMeta(input, {
      name: "iztro",
      version: IZTRO_VERSION,
      swiftFixtureId: context.swiftFixtureId,
    }),
    trueSolarCorrection,
    basicInfo: {
      name: input.name.trim(),
      gender: chartGenderLabel(input.gender),
      birthDate: inputBirthDate(input, trueSolarCorrection?.corrected),
      solarDate: astrolabe.solarDate,
      lunarDate: astrolabe.lunarDate,
      chineseDate: astrolabe.chineseDate,
      timeIndex: timeIndexForInput(input, trueSolarCorrection?.corrected),
      time: astrolabe.time,
      timeRange: astrolabe.timeRange,
      zodiac: astrolabe.zodiac,
      earthlyBranchOfSoulPalace: astrolabe.earthlyBranchOfSoulPalace,
      earthlyBranchOfBodyPalace: astrolabe.earthlyBranchOfBodyPalace,
      soul: astrolabe.soul,
      body: astrolabe.body,
      fiveElementsClass: astrolabe.fiveElementsClass,
    },
    palaces,
    horoscope: {
      targetSolarDate: horoscope.solarDate,
      targetLunarDate: horoscope.lunarDate,
      nominalAge: horoscope.age.nominalAge,
      currentDecadal: mapHoroscopeScope(horoscope.decadal, currentDecadalPalace?.decadal.range),
      currentYearly: mapHoroscopeScope(horoscope.yearly),
      currentAgePalaceIndex: horoscope.age.index,
    },
  }
}

function makeAstrolabe(
  input: ChartBirthInput,
  correctedSolar?: ChartDateTimeParts
): IztroAstrolabe {
  const gender = chartGenderLabel(input.gender)

  if (input.calendarKind === "solar") {
    const solarBirthAt = requireSolarBirthAt(input, correctedSolar)
    return astro.bySolar(
      formatDate(solarBirthAt),
      timeIndexFromHour(solarBirthAt.hour),
      gender,
      true,
      "zh-CN"
    )
  }

  const lunarBirthAt = requireLunarBirthAt(input)
  return astro.byLunar(
    formatDate(lunarBirthAt),
    timeIndexFromHour(lunarBirthAt.hour),
    gender,
    lunarBirthAt.isLeapMonth,
    input.fixLeapMonth,
    "zh-CN"
  )
}

function mapPalace(palace: IztroPalace): ZiweiPalace {
  return {
    id: palace.index,
    index: palace.index,
    name: palace.name,
    isBodyPalace: palace.isBodyPalace,
    isOriginalPalace: palace.isOriginalPalace,
    heavenlyStem: palace.heavenlyStem,
    earthlyBranch: palace.earthlyBranch,
    majorStars: palace.majorStars.map(mapStar),
    minorStars: palace.minorStars.map(mapStar),
    adjectiveStars: palace.adjectiveStars.map(mapStar),
    changsheng12: palace.changsheng12,
    boshi12: palace.boshi12,
    jiangqian12: palace.jiangqian12,
    suiqian12: palace.suiqian12,
    decadal: {
      range: palace.decadal.range,
      heavenlyStem: palace.decadal.heavenlyStem,
      earthlyBranch: palace.decadal.earthlyBranch,
    },
    ages: palace.ages,
  }
}

function mapStar(star: IztroStar): ZiweiStar {
  const type = normalizeStarType(star.type)
  const scope = normalizeStarScope(star.scope)
  const brightness = star.brightness ?? ""
  const mutagen = star.mutagen ?? ""

  return {
    id: [scope, type, star.name, brightness, mutagen].join("-"),
    name: star.name,
    type,
    brightness,
    mutagen,
    scope,
  }
}

function mapHoroscopeScope(
  item: IztroHoroscopeItem,
  ageRange?: [number, number]
): ZiweiHoroscopeScope {
  return {
    index: item.index,
    name: item.name,
    heavenlyStem: item.heavenlyStem,
    earthlyBranch: item.earthlyBranch,
    ageRange,
    palaceNames: item.palaceNames,
    mutagenStars: item.mutagen,
    stars: item.stars?.map((stars) => stars.map(mapStar)) ?? Array.from({ length: 12 }, () => []),
  }
}

function requireSolarBirthAt(
  input: ChartBirthInput,
  correctedSolar?: ChartDateTimeParts
): ChartDateTimeParts {
  if (correctedSolar) {
    return correctedSolar
  }
  if (!input.solarBirthAt) {
    throw new Error("solarBirthAt is required for solar ziwei chart calculation")
  }
  return input.solarBirthAt
}

function requireLunarBirthAt(input: ChartBirthInput): LunarDateTimeParts {
  if (!input.lunarBirthAt) {
    throw new Error("lunarBirthAt is required for lunar ziwei chart calculation")
  }
  return input.lunarBirthAt
}

function timeIndexForInput(input: ChartBirthInput, correctedSolar?: ChartDateTimeParts): number {
  if (input.calendarKind === "solar") {
    return timeIndexFromHour(requireSolarBirthAt(input, correctedSolar).hour)
  }

  return timeIndexFromHour(requireLunarBirthAt(input).hour)
}

function inputBirthDate(input: ChartBirthInput, correctedSolar?: ChartDateTimeParts): string {
  if (input.calendarKind === "solar") {
    return formatDate(requireSolarBirthAt(input, correctedSolar))
  }

  return formatDate(requireLunarBirthAt(input))
}

function normalizeStarType(value: string): ZiweiStarType {
  return isZiweiStarType(value) ? value : "adjective"
}

function normalizeStarScope(value: string): ZiweiStarScope {
  return isZiweiStarScope(value) ? value : "origin"
}

function isZiweiStarType(value: string): value is ZiweiStarType {
  return ZIWEI_STAR_TYPES.some((type) => type === value)
}

function isZiweiStarScope(value: string): value is ZiweiStarScope {
  return ZIWEI_STAR_SCOPES.some((scope) => scope === value)
}
