import { z } from "zod"

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

export const liuyaoCoinFaceSchema = z.union([z.literal(0), z.literal(1)])
export type LiuyaoCoinFace = z.infer<typeof liuyaoCoinFaceSchema>

export const liuyaoCoinThrowCloudJsonSchema = z.object({
  id: z.string().uuid(),
  faces: z.array(liuyaoCoinFaceSchema).length(3),
})
export type LiuyaoCoinThrowCloudJson = z.infer<typeof liuyaoCoinThrowCloudJsonSchema>

export const liuyaoLineNameSchema = z.enum(["老阴", "少阳", "少阴", "老阳"])
export type LiuyaoLineName = z.infer<typeof liuyaoLineNameSchema>

export const liuyaoCoinThrowSchema = z.object({
  id: z.string().uuid(),
  faces: z.array(liuyaoCoinFaceSchema).length(3),
  encodedFaces: z.array(liuyaoCoinFaceSchema).length(3),
  headCount: z.number().int().min(0).max(3),
  lineName: liuyaoLineNameSchema,
  lineValue: z.union([z.literal(6), z.literal(7), z.literal(8), z.literal(9)]),
})
export type LiuyaoCoinThrow = z.infer<typeof liuyaoCoinThrowSchema>

export const liuyaoHexagramSummarySchema = z.object({
  lowerTrigram: z.string().trim().min(1).optional(),
  upperTrigram: z.string().trim().min(1).optional(),
  hexagramTitle: z.string().trim().min(1),
})
export type LiuyaoHexagramSummary = z.infer<typeof liuyaoHexagramSummarySchema>

export const liuyaoCastResultSchema = z.object({
  runID: z.string().trim().min(1),
  output: z.string(),
})
export type LiuyaoCastResult = z.infer<typeof liuyaoCastResultSchema>

export const liuyaoCompletedCastSchema = z.object({
  id: z.string().uuid(),
  userID: z.string().uuid(),
  question: z.string().trim().min(1),
  coinThrows: z.array(liuyaoCoinThrowSchema).length(6),
  summary: liuyaoHexagramSummarySchema,
  result: liuyaoCastResultSchema,
  completedAt: isoTimestampSchema,
  updatedAt: isoTimestampSchema,
  deletedAt: isoTimestampSchema.optional(),
})
export type LiuyaoCompletedCast = z.infer<typeof liuyaoCompletedCastSchema>

export const liuyaoCastCloudRecordSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  question: z.string().trim().min(1),
  coin_throws: z.array(liuyaoCoinThrowCloudJsonSchema).length(6),
  lower_trigram: nullableTrimmedStringSchema,
  upper_trigram: nullableTrimmedStringSchema,
  hexagram_title: z.string().trim().min(1),
  result_output: z.string(),
  run_id: z.string().trim().min(1),
  completed_at: cloudTimestampSchema,
  updated_at: cloudTimestampSchema,
  deleted_at: nullableTimestampSchema,
})
export type LiuyaoCastCloudRecord = z.infer<typeof liuyaoCastCloudRecordSchema>

export const liuyaoCastGoldenFixtureSchema = z.object({
  id: z.string().trim().min(1),
  cloudRecord: liuyaoCastCloudRecordSchema,
  expected: z.object({
    lineValues: z.array(z.number().int()).length(6),
    summary: liuyaoHexagramSummarySchema,
    output: z.string(),
  }),
})
export type LiuyaoCastGoldenFixture = z.infer<typeof liuyaoCastGoldenFixtureSchema>

export function parseLiuyaoCastCloudRecord(input: unknown): LiuyaoCastCloudRecord {
  return toCanonicalLiuyaoCastCloudRecord(input)
}

export function toCanonicalLiuyaoCastCloudRecord(input: unknown): LiuyaoCastCloudRecord {
  const record = liuyaoCastCloudRecordSchema.parse(input)

  return {
    id: record.id,
    user_id: record.user_id,
    question: record.question,
    coin_throws: record.coin_throws.map(toCanonicalCoinThrowJson),
    lower_trigram: emptyToUndefined(record.lower_trigram),
    upper_trigram: emptyToUndefined(record.upper_trigram),
    hexagram_title: record.hexagram_title,
    result_output: record.result_output,
    run_id: record.run_id,
    completed_at: record.completed_at,
    updated_at: record.updated_at,
    deleted_at: record.deleted_at,
  }
}

export function liuyaoCompletedCastFromCloudRecord(input: unknown): LiuyaoCompletedCast {
  const record = toCanonicalLiuyaoCastCloudRecord(input)

  return liuyaoCompletedCastSchema.parse({
    id: record.id,
    userID: record.user_id,
    question: record.question,
    coinThrows: record.coin_throws.map(normalizeLiuyaoCoinThrow),
    summary: {
      lowerTrigram: record.lower_trigram,
      upperTrigram: record.upper_trigram,
      hexagramTitle: record.hexagram_title,
    },
    result: {
      runID: record.run_id,
      output: record.result_output,
    },
    completedAt: record.completed_at,
    updatedAt: record.updated_at,
    deletedAt: record.deleted_at,
  })
}

export function liuyaoCompletedCastToCloudRecord(
  userID: string,
  input: unknown
): LiuyaoCastCloudRecord {
  const cast = liuyaoCompletedCastSchema.parse(input)
  const normalizedUserID = z.string().uuid().parse(userID)

  if (cast.userID !== normalizedUserID) {
    throw new Error("Liuyao cast userID does not match the current session user")
  }

  return toCanonicalLiuyaoCastCloudRecord({
    id: cast.id,
    user_id: normalizedUserID,
    question: cast.question,
    coin_throws: cast.coinThrows.map((coinThrow) => ({
      id: coinThrow.id,
      faces: coinThrow.faces,
    })),
    lower_trigram: cast.summary.lowerTrigram,
    upper_trigram: cast.summary.upperTrigram,
    hexagram_title: cast.summary.hexagramTitle,
    result_output: cast.result.output,
    run_id: cast.result.runID,
    completed_at: cast.completedAt,
    updated_at: cast.updatedAt,
    deleted_at: cast.deletedAt,
  })
}

export function normalizeLiuyaoCoinThrow(input: unknown): LiuyaoCoinThrow {
  const coinThrow = toCanonicalCoinThrowJson(input)
  const headCount = coinThrow.faces.filter((face) => face === 1).length
  const line = lineFromHeadCount(headCount)

  return liuyaoCoinThrowSchema.parse({
    id: coinThrow.id,
    faces: coinThrow.faces,
    encodedFaces: coinThrow.faces,
    headCount,
    lineName: line.lineName,
    lineValue: line.lineValue,
  })
}

export function mergeLiuyaoCastCloudRecords(inputs: unknown[]): LiuyaoCastCloudRecord[] {
  const newestByRunID = new Map<string, LiuyaoCastCloudRecord>()

  for (const input of inputs) {
    const record = toCanonicalLiuyaoCastCloudRecord(input)
    const key = `${record.user_id}:${record.run_id}`
    const existing = newestByRunID.get(key)

    if (!existing || Date.parse(record.updated_at) > Date.parse(existing.updated_at)) {
      newestByRunID.set(key, record)
    }
  }

  return Array.from(newestByRunID.values()).sort(
    (first, second) => Date.parse(second.completed_at) - Date.parse(first.completed_at)
  )
}

export function visibleLiuyaoCastCloudRecords(inputs: unknown[]): LiuyaoCastCloudRecord[] {
  return mergeLiuyaoCastCloudRecords(inputs).filter((record) => !record.deleted_at)
}

export function parseLiuyaoCastGoldenFixtures(input: unknown): LiuyaoCastGoldenFixture[] {
  return z.array(liuyaoCastGoldenFixtureSchema).parse(input)
}

function lineFromHeadCount(headCount: number): Pick<LiuyaoCoinThrow, "lineName" | "lineValue"> {
  switch (headCount) {
    case 3:
      return { lineName: "老阳", lineValue: 9 }
    case 2:
      return { lineName: "少阴", lineValue: 8 }
    case 1:
      return { lineName: "少阳", lineValue: 7 }
    default:
      return { lineName: "老阴", lineValue: 6 }
  }
}

function toCanonicalCoinThrowJson(input: unknown): LiuyaoCoinThrowCloudJson {
  const coinThrow = liuyaoCoinThrowCloudJsonSchema.parse(input)

  return {
    id: coinThrow.id,
    faces: [...coinThrow.faces],
  }
}

function emptyToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}
