import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  liuyaoCompletedCastFromCloudRecord,
  liuyaoCompletedCastToCloudRecord,
  mergeLiuyaoCastCloudRecords,
  normalizeLiuyaoCoinThrow,
  parseLiuyaoCastGoldenFixtures,
  toCanonicalLiuyaoCastCloudRecord,
  visibleLiuyaoCastCloudRecords,
} from "."

const fixtures = parseLiuyaoCastGoldenFixtures(
  JSON.parse(
    readFileSync(new URL("./__fixtures__/liuyao-cast-golden-cases.json", import.meta.url), "utf8")
  )
)

function firstFixture() {
  const [fixture] = fixtures
  if (!fixture) {
    throw new Error("Expected at least one liuyao golden fixture")
  }
  return fixture
}

describe("liuyao cast domain", () => {
  it("round-trips Swift LiuyaoCompletedCast cloud JSON through the Web domain", () => {
    const fixture = firstFixture()
    const cast = liuyaoCompletedCastFromCloudRecord(fixture.cloudRecord)
    const roundTrip = liuyaoCompletedCastToCloudRecord(fixture.cloudRecord.user_id, cast)

    expect(cast.coinThrows.map((coinThrow) => coinThrow.lineValue)).toEqual(
      fixture.expected.lineValues
    )
    expect(cast.summary).toEqual(fixture.expected.summary)
    expect(cast.result.output).toBe(fixture.expected.output)
    expect(roundTrip).toEqual(toCanonicalLiuyaoCastCloudRecord(fixture.cloudRecord))
  })

  it("derives line values with the same head-count rules as Swift", () => {
    expect(
      normalizeLiuyaoCoinThrow({
        id: "44444444-4444-4444-8444-444444444441",
        faces: [1, 1, 1],
      })
    ).toMatchObject({ headCount: 3, lineName: "老阳", lineValue: 9 })
    expect(
      normalizeLiuyaoCoinThrow({
        id: "44444444-4444-4444-8444-444444444442",
        faces: [0, 0, 0],
      })
    ).toMatchObject({ headCount: 0, lineName: "老阴", lineValue: 6 })
  })

  it("keeps the newest record per run_id and hides soft-deleted casts", () => {
    const fixture = firstFixture()
    const older = toCanonicalLiuyaoCastCloudRecord({
      ...fixture.cloudRecord,
      updated_at: "2026-06-11T08:22:00.000Z",
      deleted_at: null,
    })
    const deleted = toCanonicalLiuyaoCastCloudRecord({
      ...fixture.cloudRecord,
      updated_at: "2026-06-11T08:23:00.000Z",
      deleted_at: "2026-06-11T08:23:00.000Z",
    })

    expect(mergeLiuyaoCastCloudRecords([older, deleted])[0]?.deleted_at).toBe(
      "2026-06-11T08:23:00.000Z"
    )
    expect(visibleLiuyaoCastCloudRecords([older, deleted])).toEqual([])
  })
})
