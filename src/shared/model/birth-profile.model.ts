import { and, desc, eq } from "drizzle-orm"
import { type DbTransaction, db, userBirthProfileRecord } from "@/db"
import {
  type BirthProfileCloudRecord,
  toCanonicalBirthProfileCloudRecord,
} from "@/features/profiles/domain"

export type BirthProfileRecordSelect = typeof userBirthProfileRecord.$inferSelect
type BirthProfileRecordInsert = typeof userBirthProfileRecord.$inferInsert

export async function findBirthProfileRecordsByUserId(
  userId: string,
  tx?: DbTransaction
): Promise<BirthProfileCloudRecord[]> {
  const dbInstance = tx || db
  const rows = await dbInstance
    .select()
    .from(userBirthProfileRecord)
    .where(eq(userBirthProfileRecord.userId, userId))
    .orderBy(desc(userBirthProfileRecord.isPrimary), desc(userBirthProfileRecord.updatedAt))

  return rows.map(rowToBirthProfileCloudRecord)
}

export async function upsertBirthProfileRecords(
  userId: string,
  records: BirthProfileCloudRecord[]
): Promise<void> {
  if (records.length === 0) {
    return
  }

  await db.transaction(async (tx) => {
    if (records.some((record) => record.is_primary)) {
      await tx
        .update(userBirthProfileRecord)
        .set({ isPrimary: false })
        .where(
          and(eq(userBirthProfileRecord.userId, userId), eq(userBirthProfileRecord.isPrimary, true))
        )
    }

    for (const record of records) {
      const value = cloudRecordToInsert(record)

      await tx
        .insert(userBirthProfileRecord)
        .values(value)
        .onConflictDoUpdate({
          target: [userBirthProfileRecord.userId, userBirthProfileRecord.profileId],
          set: {
            ownerKind: value.ownerKind,
            displayName: value.displayName,
            relationNote: value.relationNote,
            name: value.name,
            gender: value.gender,
            calendarKind: value.calendarKind,
            solarBirthAt: value.solarBirthAt,
            lunarYear: value.lunarYear,
            lunarMonth: value.lunarMonth,
            lunarDay: value.lunarDay,
            lunarHour: value.lunarHour,
            lunarMinute: value.lunarMinute,
            lunarSecond: value.lunarSecond,
            birthPlace: value.birthPlace,
            birthPlaceLabel: value.birthPlaceLabel,
            birthPlaceLatitude: value.birthPlaceLatitude,
            birthPlaceLongitude: value.birthPlaceLongitude,
            birthPlaceTimezone: value.birthPlaceTimezone,
            birthPlaceSource: value.birthPlaceSource,
            birthPlaceProviderPlaceId: value.birthPlaceProviderPlaceId,
            usesTrueSolarTime: value.usesTrueSolarTime,
            isPrimary: value.isPrimary,
            source: value.source,
            createdAt: value.createdAt,
            updatedAt: value.updatedAt,
          },
        })
    }
  })
}

export async function deleteBirthProfileRecord(userId: string, profileId: string): Promise<void> {
  await db
    .delete(userBirthProfileRecord)
    .where(
      and(
        eq(userBirthProfileRecord.userId, userId),
        eq(userBirthProfileRecord.profileId, profileId)
      )
    )
}

function rowToBirthProfileCloudRecord(row: BirthProfileRecordSelect): BirthProfileCloudRecord {
  return toCanonicalBirthProfileCloudRecord({
    user_id: row.userId,
    profile_id: row.profileId,
    owner_kind: row.ownerKind,
    display_name: row.displayName,
    relation_note: row.relationNote,
    name: row.name,
    gender: row.gender,
    calendar_kind: row.calendarKind,
    solar_birth_at: row.solarBirthAt,
    lunar_year: row.lunarYear,
    lunar_month: row.lunarMonth,
    lunar_day: row.lunarDay,
    lunar_hour: row.lunarHour,
    lunar_minute: row.lunarMinute,
    lunar_second: row.lunarSecond,
    birth_place: row.birthPlace,
    birth_place_label: row.birthPlaceLabel,
    birth_place_latitude: row.birthPlaceLatitude,
    birth_place_longitude: row.birthPlaceLongitude,
    birth_place_timezone: row.birthPlaceTimezone,
    birth_place_source: row.birthPlaceSource,
    birth_place_provider_place_id: row.birthPlaceProviderPlaceId,
    uses_true_solar_time: row.usesTrueSolarTime,
    is_primary: row.isPrimary,
    source: row.source,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  })
}

function cloudRecordToInsert(record: BirthProfileCloudRecord): BirthProfileRecordInsert {
  const canonical = toCanonicalBirthProfileCloudRecord(record)

  return {
    userId: canonical.user_id,
    profileId: canonical.profile_id,
    ownerKind: canonical.owner_kind,
    displayName: canonical.display_name,
    relationNote: canonical.relation_note,
    name: canonical.name,
    gender: canonical.gender,
    calendarKind: canonical.calendar_kind,
    solarBirthAt: new Date(canonical.solar_birth_at),
    lunarYear: canonical.lunar_year,
    lunarMonth: canonical.lunar_month,
    lunarDay: canonical.lunar_day,
    lunarHour: canonical.lunar_hour,
    lunarMinute: canonical.lunar_minute,
    lunarSecond: canonical.lunar_second,
    birthPlace: canonical.birth_place,
    birthPlaceLabel: canonical.birth_place_label ?? null,
    birthPlaceLatitude: canonical.birth_place_latitude ?? null,
    birthPlaceLongitude: canonical.birth_place_longitude ?? null,
    birthPlaceTimezone: canonical.birth_place_timezone ?? null,
    birthPlaceSource: canonical.birth_place_source ?? null,
    birthPlaceProviderPlaceId: canonical.birth_place_provider_place_id ?? null,
    usesTrueSolarTime: canonical.uses_true_solar_time,
    isPrimary: canonical.is_primary,
    source: canonical.source,
    createdAt: new Date(canonical.created_at),
    updatedAt: new Date(canonical.updated_at),
  }
}
