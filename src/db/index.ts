import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"

export * from "./ai-consent.schema"
export * from "./auth.schema"
export * from "./birth-profile.schema"
export * from "./config.schema"
export * from "./credit.schema"
export * from "./liuyao-cast.schema"
export * from "./order.schema"
export * from "./payment.schema"
export * from "./rbac.schema"
export * from "./subscription.schema"
export * from "./waitlist.schema"

import * as aiConsentSchema from "./ai-consent.schema"
import * as authSchema from "./auth.schema"
import * as birthProfileSchema from "./birth-profile.schema"
import * as configSchema from "./config.schema"
import * as creditSchema from "./credit.schema"
import * as liuyaoCastSchema from "./liuyao-cast.schema"
import * as orderSchema from "./order.schema"
import * as paymentSchema from "./payment.schema"
import * as rbacSchema from "./rbac.schema"
import * as subscriptionSchema from "./subscription.schema"
import * as waitlistSchema from "./waitlist.schema"

const schema = {
  ...aiConsentSchema,
  ...authSchema,
  ...birthProfileSchema,
  ...configSchema,
  ...creditSchema,
  ...liuyaoCastSchema,
  ...orderSchema,
  ...subscriptionSchema,
  ...paymentSchema,
  ...rbacSchema,
  ...waitlistSchema,
}

export type DbSchema = typeof schema
export type Database = PostgresJsDatabase<DbSchema>
export type DbTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0]

let _db: Database | null = null
let _client: postgres.Sql | null = null

export function isDatabaseEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

export function getDb(): Database | null {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    return null
  }
  if (!_db) {
    _client = postgres(databaseUrl, { prepare: false })
    _db = drizzle(_client, { schema })
  }
  return _db
}

export function requireDb(): Database {
  const database = getDb()
  if (!database) {
    throw new Error("Database is not configured. Please set DATABASE_URL environment variable.")
  }
  return database
}

export async function closeDb(): Promise<void> {
  if (_client) {
    await _client.end()
    _client = null
    _db = null
  }
}

export const db = new Proxy({} as Database, {
  get(_, prop) {
    return requireDb()[prop as keyof Database]
  },
})
