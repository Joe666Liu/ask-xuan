import { queryOptions } from "@tanstack/react-query"
import { getConfigFn } from "@/actions/config.action"
import { getCreditPackagesFn, getUserCreditsFn } from "@/actions/credit.action"
import { getUserInfoFn } from "@/actions/user.action"

export const configQueryOptions = () =>
  queryOptions({
    queryKey: ["config"],
    queryFn: () => getConfigFn(),
    staleTime: 60 * 1000,
  })

export const userInfoQueryOptions = () =>
  queryOptions({
    queryKey: ["userInfo"],
    queryFn: () => getUserInfoFn(),
    staleTime: 5 * 60 * 1000,
  })

export const userCreditsQueryOptions = () =>
  queryOptions({
    queryKey: ["credits"],
    queryFn: () => getUserCreditsFn(),
    staleTime: 30 * 1000,
  })

export const creditPackagesQueryOptions = () =>
  queryOptions({
    queryKey: ["credit-packages"],
    queryFn: () => getCreditPackagesFn(),
    staleTime: 5 * 60 * 1000,
  })
