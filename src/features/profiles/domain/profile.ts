import { z } from "zod"
import {
  type ChartBirthInput,
  ChartGenderCode,
  chartBirthInputSchema,
  type ResolvedBirthPlace,
  resolvedBirthPlaceSchema,
} from "@/features/charts/domain"

export const birthProfileOwnerKindSchema = z.enum(["self", "other"])
export type BirthProfileOwnerKind = z.infer<typeof birthProfileOwnerKindSchema>

export const birthProfileSourceSchema = z.enum([
  "manual",
  "onboarding",
  "chatTool",
  "legacyMigration",
  "cloud",
])
export type BirthProfileSource = z.infer<typeof birthProfileSourceSchema>

export const isoTimestampSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), "Expected an ISO timestamp")

export const birthProfileSchema = z.object({
  id: z.string().uuid(),
  ownerKind: birthProfileOwnerKindSchema.default("self"),
  displayName: z.string().trim().default(""),
  relationNote: z.string().trim().default(""),
  input: chartBirthInputSchema,
  isPrimary: z.boolean().default(false),
  source: birthProfileSourceSchema.default("manual"),
  createdAt: isoTimestampSchema,
  updatedAt: isoTimestampSchema,
})
export type BirthProfile = z.infer<typeof birthProfileSchema>

export const birthProfilePendingOperationKindSchema = z.enum(["upsert", "delete"])
export type BirthProfilePendingOperationKind = z.infer<
  typeof birthProfilePendingOperationKindSchema
>

export const birthProfilePendingOperationSchema = z
  .object({
    id: z.string().uuid(),
    kind: birthProfilePendingOperationKindSchema,
    profileID: z.string().uuid(),
    profile: birthProfileSchema.optional(),
    createdAt: isoTimestampSchema,
  })
  .superRefine((operation, context) => {
    if (operation.kind === "upsert" && !operation.profile) {
      context.addIssue({
        code: "custom",
        path: ["profile"],
        message: "profile is required for upsert operations",
      })
    }
  })
export type BirthProfilePendingOperation = z.infer<typeof birthProfilePendingOperationSchema>

export const birthProfileSyncStatusSchema = z.enum([
  "idle",
  "pending",
  "syncing",
  "synced",
  "actionFailed",
])
export type BirthProfileSyncStatus = z.infer<typeof birthProfileSyncStatusSchema>

export const birthProfileSyncStateSchema = z.object({
  profiles: z.array(birthProfileSchema).default([]),
  activeProfileID: z.string().uuid().optional(),
  pendingOperations: z.array(birthProfilePendingOperationSchema).default([]),
  status: birthProfileSyncStatusSchema.default("idle"),
  lastError: z.string().trim().min(1).optional(),
  updatedAt: isoTimestampSchema.optional(),
})
export type BirthProfileSyncState = z.infer<typeof birthProfileSyncStateSchema>

export function parseBirthProfile(input: unknown): BirthProfile {
  return birthProfileSchema.parse(input)
}

export function normalizeBirthProfile(input: unknown): BirthProfile {
  const profile = birthProfileSchema.parse(input)
  const normalizedInput = normalizeChartBirthInput(profile.input)

  return birthProfileSchema.parse({
    ...profile,
    displayName: profile.displayName.trim(),
    relationNote: profile.relationNote.trim(),
    input: normalizedInput,
  })
}

export function normalizeBirthProfiles(inputs: unknown[]): BirthProfile[] {
  const deduped = new Map<string, BirthProfile>()

  for (const input of inputs) {
    const profile = normalizeBirthProfile(input)

    if (!deduped.has(profile.id)) {
      deduped.set(profile.id, profile)
    }
  }

  const profiles = Array.from(deduped.values())

  if (profiles.length === 0) {
    return []
  }

  const primaryID = choosePrimaryProfileID(profiles)
  const normalized = profiles.map((profile) =>
    birthProfileSchema.parse({
      ...profile,
      ownerKind: profile.id === primaryID ? "self" : profile.ownerKind,
      isPrimary: profile.id === primaryID,
    })
  )

  return normalized.sort(compareBirthProfiles)
}

export function normalizePendingOperations(inputs: unknown[]): BirthProfilePendingOperation[] {
  const latestByProfileID = new Map<string, BirthProfilePendingOperation>()

  for (const input of inputs) {
    const operation = birthProfilePendingOperationSchema.parse(input)
    const normalizedOperation =
      operation.kind === "upsert" && operation.profile
        ? birthProfilePendingOperationSchema.parse({
            ...operation,
            profile: normalizeBirthProfile(operation.profile),
          })
        : operation

    latestByProfileID.set(operation.profileID, normalizedOperation)
  }

  return Array.from(latestByProfileID.values()).sort(comparePendingOperations)
}

export function resolveBirthProfileDisplayName(profile: BirthProfile): string {
  const displayName = profile.displayName.trim()
  if (displayName) {
    return displayName
  }

  const inputName = profile.input.name.trim()
  if (inputName) {
    return inputName
  }

  return profile.ownerKind === "self" ? "我的档案" : "未命名档案"
}

export function normalizeChartBirthInput(input: ChartBirthInput): ChartBirthInput {
  const parsed = chartBirthInputSchema.parse(input)

  return chartBirthInputSchema.parse({
    ...parsed,
    name: parsed.name.trim(),
    birthPlace: parsed.birthPlace.trim(),
    resolvedBirthPlace: normalizeResolvedBirthPlace(parsed.resolvedBirthPlace),
  })
}

export function normalizeResolvedBirthPlace(
  place: ResolvedBirthPlace | undefined
): ResolvedBirthPlace | undefined {
  if (!place) {
    return undefined
  }

  const parsed = resolvedBirthPlaceSchema.parse(place)
  const label = parsed.label.trim()

  if (!label || !Number.isFinite(parsed.latitude) || !Number.isFinite(parsed.longitude)) {
    return undefined
  }

  const providerPlaceID = parsed.providerPlaceID?.trim()

  return resolvedBirthPlaceSchema.parse({
    label,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    timezoneIdentifier: parsed.timezoneIdentifier.trim() || "Asia/Shanghai",
    source: parsed.source.trim() || "apple_mapkit",
    providerPlaceID: providerPlaceID || undefined,
  })
}

export function resolveActiveProfileID(
  profiles: BirthProfile[],
  requestedProfileID?: string
): string | undefined {
  if (requestedProfileID && profiles.some((profile) => profile.id === requestedProfileID)) {
    return requestedProfileID
  }

  return profiles.find((profile) => profile.isPrimary)?.id ?? profiles[0]?.id
}

export function makeEmptyPrimaryBirthProfile(now = new Date()): BirthProfile {
  const timestamp = now.toISOString()

  return birthProfileSchema.parse({
    id: crypto.randomUUID(),
    ownerKind: "self",
    displayName: "",
    relationNote: "",
    input: {
      name: "",
      gender: ChartGenderCode.male,
      calendarKind: "solar",
      solarBirthAt: {
        year: 1990,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        second: 0,
      },
      birthPlace: "",
      usesTrueSolarTime: false,
    },
    isPrimary: true,
    source: "manual",
    createdAt: timestamp,
    updatedAt: timestamp,
  })
}

function choosePrimaryProfileID(profiles: BirthProfile[]): string {
  const primaryProfiles = profiles.filter((profile) => profile.isPrimary)

  if (primaryProfiles.length > 0) {
    return [...primaryProfiles].sort(compareUpdatedAtDescending)[0].id
  }

  return profiles.find((profile) => profile.ownerKind === "self")?.id ?? profiles[0].id
}

function compareBirthProfiles(first: BirthProfile, second: BirthProfile): number {
  if (first.isPrimary !== second.isPrimary) {
    return first.isPrimary ? -1 : 1
  }

  if (first.ownerKind !== second.ownerKind) {
    return first.ownerKind === "self" ? -1 : 1
  }

  const dateComparison = compareUpdatedAtDescending(first, second)
  if (dateComparison !== 0) {
    return dateComparison
  }

  return resolveBirthProfileDisplayName(first).localeCompare(resolveBirthProfileDisplayName(second))
}

function compareUpdatedAtDescending(first: BirthProfile, second: BirthProfile): number {
  return Date.parse(second.updatedAt) - Date.parse(first.updatedAt)
}

function comparePendingOperations(
  first: BirthProfilePendingOperation,
  second: BirthProfilePendingOperation
): number {
  return Date.parse(first.createdAt) - Date.parse(second.createdAt)
}
