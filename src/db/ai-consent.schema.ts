import { sql } from "drizzle-orm"
import { boolean, check, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const userConsent = pgTable(
  "user_consents",
  {
    userId: uuid("user_id").notNull(),
    consentType: text("consent_type").notNull(),
    consentVersion: text("consent_version").notNull(),
    isGranted: boolean("is_granted").notNull().default(false),
    grantedAt: timestamp("granted_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    source: text("source").notNull(),
    locale: text("locale"),
    region: text("region"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.consentType],
      name: "user_consents_pkey",
    }),
    check(
      "user_consents_type_check",
      sql`${table.consentType} in ('ai_interpretation', 'china_model_provider')`
    ),
    check(
      "user_consents_state_check",
      sql`(${table.isGranted} = true and ${table.grantedAt} is not null and ${table.revokedAt} is null)
        or (${table.isGranted} = false and ${table.revokedAt} is not null)`
    ),
  ]
)
