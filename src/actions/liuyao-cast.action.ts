import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { type LiuyaoCastCloudRecord, liuyaoCastCloudRecordSchema } from "@/features/liuyao/domain"
import { profileSessionMiddleware } from "@/shared/middleware/auth.middleware"

const listLiuyaoCastsInputSchema = z
  .object({
    includeDeleted: z.boolean().default(false),
  })
  .optional()
const upsertLiuyaoCastsInputSchema = z.array(liuyaoCastCloudRecordSchema).max(100)
const deleteLiuyaoCastInputSchema = z.object({
  castID: z.string().uuid(),
})

export const listLiuyaoCasts = createServerFn({ method: "GET" })
  .middleware([profileSessionMiddleware])
  .validator((input: unknown) => listLiuyaoCastsInputSchema.parse(input))
  .handler(async ({ context, data }): Promise<LiuyaoCastCloudRecord[]> => {
    const userId = context.session?.user.id

    if (!userId) {
      return []
    }

    const { LiuyaoCastService } = await import("@/services/liuyao-cast.service")
    const service = new LiuyaoCastService()

    return service.listCasts(userId, data?.includeDeleted ?? false)
  })

export const upsertLiuyaoCasts = createServerFn({ method: "POST" })
  .middleware([profileSessionMiddleware])
  .validator((input: unknown) => upsertLiuyaoCastsInputSchema.parse(input))
  .handler(async ({ context, data }): Promise<LiuyaoCastCloudRecord[]> => {
    const userId = context.session?.user.id

    if (!userId) {
      throw new Error("Unauthorized")
    }

    const { LiuyaoCastService } = await import("@/services/liuyao-cast.service")
    const service = new LiuyaoCastService()

    return service.upsertCasts(userId, data)
  })

export const softDeleteLiuyaoCast = createServerFn({ method: "POST" })
  .middleware([profileSessionMiddleware])
  .validator((input: unknown) => deleteLiuyaoCastInputSchema.parse(input))
  .handler(async ({ context, data }): Promise<LiuyaoCastCloudRecord[]> => {
    const userId = context.session?.user.id

    if (!userId) {
      throw new Error("Unauthorized")
    }

    const { LiuyaoCastService } = await import("@/services/liuyao-cast.service")
    const service = new LiuyaoCastService()

    return service.softDeleteCast(userId, data.castID)
  })
