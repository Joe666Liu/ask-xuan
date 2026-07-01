import type { ChartBirthInput, ChartCalendarKind } from "./input"

export type ChartParityStatus =
  | "web-calculated-swift-fixture-pending"
  | "swift-fixture-matched"
  | "provider-error"

export interface ChartProviderMeta {
  name: "lunar-javascript" | "iztro"
  version: string
  inputCalendarKind: ChartCalendarKind
  usesTrueSolarTime: boolean
  parityStatus: ChartParityStatus
  swiftFixtureId?: string
}

export function createProviderMeta(
  input: ChartBirthInput,
  provider: Pick<ChartProviderMeta, "name" | "version" | "swiftFixtureId">
): ChartProviderMeta {
  return {
    ...provider,
    inputCalendarKind: input.calendarKind,
    usesTrueSolarTime: input.usesTrueSolarTime,
    parityStatus: provider.swiftFixtureId
      ? "swift-fixture-matched"
      : "web-calculated-swift-fixture-pending",
  }
}
