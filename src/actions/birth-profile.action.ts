import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import {
  type BirthProfileCloudRecord,
  birthProfileCloudRecordSchema,
} from "@/features/profiles/domain"
import { profileSessionMiddleware } from "@/shared/middleware/auth.middleware"

const upsertBirthProfilesInputSchema = z.array(birthProfileCloudRecordSchema).max(100)
const deleteBirthProfileInputSchema = z.object({
  profileID: z.string().uuid(),
})

export const listBirthProfiles = createServerFn({ method: "GET" })
  .middleware([profileSessionMiddleware])
  .handler(async ({ context }): Promise<BirthProfileCloudRecord[]> => {
    const userId = context.session?.user.id

    if (!userId) {
      return []
    }

    const { BirthProfileService } = await import("@/services/birth-profile.service")
    const service = new BirthProfileService()

    return service.listBirthProfiles(userId)
  })

export const upsertBirthProfiles = createServerFn({ method: "POST" })
  .middleware([profileSessionMiddleware])
  .validator((input: unknown) => upsertBirthProfilesInputSchema.parse(input))
  .handler(async ({ context, data }): Promise<BirthProfileCloudRecord[]> => {
    const userId = context.session?.user.id

    if (!userId) {
      throw new Error("Unauthorized")
    }

    const { BirthProfileService } = await import("@/services/birth-profile.service")
    const service = new BirthProfileService()

    return service.upsertBirthProfiles(userId, data)
  })

export const deleteBirthProfile = createServerFn({ method: "POST" })
  .middleware([profileSessionMiddleware])
  .validator((input: unknown) => deleteBirthProfileInputSchema.parse(input))
  .handler(async ({ context, data }): Promise<BirthProfileCloudRecord[]> => {
    const userId = context.session?.user.id

    if (!userId) {
      throw new Error("Unauthorized")
    }

    const { BirthProfileService } = await import("@/services/birth-profile.service")
    const service = new BirthProfileService()

    return service.deleteBirthProfile(userId, data.profileID)
  })
