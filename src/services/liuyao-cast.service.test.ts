import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  parseLiuyaoCastGoldenFixtures,
  toCanonicalLiuyaoCastCloudRecord,
} from "@/features/liuyao/domain"
import { normalizeLiuyaoCastRecordsForUser } from "./liuyao-cast.service"

const fixtures = parseLiuyaoCastGoldenFixtures(
  JSON.parse(
    readFileSync(
      new URL(
        "../features/liuyao/domain/__fixtures__/liuyao-cast-golden-cases.json",
        import.meta.url
      ),
      "utf8"
    )
  )
)

function firstFixture() {
  const [fixture] = fixtures
  if (!fixture) {
    throw new Error("Expected at least one liuyao golden fixture")
  }
  return fixture
}

describe("LiuyaoCastService normalization", () => {
  it("rejects records that do not belong to the current session user", () => {
    const fixture = firstFixture()

    expect(() =>
      normalizeLiuyaoCastRecordsForUser("99999999-9999-4999-8999-999999999999", [
        fixture.cloudRecord,
      ])
    ).toThrow(/user_id/)
  })

  it("keeps the newest incoming record for the same run_id", () => {
    const fixture = firstFixture()
    const older = toCanonicalLiuyaoCastCloudRecord({
      ...fixture.cloudRecord,
      updated_at: "2026-06-11T08:22:00.000Z",
      result_output: "older",
    })
    const newer = toCanonicalLiuyaoCastCloudRecord({
      ...fixture.cloudRecord,
      updated_at: "2026-06-11T08:23:00.000Z",
      result_output: "newer",
    })
    const records = normalizeLiuyaoCastRecordsForUser(fixture.cloudRecord.user_id, [older, newer])

    expect(records).toHaveLength(1)
    expect(records[0]?.result_output).toBe("newer")
  })
})
