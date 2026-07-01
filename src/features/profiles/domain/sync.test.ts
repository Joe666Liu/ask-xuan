import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  type BirthProfileCloudRecord,
  birthProfileFromCloudRecord,
  mergeRemoteBirthProfiles,
  parseBirthProfileGoldenFixtures,
  toCanonicalBirthProfileCloudRecord,
} from "."

const fixtures = parseBirthProfileGoldenFixtures(
  JSON.parse(
    readFileSync(new URL("./__fixtures__/birth-profile-golden-cases.json", import.meta.url), "utf8")
  )
)

function firstFixture() {
  const [fixture] = fixtures
  if (!fixture) {
    throw new Error("Expected at least one profile golden fixture")
  }
  return fixture
}

function recordWith(overrides: Partial<BirthProfileCloudRecord>): BirthProfileCloudRecord {
  return toCanonicalBirthProfileCloudRecord({
    ...firstFixture().cloudRecord,
    ...overrides,
  })
}

describe("birth profile sync merge", () => {
  it("applies iOS pending precedence before comparing remote updated_at", () => {
    const localPrimary = birthProfileFromCloudRecord(
      recordWith({
        display_name: "本地主档案",
        updated_at: "2026-01-02T00:00:00.000Z",
        is_primary: true,
      })
    )
    const remotePrimary = birthProfileFromCloudRecord(
      recordWith({
        display_name: "远端新主档案",
        updated_at: "2026-01-03T00:00:00.000Z",
        is_primary: true,
      })
    )
    const pendingUpsertProfile = birthProfileFromCloudRecord(
      recordWith({
        profile_id: "33333333-3333-4333-8333-333333333333",
        display_name: "本地待上传",
        updated_at: "2026-01-01T00:00:00.000Z",
        is_primary: false,
      })
    )
    const remotePendingUpsertProfile = birthProfileFromCloudRecord(
      recordWith({
        profile_id: pendingUpsertProfile.id,
        display_name: "远端待上传冲突",
        updated_at: "2026-01-05T00:00:00.000Z",
        is_primary: false,
      })
    )
    const remotePendingDeleteProfile = birthProfileFromCloudRecord(
      recordWith({
        profile_id: "22222222-2222-4222-8222-222222222222",
        display_name: "远端待删除",
        updated_at: "2026-01-05T00:00:00.000Z",
        is_primary: false,
      })
    )

    const merged = mergeRemoteBirthProfiles(
      {
        profiles: [localPrimary, pendingUpsertProfile],
        activeProfileID: localPrimary.id,
        status: "syncing",
        pendingOperations: [
          {
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            kind: "delete",
            profileID: remotePendingDeleteProfile.id,
            createdAt: "2026-01-06T00:00:00.000Z",
          },
          {
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            kind: "upsert",
            profileID: pendingUpsertProfile.id,
            profile: pendingUpsertProfile,
            createdAt: "2026-01-07T00:00:00.000Z",
          },
        ],
      },
      [remotePrimary, remotePendingUpsertProfile, remotePendingDeleteProfile]
    )

    expect(merged.status).toBe("pending")
    expect(merged.profiles.map((profile) => profile.id)).not.toContain(
      remotePendingDeleteProfile.id
    )
    expect(merged.profiles.find((profile) => profile.id === localPrimary.id)?.displayName).toBe(
      "远端新主档案"
    )
    expect(
      merged.profiles.find((profile) => profile.id === pendingUpsertProfile.id)?.displayName
    ).toBe("本地待上传")
    expect(merged.pendingOperations).toHaveLength(2)
  })

  it("keeps a single primary profile when remote records conflict", () => {
    const olderPrimary = birthProfileFromCloudRecord(
      recordWith({
        profile_id: "44444444-4444-4444-8444-444444444444",
        display_name: "旧 primary",
        updated_at: "2026-01-02T00:00:00.000Z",
        is_primary: true,
      })
    )
    const newerPrimary = birthProfileFromCloudRecord(
      recordWith({
        profile_id: "55555555-5555-4555-8555-555555555555",
        display_name: "新 primary",
        updated_at: "2026-01-04T00:00:00.000Z",
        is_primary: true,
      })
    )
    const merged = mergeRemoteBirthProfiles(
      {
        profiles: [],
        status: "syncing",
        pendingOperations: [],
      },
      [olderPrimary, newerPrimary]
    )
    const primaryProfiles = merged.profiles.filter((profile) => profile.isPrimary)

    expect(primaryProfiles).toHaveLength(1)
    expect(primaryProfiles[0]?.id).toBe(newerPrimary.id)
    expect(merged.activeProfileID).toBe(newerPrimary.id)
  })
})
