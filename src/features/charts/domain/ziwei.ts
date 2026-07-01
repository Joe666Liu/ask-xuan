import type { ChartBirthInput, ChartCalculationContext } from "./input"
import type { ChartProviderMeta } from "./provider"
import type { TrueSolarCorrection } from "./true-solar-time"

export type ZiweiStarType =
  | "major"
  | "soft"
  | "tough"
  | "flower"
  | "helper"
  | "lucun"
  | "tianma"
  | "adjective"

export type ZiweiStarScope = "origin" | "decadal" | "yearly" | "monthly" | "daily" | "hourly"

export interface ZiweiChart {
  basicInfo: ZiweiBasicInfo
  palaces: ZiweiPalace[]
  horoscope: ZiweiHoroscope
}

export interface ZiweiBasicInfo {
  name: string
  gender: string
  birthDate: string
  solarDate: string
  lunarDate: string
  chineseDate: string
  timeIndex: number
  time: string
  timeRange: string
  zodiac: string
  earthlyBranchOfSoulPalace: string
  earthlyBranchOfBodyPalace: string
  soul: string
  body: string
  fiveElementsClass: string
}

export interface ZiweiPalace {
  id: number
  index: number
  name: string
  isBodyPalace: boolean
  isOriginalPalace: boolean
  heavenlyStem: string
  earthlyBranch: string
  majorStars: ZiweiStar[]
  minorStars: ZiweiStar[]
  adjectiveStars: ZiweiStar[]
  changsheng12: string
  boshi12: string
  jiangqian12: string
  suiqian12: string
  decadal: ZiweiDecadalRange
  ages: number[]
}

export interface ZiweiStar {
  id: string
  name: string
  type: ZiweiStarType
  brightness: string
  mutagen: string
  scope: ZiweiStarScope
}

export interface ZiweiDecadalRange {
  range: [number, number]
  heavenlyStem: string
  earthlyBranch: string
}

export interface ZiweiHoroscope {
  targetSolarDate: string
  targetLunarDate: string
  nominalAge: number
  currentDecadal: ZiweiHoroscopeScope
  currentYearly: ZiweiHoroscopeScope
  currentAgePalaceIndex?: number
}

export interface ZiweiYearOption {
  id: number
  year: number
  nominalAge: number
  scope: ZiweiHoroscopeScope
}

export interface ZiweiHoroscopeScope {
  index: number
  name: string
  heavenlyStem: string
  earthlyBranch: string
  ageRange?: [number, number]
  palaceNames: string[]
  mutagenStars: string[]
  stars: ZiweiStar[][]
}

export interface ZiweiChartArtifact extends ZiweiChart {
  artifactVersion: "ziwei.v1"
  input: ChartBirthInput
  context: ChartCalculationContext
  provider: ChartProviderMeta
  trueSolarCorrection?: TrueSolarCorrection
}
