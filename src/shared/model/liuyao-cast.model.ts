import { and, desc, eq, isNull } from "drizzle-orm"
import { type DbTransaction, db, userLiuyaoCast } from "@/db"
import {
  type LiuyaoCastCloudRecord,
  toCanonicalLiuyaoCastCloudRecord,
} from "@/features/liuyao/domain"

export type LiuyaoCastRecordSelect = typeof userLiuyaoCast.$inferSelect
type LiuyaoCastRecordInsert = typeof userLiuyaoCast.$inferInsert

export type FindLiuyaoCastRecordsOptions = {
  includeDeleted?: boolean
}

export async function findLiuyaoCastRecordsByUserId(
  userId: string,
  options: FindLiuyaoCastRecordsOptions = {},
  tx?: DbTransaction
): Promise<LiuyaoCastCloudRecord[]> {
  const dbInstance = tx || db
  const where = options.includeDeleted
    ? eq(userLiuyaoCast.userId, userId)
    : and(eq(userLiuyaoCast.userId, userId), isNull(userLiuyaoCast.deletedAt))
  const rows = await dbInstance
    .select()
    .from(userLiuyaoCast)
    .where(where)
    .orderBy(desc(userLiuyaoCast.completedAt))

  return rows.map(rowToLiuyaoCastCloudRecord)
}

export async function upsertLiuyaoCastRecords(records: LiuyaoCastCloudRecord[]): Promise<void> {
  if (records.length === 0) {
    return
  }

  await db.transaction(async (tx) => {
    for (const record of records) {
      const value = cloudRecordToInsert(record)

      await tx
        .insert(userLiuyaoCast)
        .values(value)
        .onConflictDoUpdate({
          target: [userLiuyaoCast.userId, userLiuyaoCast.runId],
          set: {
            id: value.id,
            question: value.question,
            coinThrows: value.coinThrows,
            lowerTrigram: value.lowerTrigram,
            upperTrigram: value.upperTrigram,
            hexagramTitle: value.hexagramTitle,
            resultOutput: value.resultOutput,
            completedAt: value.completedAt,
            updatedAt: value.updatedAt,
            deletedAt: value.deletedAt,
          },
        })
    }
  })
}

export async function softDeleteLiuyaoCastRecord(
  userId: string,
  castId: string,
  deletedAt = new Date()
): Promise<void> {
  await db
    .update(userLiuyaoCast)
    .set({
      deletedAt,
      updatedAt: deletedAt,
    })
    .where(and(eq(userLiuyaoCast.userId, userId), eq(userLiuyaoCast.id, castId)))
}

function rowToLiuyaoCastCloudRecord(row: LiuyaoCastRecordSelect): LiuyaoCastCloudRecord {
  return toCanonicalLiuyaoCastCloudRecord({
    id: row.id,
    user_id: row.userId,
    question: row.question,
    coin_throws: row.coinThrows,
    lower_trigram: row.lowerTrigram,
    upper_trigram: row.upperTrigram,
    hexagram_title: row.hexagramTitle,
    result_output: row.resultOutput,
    run_id: row.runId,
    completed_at: row.completedAt,
    updated_at: row.updatedAt,
    deleted_at: row.deletedAt,
  })
}

function cloudRecordToInsert(record: LiuyaoCastCloudRecord): LiuyaoCastRecordInsert {
  const canonical = toCanonicalLiuyaoCastCloudRecord(record)

  return {
    id: canonical.id,
    userId: canonical.user_id,
    question: canonical.question,
    coinThrows: canonical.coin_throws,
    lowerTrigram: canonical.lower_trigram ?? null,
    upperTrigram: canonical.upper_trigram ?? null,
    hexagramTitle: canonical.hexagram_title,
    resultOutput: canonical.result_output,
    runId: canonical.run_id,
    completedAt: new Date(canonical.completed_at),
    updatedAt: new Date(canonical.updated_at),
    deletedAt: canonical.deleted_at ? new Date(canonical.deleted_at) : null,
  }
}
