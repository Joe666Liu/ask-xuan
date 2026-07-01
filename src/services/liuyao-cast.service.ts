import { z } from "zod"
import {
  type LiuyaoCastCloudRecord,
  liuyaoCastCloudRecordSchema,
  mergeLiuyaoCastCloudRecords,
} from "@/features/liuyao/domain"
import {
  findLiuyaoCastRecordsByUserId,
  softDeleteLiuyaoCastRecord,
  upsertLiuyaoCastRecords,
} from "@/shared/model/liuyao-cast.model"

export class LiuyaoCastService {
  async listCasts(userId: string, includeDeleted = false): Promise<LiuyaoCastCloudRecord[]> {
    const userID = z.string().uuid().parse(userId)
    return findLiuyaoCastRecordsByUserId(userID, { includeDeleted })
  }

  async upsertCasts(
    userId: string,
    records: LiuyaoCastCloudRecord[]
  ): Promise<LiuyaoCastCloudRecord[]> {
    const userID = z.string().uuid().parse(userId)
    const normalizedRecords = normalizeLiuyaoCastRecordsForUser(userID, records)

    await upsertLiuyaoCastRecords(normalizedRecords)
    return findLiuyaoCastRecordsByUserId(userID)
  }

  async softDeleteCast(userId: string, castID: string): Promise<LiuyaoCastCloudRecord[]> {
    const userID = z.string().uuid().parse(userId)
    const normalizedCastID = z.string().uuid().parse(castID)

    await softDeleteLiuyaoCastRecord(userID, normalizedCastID)
    return findLiuyaoCastRecordsByUserId(userID)
  }
}

export function normalizeLiuyaoCastRecordsForUser(
  userID: string,
  records: LiuyaoCastCloudRecord[]
): LiuyaoCastCloudRecord[] {
  const normalizedUserID = z.string().uuid().parse(userID)
  const parsedRecords = z.array(liuyaoCastCloudRecordSchema).parse(records)

  for (const record of parsedRecords) {
    if (record.user_id !== normalizedUserID) {
      throw new Error("Liuyao cast record user_id does not match the current session user")
    }
  }

  return mergeLiuyaoCastCloudRecords(parsedRecords)
}
