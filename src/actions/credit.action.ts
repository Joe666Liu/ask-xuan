import { createServerFn } from "@tanstack/react-start"
import { asc, eq } from "drizzle-orm"
import { creditPackage, db } from "@/db"
import { CreditService } from "@/services/credits.service"
import { profileSessionMiddleware } from "@/shared/middleware/auth.middleware"
import type { CreditPackage } from "@/shared/types/payment"
import type { UserCredits } from "@/shared/types/user"

const DEFAULT_CREDITS: UserCredits = {
  userCredits: 0,
  dailyBonusCredits: 0,
  nextRefreshTime: null,
}

export const getUserCreditsFn = createServerFn({ method: "GET" })
  .middleware([profileSessionMiddleware])
  .handler(async ({ context }): Promise<UserCredits> => {
    try {
      const userId = context.session?.user.id

      if (!userId) {
        return DEFAULT_CREDITS
      }

      const creditService = new CreditService()
      return creditService.getUserCredits(userId)
    } catch (error) {
      console.error("[getUserCreditsFn] Failed to fetch credits:", error)
      return DEFAULT_CREDITS
    }
  })

export const getCreditPackagesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CreditPackage[]> => {
    try {
      return await db
        .select()
        .from(creditPackage)
        .where(eq(creditPackage.isActive, true))
        .orderBy(asc(creditPackage.sortOrder))
    } catch (error) {
      console.error("[getCreditPackagesFn] Failed to fetch credit packages:", error)
      return []
    }
  }
)
