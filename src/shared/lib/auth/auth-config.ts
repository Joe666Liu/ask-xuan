import { createServerFn } from "@tanstack/react-start"
import { getSupabaseConfig } from "./supabase-config"

// 服务端同步检查（给 middleware、auth-server 等纯服务端代码使用）
export const isAuthConfigured = !!getSupabaseConfig()

// Server function: 通过 loader 传递给客户端
export const getIsAuthEnabled = createServerFn({ method: "GET" }).handler(() => {
  return isAuthConfigured
})
