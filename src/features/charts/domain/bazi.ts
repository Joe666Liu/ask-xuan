import type { ChartBirthInput, ChartCalculationContext, ChartGender } from "./input"
import type { ChartProviderMeta } from "./provider"
import type { TrueSolarCorrection } from "./true-solar-time"

export type BaziPillarId = "year" | "month" | "day" | "time"

export interface BaziChartProfile {
  name: string
  gender: ChartGender
  birthPlace: string
  solarYear: number
  solarMonth: number
  solarDay: number
  solarHour: number
  solarMinute: number
  solarText: string
  lunarText: string
  baziText: string
}

export interface BaziPillar {
  id: BaziPillarId
  titleKey: string
  ganZhi: string
  mainStar: string
  heavenlyStem: string
  earthlyBranch: string
  hiddenStems: string[]
  subStars: string[]
  starPhase: string
  selfSeat: string
  void: string
  naYin: string
}

export interface BaziFortuneCycle {
  id: string
  sourceIndex: number
  ganZhi: string
  startYear: number
  endYear: number
  startAge: number
  endAge: number
  mainStar: string
  heavenlyStem: string
  earthlyBranch: string
  subStars: string[]
  hiddenStems: string[]
  starPhase: string
  selfSeat: string
  void: string
  naYin: string
}

export interface BaziFlowYear {
  id: string
  year: number
  age: number
  ganZhi: string
  mainStar: string
  heavenlyStem: string
  earthlyBranch: string
  hiddenStems: string[]
  subStars: string[]
  starPhase: string
  selfSeat: string
  void: string
  naYin: string
}

export interface BaziFlowMonth {
  id: string
  label: string
  ganZhi: string
  mainStar: string
  heavenlyStem: string
  earthlyBranch: string
  hiddenStems: string[]
  subStars: string[]
  starPhase: string
  selfSeat: string
  void: string
  naYin: string
}

export interface BaziChart {
  profile: BaziChartProfile
  pillars: BaziPillar[]
  startLuckYears: number
  startLuckMonths: number
  startLuckDays: number
  startLuckHours: number
  startLuckDateText: string
  fortuneCycles: BaziFortuneCycle[]
  selectedCycle?: BaziFortuneCycle
  flowYears: BaziFlowYear[]
  selectedFlowYear?: BaziFlowYear
  flowMonths: BaziFlowMonth[]
  selectedFlowMonth?: BaziFlowMonth
}

export interface BaziChartArtifact extends BaziChart {
  artifactVersion: "bazi.v1"
  input: ChartBirthInput
  context: ChartCalculationContext
  provider: ChartProviderMeta
  trueSolarCorrection?: TrueSolarCorrection
}
