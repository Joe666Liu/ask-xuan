import { eq } from "drizzle-orm"
import { type DbTransaction, db, userConsent } from "@/db"
import {
  type AIConsentCloudRecord,
  toCanonicalAIConsentCloudRecord,
} from "@/features/privacy-ai/domain"

export type AIConsentRecordSelect = typeof userConsent.$inferSelect
type AIConsentRecordInsert = typeof userConsent.$inferInsert

export async function findAIConsentRecordsByUserId(
  userId: string,
  tx?: DbTransaction
): Promise<AIConsentCloudRecord[]> {
  const dbInstance = tx || db
  const rows = await dbInstance.select().from(userConsent).where(eq(userConsent.userId, userId))

  return rows.map(rowToAIConsentCloudRecord)
}

export async function upsertAIConsentRecord(record: AIConsentCloudRecord): Promise<void> {
  const value = cloudRecordToInsert(record)

  await db
    .insert(userConsent)
    .values(value)
    .onConflictDoUpdate({
      target: [userConsent.userId, userConsent.consentType],
      set: {
        consentVersion: value.consentVersion,
        isGranted: value.isGranted,
        grantedAt: value.grantedAt,
        revokedAt: value.revokedAt,
        source: value.source,
        locale: value.locale,
        region: value.region,
        updatedAt: value.updatedAt,
      },
    })
}

function rowToAIConsentCloudRecord(row: AIConsentRecordSelect): AIConsentCloudRecord {
  return toCanonicalAIConsentCloudRecord({
    user_id: row.userId,
    consent_type: row.consentType,
    consent_version: row.consentVersion,
    is_granted: row.isGranted,
    granted_at: row.grantedAt,
    revoked_at: row.revokedAt,
    source: row.source,
    locale: row.locale,
    region: row.region,
    updated_at: row.updatedAt,
  })
}

function cloudRecordToInsert(record: AIConsentCloudRecord): AIConsentRecordInsert {
  const canonical = toCanonicalAIConsentCloudRecord(record)

  return {
    userId: canonical.user_id,
    consentType: canonical.consent_type,
    consentVersion: canonical.consent_version,
    isGranted: canonical.is_granted,
    grantedAt: canonical.granted_at ? new Date(canonical.granted_at) : null,
    revokedAt: canonical.revoked_at ? new Date(canonical.revoked_at) : null,
    source: canonical.source,
    locale: canonical.locale ?? null,
    region: canonical.region ?? null,
    updatedAt: new Date(canonical.updated_at),
  }
}
