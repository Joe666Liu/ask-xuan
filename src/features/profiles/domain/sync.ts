import {
  type BirthProfile,
  type BirthProfileSyncState,
  birthProfileSyncStateSchema,
  normalizeBirthProfile,
  normalizeBirthProfiles,
  normalizePendingOperations,
  resolveActiveProfileID,
} from "./profile"

export function mergeRemoteBirthProfiles(
  localInput: unknown,
  remoteInputs: unknown[]
): BirthProfileSyncState {
  const local = birthProfileSyncStateSchema.parse(localInput)
  const pendingOperations = normalizePendingOperations(local.pendingOperations)
  const pendingDeleteIDs = new Set(
    pendingOperations
      .filter((operation) => operation.kind === "delete")
      .map((operation) => operation.profileID)
  )
  const pendingUpsertIDs = new Set(
    pendingOperations
      .filter((operation) => operation.kind === "upsert")
      .map((operation) => operation.profileID)
  )
  const mergedByID = new Map<string, BirthProfile>()

  for (const profile of normalizeBirthProfiles(local.profiles)) {
    if (!pendingDeleteIDs.has(profile.id)) {
      mergedByID.set(profile.id, profile)
    }
  }

  for (const remoteInput of remoteInputs) {
    const remoteProfile = normalizeBirthProfile(remoteInput)

    if (pendingDeleteIDs.has(remoteProfile.id) || pendingUpsertIDs.has(remoteProfile.id)) {
      continue
    }

    const localProfile = mergedByID.get(remoteProfile.id)

    if (!localProfile || Date.parse(remoteProfile.updatedAt) > Date.parse(localProfile.updatedAt)) {
      mergedByID.set(remoteProfile.id, remoteProfile)
    }
  }

  const profiles = normalizeBirthProfiles(Array.from(mergedByID.values()))
  const activeProfileID = resolveActiveProfileID(profiles, local.activeProfileID)

  return birthProfileSyncStateSchema.parse({
    ...local,
    profiles,
    activeProfileID,
    pendingOperations,
    status: pendingOperations.length > 0 ? "pending" : "synced",
    lastError: undefined,
  })
}

export function pendingOperationProfileIDs(localInput: unknown): {
  deleteIDs: Set<string>
  upsertIDs: Set<string>
} {
  const local = birthProfileSyncStateSchema.parse(localInput)
  const operations = normalizePendingOperations(local.pendingOperations)

  return {
    deleteIDs: new Set(
      operations
        .filter((operation) => operation.kind === "delete")
        .map((operation) => operation.profileID)
    ),
    upsertIDs: new Set(
      operations
        .filter((operation) => operation.kind === "upsert")
        .map((operation) => operation.profileID)
    ),
  }
}
