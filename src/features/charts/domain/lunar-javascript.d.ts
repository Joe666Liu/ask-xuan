declare module "lunar-javascript" {
  export interface SolarLike {
    getYear(): number
    getMonth(): number
    getDay(): number
    getHour(): number
    getMinute(): number
    getSecond(): number
    getLunar(): LunarLike
    toYmd(): string
    toYmdHms(): string
  }

  export interface LunarLike {
    getYear(): number
    getMonth(): number
    getDay(): number
    getHour(): number
    getMinute(): number
    getSecond(): number
    getSolar(): SolarLike
    getEightChar(): EightCharLike
    getYearInChinese(): string
    getMonthInChinese(): string
    getDayInChinese(): string
    getTimeZhi(): string
    toString(): string
    toFullString(): string
  }

  export interface EightCharLike {
    getDayGanIndex(): number
    getYear(): string
    getYearGan(): string
    getYearZhi(): string
    getYearHideGan(): string[]
    getYearNaYin(): string
    getYearShiShenGan(): string
    getYearShiShenZhi(): string[]
    getYearDiShi(): string
    getYearXunKong(): string
    getMonth(): string
    getMonthGan(): string
    getMonthZhi(): string
    getMonthHideGan(): string[]
    getMonthNaYin(): string
    getMonthShiShenGan(): string
    getMonthShiShenZhi(): string[]
    getMonthDiShi(): string
    getMonthXunKong(): string
    getDay(): string
    getDayGan(): string
    getDayZhi(): string
    getDayHideGan(): string[]
    getDayNaYin(): string
    getDayShiShenZhi(): string[]
    getDayDiShi(): string
    getDayXunKong(): string
    getTime(): string
    getTimeGan(): string
    getTimeZhi(): string
    getTimeHideGan(): string[]
    getTimeNaYin(): string
    getTimeShiShenGan(): string
    getTimeShiShenZhi(): string[]
    getTimeDiShi(): string
    getTimeXunKong(): string
    getLunar(): LunarLike
    getYun(gender: number, sect?: number): YunLike
    toString(): string
  }

  export interface YunLike {
    getStartYear(): number
    getStartMonth(): number
    getStartDay(): number
    getStartHour(): number
    getStartSolar(): SolarLike
    getDaYun(n?: number): DaYunLike[]
  }

  export interface DaYunLike {
    getIndex(): number
    getGanZhi(): string
    getStartYear(): number
    getEndYear(): number
    getStartAge(): number
    getEndAge(): number
    getXunKong(): string
    getLiuNian(n?: number): LiuNianLike[]
  }

  export interface LiuNianLike {
    getIndex(): number
    getYear(): number
    getAge(): number
    getGanZhi(): string
    getXunKong(): string
    getLiuYue(): LiuYueLike[]
  }

  export interface LiuYueLike {
    getIndex(): number
    getMonthInChinese(): string
    getGanZhi(): string
    getXunKong(): string
  }

  export const Solar: {
    fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number
    ): SolarLike
  }

  export const Lunar: {
    fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number
    ): LunarLike
  }

  export const LunarUtil: {
    GAN: string[]
    ZHI: string[]
    ZHI_HIDE_GAN: Record<string, string[]>
    SHI_SHEN: Record<string, string>
    NAYIN: Record<string, string>
    CHANG_SHENG: string[]
    CHANG_SHENG_OFFSET: Record<string, number>
  }
}
