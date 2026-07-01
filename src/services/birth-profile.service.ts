import { z } from "zod"
import {
  type BirthProfileCloudRecord,
  birthProfileCloudRecordSchema,
  birthProfileFromCloudRecord,
  birthProfileToCloudRecord,
} from "@/features/profiles/domain"
import {
  deleteBirthProfileRecord,
  findBirthProfileRecordsByUserId,
  upsertBirthProfileRecords,
} from "@/shared/model/birth-profile.model"

export class BirthProfileService {
  async listBirthProfiles(userId: string): Promise<BirthProfileCloudRecord[]> {
    const userID = z.string().uuid().parse(userId)
    return findBirthProfileRecordsByUserId(userID)
  }

  async upsertBirthProfiles(
    userId: string,
    records: BirthProfileCloudRecord[]
  ): Promise<BirthProfileCloudRecord[]> {
    const userID = z.string().uuid().parse(userId)
    const normalizedRecords = normalizeCloudRecordsForUser(userID, records)

    await upsertBirthProfileRecords(userID, normalizedRecords)
    return findBirthProfileRecordsByUserId(userID)
  }

  async deleteBirthProfile(userId: string, profileID: string): Promise<BirthProfileCloudRecord[]> {
    const userID = z.string().uuid().parse(userId)
    const normalizedProfileID = z.string().uuid().parse(profileID)

    await deleteBirthProfileRecord(userID, normalizedProfileID)
    return findBirthProfileRecordsByUserId(userID)
  }
}

export function normalizeCloudRecordsForUser(
  userID: string,
  records: BirthProfileCloudRecord[]
): BirthProfileCloudRecord[] {
  const normalizedUserID = z.string().uuid().parse(userID)
  const parsedRecords = z.array(birthProfileCloudRecordSchema).parse(records)

  for (const record of parsedRecords) {
    if (record.user_id !== normalizedUserID) {
      throw new Error("Birth profile record user_id does not match the current session user")
    }
  }

  const profiles = parsedRecords.map((record) => birthProfileFromCloudRecord(record))
  const selectedPrimaryID = profiles
    .filter((profile) => profile.isPrimary)
    .sort((first, second) => Date.parse(second.updatedAt) - Date.parse(first.updatedAt))[0]?.id

  return profiles.map((profile) =>
    birthProfileToCloudRecord(normalizedUserID, {
      ...profile,
      isPrimary: selectedPrimaryID ? profile.id === selectedPrimaryID : profile.isPrimary,
    })
  )
}
