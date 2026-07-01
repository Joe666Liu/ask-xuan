import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouterState } from "@tanstack/react-router"
import { createContext, type ReactNode, useCallback, useContext, useMemo } from "react"
import type { PublicConfig } from "@/config/dynamic-config"
import {
  configQueryOptions,
  userCreditsQueryOptions,
  userInfoQueryOptions,
} from "@/shared/lib/queries/app-queries"
import type { UserCredits, UserInfo } from "@/shared/types/user"

type GlobalContextType = {
  config: PublicConfig | null
  userInfo: UserInfo | null
  credits: UserCredits | null
  isLoadingConfig: boolean
  isLoadingUserInfo: boolean
  isLoadingCredits: boolean
  refreshConfig: () => Promise<void>
  refreshUserInfo: () => Promise<void>
  refreshCredits: () => Promise<void>
  clearUserInfo: () => void
}

const GlobalContext = createContext<GlobalContextType | null>(null)

export const useGlobalContext = () => {
  const context = useContext(GlobalContext)
  if (!context) {
    throw new Error("useGlobalContext must be used within GlobalContextProvider")
  }
  return context
}

export const GlobalContextProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const shouldLoadAccountData = !/(^|\/)admin(\/|$)/.test(pathname)

  const { data: config, isLoading: isLoadingConfig } = useQuery(configQueryOptions())

  const { data: userInfo, isLoading: isLoadingUserInfo } = useQuery({
    ...userInfoQueryOptions(),
    enabled: shouldLoadAccountData,
  })

  const { data: credits, isLoading: isLoadingCredits } = useQuery({
    ...userCreditsQueryOptions(),
    enabled: shouldLoadAccountData,
  })

  const refreshConfig = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["config"] })
  }, [queryClient])

  const refreshUserInfo = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["userInfo"] })
  }, [queryClient])

  const refreshCredits = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["credits"] })
  }, [queryClient])

  const clearUserInfo = useCallback(() => {
    queryClient.setQueryData(["userInfo"], null)
  }, [queryClient])

  const value = useMemo(
    () => ({
      config: config ?? null,
      userInfo: userInfo ?? null,
      credits: credits ?? null,
      isLoadingConfig,
      isLoadingUserInfo: shouldLoadAccountData ? isLoadingUserInfo : false,
      isLoadingCredits: shouldLoadAccountData ? isLoadingCredits : false,
      refreshConfig,
      refreshUserInfo,
      refreshCredits,
      clearUserInfo,
    }),
    [
      config,
      userInfo,
      credits,
      isLoadingConfig,
      isLoadingUserInfo,
      isLoadingCredits,
      shouldLoadAccountData,
      refreshConfig,
      refreshUserInfo,
      refreshCredits,
      clearUserInfo,
    ]
  )

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
}
