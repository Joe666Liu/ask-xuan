import { type DaYunLike, type EightCharLike, Lunar, LunarUtil, Solar } from "lunar-javascript"
import type {
  BaziChartArtifact,
  BaziFlowMonth,
  BaziFlowYear,
  BaziFortuneCycle,
  BaziPillar,
} from "./bazi"
import type {
  ChartBirthInput,
  ChartCalculationContext,
  ChartDateTimeParts,
  LunarDateTimeParts,
} from "./input"
import {
  chartGenderDayMasterLabel,
  makeChartCalculationContext,
  parseChartBirthInput,
  twoDigits,
} from "./input"
import { createProviderMeta } from "./provider"
import { calculateTrueSolarCorrection } from "./true-solar-time"

const LUNAR_JAVASCRIPT_VERSION = "1.7.7"

export function calculateBaziChart(
  rawInput: unknown,
  rawContext: Partial<ChartCalculationContext> = {}
): BaziChartArtifact {
  const input = parseChartBirthInput(rawInput)
  const context = makeChartCalculationContext(rawContext)
  const trueSolarCorrection = calculateTrueSolarCorrection(input)
  const lunar = makeLunar(input, trueSolarCorrection?.corrected)
  const solar = lunar.getSolar()
  const eightChar = lunar.getEightChar()
  const yun = eightChar.getYun(input.gender)
  const daYunList = yun.getDaYun(10)
  const fortuneCycles = daYunList.flatMap((daYun) =>
    daYun.getGanZhi() ? [makeFortuneCycle(daYun, eightChar)] : []
  )
  const selectedCycle = resolveSelectedCycle(fortuneCycles, context)
  const selectedDaYun = selectedCycle
    ? daYunList.find((daYun) => daYun.getIndex() === selectedCycle.sourceIndex)
    : undefined
  const flowYears = selectedDaYun
    ? selectedDaYun.getLiuNian(10).map((liuNian) => makeFlowYear(liuNian, eightChar))
    : []
  const resolvedFlowYearIndex = resolveFlowYearIndex(flowYears, context)
  const selectedFlowYear =
    resolvedFlowYearIndex === undefined ? undefined : flowYears[resolvedFlowYearIndex]
  const liuNianList = selectedDaYun?.getLiuNian(10) ?? []
  const flowMonths =
    resolvedFlowYearIndex === undefined
      ? []
      : (liuNianList[resolvedFlowYearIndex]?.getLiuYue() ?? []).map((liuYue) =>
          makeFlowMonth(liuYue, eightChar)
        )
  const selectedFlowMonth =
    context.selectedFlowMonthIndex === undefined
      ? undefined
      : flowMonths[context.selectedFlowMonthIndex]

  return {
    artifactVersion: "bazi.v1",
    input,
    context,
    provider: createProviderMeta(input, {
      name: "lunar-javascript",
      version: LUNAR_JAVASCRIPT_VERSION,
      swiftFixtureId: context.swiftFixtureId,
    }),
    trueSolarCorrection,
    profile: {
      name: input.name.trim(),
      gender: input.gender,
      birthPlace: input.birthPlace.trim(),
      solarYear: solar.getYear(),
      solarMonth: solar.getMonth(),
      solarDay: solar.getDay(),
      solarHour: solar.getHour(),
      solarMinute: solar.getMinute(),
      solarText: solarText(solar),
      lunarText: lunarText(lunar),
      baziText: eightChar.toString(),
    },
    pillars: makePillars(eightChar, input.gender),
    startLuckYears: yun.getStartYear(),
    startLuckMonths: yun.getStartMonth(),
    startLuckDays: yun.getStartDay(),
    startLuckHours: yun.getStartHour(),
    startLuckDateText: yun.getStartSolar().toYmd(),
    fortuneCycles,
    selectedCycle,
    flowYears,
    selectedFlowYear,
    flowMonths,
    selectedFlowMonth,
  }
}

function makeLunar(input: ChartBirthInput, correctedSolar?: ChartDateTimeParts) {
  if (input.calendarKind === "solar") {
    const solarBirthAt = requireSolarBirthAt(input, correctedSolar)
    return Solar.fromYmdHms(
      solarBirthAt.year,
      solarBirthAt.month,
      solarBirthAt.day,
      solarBirthAt.hour,
      solarBirthAt.minute,
      solarBirthAt.second
    ).getLunar()
  }

  const lunarBirthAt = requireLunarBirthAt(input)
  const providerMonth = lunarBirthAt.isLeapMonth ? -lunarBirthAt.month : lunarBirthAt.month

  try {
    const lunar = Lunar.fromYmdHms(
      lunarBirthAt.year,
      providerMonth,
      lunarBirthAt.day,
      lunarBirthAt.hour,
      lunarBirthAt.minute,
      lunarBirthAt.second
    )

    if (
      lunar.getYear() !== lunarBirthAt.year ||
      lunar.getMonth() !== providerMonth ||
      lunar.getDay() !== lunarBirthAt.day
    ) {
      throw new Error("provider returned a different lunar date")
    }

    return lunar
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown provider error"
    throw new Error(`Invalid lunar date: ${message}`)
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
    throw new Error("solarBirthAt is required for solar bazi chart calculation")
  }
  return input.solarBirthAt
}

function requireLunarBirthAt(input: ChartBirthInput): LunarDateTimeParts {
  if (!input.lunarBirthAt) {
    throw new Error("lunarBirthAt is required for lunar bazi chart calculation")
  }
  return input.lunarBirthAt
}

function makePillars(eightChar: EightCharLike, gender: ChartBirthInput["gender"]): BaziPillar[] {
  return [
    {
      id: "year",
      titleKey: "bazi.result.pillar.year",
      ganZhi: eightChar.getYear(),
      mainStar: eightChar.getYearShiShenGan(),
      heavenlyStem: eightChar.getYearGan(),
      earthlyBranch: eightChar.getYearZhi(),
      hiddenStems: eightChar.getYearHideGan(),
      subStars: eightChar.getYearShiShenZhi(),
      starPhase: eightChar.getYearDiShi(),
      selfSeat: selfSeat(eightChar.getYearGan(), eightChar.getYearZhi()),
      void: eightChar.getYearXunKong(),
      naYin: eightChar.getYearNaYin(),
    },
    {
      id: "month",
      titleKey: "bazi.result.pillar.month",
      ganZhi: eightChar.getMonth(),
      mainStar: eightChar.getMonthShiShenGan(),
      heavenlyStem: eightChar.getMonthGan(),
      earthlyBranch: eightChar.getMonthZhi(),
      hiddenStems: eightChar.getMonthHideGan(),
      subStars: eightChar.getMonthShiShenZhi(),
      starPhase: eightChar.getMonthDiShi(),
      selfSeat: selfSeat(eightChar.getMonthGan(), eightChar.getMonthZhi()),
      void: eightChar.getMonthXunKong(),
      naYin: eightChar.getMonthNaYin(),
    },
    {
      id: "day",
      titleKey: "bazi.result.pillar.day",
      ganZhi: eightChar.getDay(),
      mainStar: chartGenderDayMasterLabel(gender),
      heavenlyStem: eightChar.getDayGan(),
      earthlyBranch: eightChar.getDayZhi(),
      hiddenStems: eightChar.getDayHideGan(),
      subStars: eightChar.getDayShiShenZhi(),
      starPhase: eightChar.getDayDiShi(),
      selfSeat: selfSeat(eightChar.getDayGan(), eightChar.getDayZhi()),
      void: eightChar.getDayXunKong(),
      naYin: eightChar.getDayNaYin(),
    },
    {
      id: "time",
      titleKey: "bazi.result.pillar.time",
      ganZhi: eightChar.getTime(),
      mainStar: eightChar.getTimeShiShenGan(),
      heavenlyStem: eightChar.getTimeGan(),
      earthlyBranch: eightChar.getTimeZhi(),
      hiddenStems: eightChar.getTimeHideGan(),
      subStars: eightChar.getTimeShiShenZhi(),
      starPhase: eightChar.getTimeDiShi(),
      selfSeat: selfSeat(eightChar.getTimeGan(), eightChar.getTimeZhi()),
      void: eightChar.getTimeXunKong(),
      naYin: eightChar.getTimeNaYin(),
    },
  ]
}

function makeFortuneCycle(daYun: DaYunLike, eightChar: EightCharLike): BaziFortuneCycle {
  const derived = derivedGanZhiFields(
    daYun.getGanZhi(),
    eightChar.getDayGan(),
    eightChar.getDayGanIndex(),
    daYun.getXunKong()
  )

  return {
    id: `fortune-${daYun.getIndex()}`,
    sourceIndex: daYun.getIndex(),
    startYear: daYun.getStartYear(),
    endYear: daYun.getEndYear(),
    startAge: daYun.getStartAge(),
    endAge: daYun.getEndAge(),
    ...derived,
  }
}

function makeFlowYear(
  liuNian: ReturnType<DaYunLike["getLiuNian"]>[number],
  eightChar: EightCharLike
): BaziFlowYear {
  const derived = derivedGanZhiFields(
    liuNian.getGanZhi(),
    eightChar.getDayGan(),
    eightChar.getDayGanIndex(),
    liuNian.getXunKong()
  )

  return {
    id: `year-${liuNian.getYear()}-${liuNian.getIndex()}`,
    year: liuNian.getYear(),
    age: liuNian.getAge(),
    ...derived,
  }
}

function makeFlowMonth(
  liuYue: ReturnType<ReturnType<DaYunLike["getLiuNian"]>[number]["getLiuYue"]>[number],
  eightChar: EightCharLike
): BaziFlowMonth {
  const derived = derivedGanZhiFields(
    liuYue.getGanZhi(),
    eightChar.getDayGan(),
    eightChar.getDayGanIndex(),
    liuYue.getXunKong()
  )

  return {
    id: `month-${liuYue.getIndex()}`,
    label: liuYue.getMonthInChinese(),
    ...derived,
  }
}

function derivedGanZhiFields(ganZhi: string, dayGan: string, dayGanIndex: number, xunKong: string) {
  const heavenlyStem = ganZhi.slice(0, 1)
  const earthlyBranch = ganZhi.slice(1, 2)
  const hiddenStems = LunarUtil.ZHI_HIDE_GAN[earthlyBranch] ?? []

  return {
    ganZhi,
    mainStar: tenStar(dayGan, heavenlyStem),
    heavenlyStem,
    earthlyBranch,
    subStars: hiddenStems.map((hiddenStem) => tenStar(dayGan, hiddenStem)),
    hiddenStems,
    starPhase: diShi(dayGan, dayGanIndex, earthlyBranch),
    selfSeat: selfSeat(heavenlyStem, earthlyBranch),
    void: xunKong,
    naYin: LunarUtil.NAYIN[ganZhi] ?? "",
  }
}

function resolveSelectedCycle(
  cycles: BaziFortuneCycle[],
  context: ChartCalculationContext
): BaziFortuneCycle | undefined {
  if (context.selectedCycleSourceIndex !== undefined) {
    return cycles.find((cycle) => cycle.sourceIndex === context.selectedCycleSourceIndex)
  }

  if (!context.defaultsToCurrentPeriods) {
    return undefined
  }

  return cycles.find(
    (cycle) =>
      cycle.startYear <= context.targetDate.year && context.targetDate.year <= cycle.endYear
  )
}

function resolveFlowYearIndex(
  years: BaziFlowYear[],
  context: ChartCalculationContext
): number | undefined {
  if (
    context.selectedFlowYearIndex !== undefined &&
    years[context.selectedFlowYearIndex] !== undefined
  ) {
    return context.selectedFlowYearIndex
  }

  if (!context.defaultsToCurrentPeriods) {
    return undefined
  }

  const currentYearIndex = years.findIndex((year) => year.year === context.targetDate.year)
  return currentYearIndex === -1 ? undefined : currentYearIndex
}

function solarText(solar: { toYmd(): string; getHour(): number; getMinute(): number }): string {
  return `${solar.toYmd()} ${twoDigits(solar.getHour())}:${twoDigits(solar.getMinute())}`
}

function lunarText(lunar: {
  getYearInChinese(): string
  getMonthInChinese(): string
  getDayInChinese(): string
  getTimeZhi(): string
}): string {
  return `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getTimeZhi()}时`
}

function tenStar(dayGan: string, targetGan: string): string {
  return LunarUtil.SHI_SHEN[dayGan + targetGan] ?? ""
}

function diShi(dayGan: string, dayGanIndex: number, zhi: string): string {
  const zhiIndex = LunarUtil.ZHI.indexOf(zhi)
  if (zhiIndex <= 0) {
    return ""
  }

  return diShiByZhiIndex(dayGan, dayGanIndex, zhiIndex - 1)
}

function selfSeat(gan: string, zhi: string): string {
  const ganIndex = LunarUtil.GAN.indexOf(gan) - 1
  const zhiIndex = LunarUtil.ZHI.indexOf(zhi) - 1

  if (ganIndex < 0 || zhiIndex < 0) {
    return ""
  }

  return diShiByZhiIndex(gan, ganIndex, zhiIndex)
}

function diShiByZhiIndex(dayGan: string, dayGanIndex: number, zhiIndex: number): string {
  const offset = LunarUtil.CHANG_SHENG_OFFSET[dayGan]
  if (offset === undefined) {
    return ""
  }

  let index = offset + (dayGanIndex % 2 === 0 ? zhiIndex : -zhiIndex)
  if (index >= LunarUtil.CHANG_SHENG.length) {
    index -= LunarUtil.CHANG_SHENG.length
  }
  if (index < 0) {
    index += LunarUtil.CHANG_SHENG.length
  }

  return LunarUtil.CHANG_SHENG[index] ?? ""
}
