import { createServerFn } from "@tanstack/react-start"
import { UserService } from "@/services/user.service"
import { profileSessionMiddleware } from "@/shared/middleware/auth.middleware"
import type { UserInfo } from "@/shared/types/user"

const DEFAULT_USER_INFO: UserInfo = {
  user: null,
  payment: { activePlan: null, activeSubscription: null },
}

export const getUserInfoFn = createServerFn({ method: "GET" })
  .middleware([profileSessionMiddleware])
  .handler(async ({ context }): Promise<UserInfo> => {
    try {
      const userId = context.session?.user.id

      if (!userId) {
        return DEFAULT_USER_INFO
      }

      const userService = new UserService()
      return userService.getUserInfo(userId)
    } catch (error) {
      console.error("[getUserInfoFn] Failed to fetch user info:", error)
      return DEFAULT_USER_INFO
    }
  })
