import { z } from "zod"

export const AI_CONSENT_CURRENT_VERSION = "2026-06-ai-v1"

export const aiConsentTypeSchema = z.enum(["ai_interpretation", "china_model_provider"])
export type AIConsentType = z.infer<typeof aiConsentTypeSchema>

export const aiConsentSourceSchema = z.enum([
  "onboarding",
  "chat",
  "meihua",
  "zhaojian",
  "settings",
])
export type AIConsentSource = z.infer<typeof aiConsentSourceSchema>

export const AI_CONSENT_TYPES = aiConsentTypeSchema.options

const isoTimestampSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), "Expected an ISO timestamp")

const cloudTimestampSchema = z.preprocess((value) => {
  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === "string") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : date.toISOString()
  }

  return value
}, isoTimestampSchema)

const nullableTimestampSchema = z.preprocess(
  (value) => (value === null ? undefined : value),
  cloudTimestampSchema.optional()
)
const nullableTrimmedStringSchema = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.string().trim().optional()
)

export const aiConsentCloudRecordSchema = z
  .object({
    user_id: z.string().uuid(),
    consent_type: aiConsentTypeSchema,
    consent_version: z.string().trim().min(1),
    is_granted: z.boolean().default(false),
    granted_at: nullableTimestampSchema,
    revoked_at: nullableTimestampSchema,
    source: z.string().trim().min(1).default("settings"),
    locale: nullableTrimmedStringSchema,
    region: nullableTrimmedStringSchema,
    updated_at: cloudTimestampSchema,
  })
  .superRefine((record, context) => {
    if (record.is_granted) {
      if (!record.granted_at) {
        context.addIssue({
          code: "custom",
          path: ["granted_at"],
          message: "granted_at is required when consent is granted",
        })
      }
      if (record.revoked_at) {
        context.addIssue({
          code: "custom",
          path: ["revoked_at"],
          message: "revoked_at must be empty when consent is granted",
        })
      }
      return
    }

    if (!record.revoked_at) {
      context.addIssue({
        code: "custom",
        path: ["revoked_at"],
        message: "revoked_at is required when consent is revoked",
      })
    }
  })
export type AIConsentCloudRecord = z.infer<typeof aiConsentCloudRecordSchema>

export const aiConsentSnapshotSchema = z.object({
  consentType: aiConsentTypeSchema,
  consentVersion: z.string().trim().min(1),
  isGranted: z.boolean(),
  grantedAt: isoTimestampSchema.optional(),
  revokedAt: isoTimestampSchema.optional(),
  source: z.string().trim().min(1).optional(),
})
export type AIConsentSnapshot = z.infer<typeof aiConsentSnapshotSchema>

export const aiConsentOverviewSchema = z.object({
  version: z.literal(AI_CONSENT_CURRENT_VERSION),
  ai_interpretation: aiConsentSnapshotSchema,
  china_model_provider: aiConsentSnapshotSchema,
})
export type AIConsentOverview = z.infer<typeof aiConsentOverviewSchema>

export const aiConsentUpdateInputSchema = z.object({
  consentType: aiConsentTypeSchema,
  isGranted: z.boolean(),
  source: aiConsentSourceSchema,
  locale: z.string().trim().min(1).optional(),
  region: z.string().trim().min(1).optional(),
})
export type AIConsentUpdateInput = z.infer<typeof aiConsentUpdateInputSchema>

export type MakeAIConsentCloudRecordInput = AIConsentUpdateInput & {
  userID: string
  now?: Date | string
}

export const aiConsentGoldenFixtureSchema = z.object({
  id: z.string().trim().min(1),
  cloudRecord: aiConsentCloudRecordSchema,
  expected: z.object({
    snapshot: aiConsentSnapshotSchema,
  }),
})
export type AIConsentGoldenFixture = z.infer<typeof aiConsentGoldenFixtureSchema>

export function parseAIConsentCloudRecord(input: unknown): AIConsentCloudRecord {
  return toCanonicalAIConsentCloudRecord(input)
}

export function toCanonicalAIConsentCloudRecord(input: unknown): AIConsentCloudRecord {
  const record = aiConsentCloudRecordSchema.parse(input)

  return {
    user_id: record.user_id,
    consent_type: record.consent_type,
    consent_version: record.consent_version,
    is_granted: record.is_granted,
    granted_at: record.granted_at,
    revoked_at: record.revoked_at,
    source: record.source,
    locale: emptyToUndefined(record.locale),
    region: emptyToUndefined(record.region),
    updated_at: record.updated_at,
  }
}

export function makeAIConsentCloudRecord(
  input: MakeAIConsentCloudRecordInput
): AIConsentCloudRecord {
  const update = aiConsentUpdateInputSchema.parse(input)
  const userID = z.string().uuid().parse(input.userID)
  const timestamp = normalizeTimestamp(input.now ?? new Date())

  return toCanonicalAIConsentCloudRecord({
    user_id: userID,
    consent_type: update.consentType,
    consent_version: AI_CONSENT_CURRENT_VERSION,
    is_granted: update.isGranted,
    granted_at: update.isGranted ? timestamp : undefined,
    revoked_at: update.isGranted ? undefined : timestamp,
    source: update.source,
    locale: update.locale,
    region: update.region,
    updated_at: timestamp,
  })
}

export function aiConsentSnapshotFromCloudRecord(input: unknown): AIConsentSnapshot {
  const record = toCanonicalAIConsentCloudRecord(input)

  return aiConsentSnapshotSchema.parse({
    consentType: record.consent_type,
    consentVersion: record.consent_version,
    isGranted: record.is_granted && record.consent_version === AI_CONSENT_CURRENT_VERSION,
    grantedAt: record.granted_at,
    revokedAt: record.revoked_at,
    source: record.source,
  })
}

export function aiConsentOverviewFromCloudRecords(inputs: unknown[]): AIConsentOverview {
  const records = inputs.map((input) => toCanonicalAIConsentCloudRecord(input))
  const newestByType = new Map<AIConsentType, AIConsentCloudRecord>()

  for (const record of records) {
    const existing = newestByType.get(record.consent_type)

    if (!existing || Date.parse(record.updated_at) > Date.parse(existing.updated_at)) {
      newestByType.set(record.consent_type, record)
    }
  }

  return aiConsentOverviewSchema.parse({
    version: AI_CONSENT_CURRENT_VERSION,
    ai_interpretation: snapshotOrDefault("ai_interpretation", newestByType),
    china_model_provider: snapshotOrDefault("china_model_provider", newestByType),
  })
}

export function parseAIConsentGoldenFixtures(input: unknown): AIConsentGoldenFixture[] {
  return z.array(aiConsentGoldenFixtureSchema).parse(input)
}

function snapshotOrDefault(
  consentType: AIConsentType,
  records: Map<AIConsentType, AIConsentCloudRecord>
): AIConsentSnapshot {
  const record = records.get(consentType)

  if (record) {
    return aiConsentSnapshotFromCloudRecord(record)
  }

  return aiConsentSnapshotSchema.parse({
    consentType,
    consentVersion: AI_CONSENT_CURRENT_VERSION,
    isGranted: false,
  })
}

function normalizeTimestamp(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid consent timestamp")
  }

  return date.toISOString()
}

function emptyToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}
