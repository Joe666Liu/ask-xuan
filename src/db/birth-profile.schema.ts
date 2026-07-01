import { sql } from "drizzle-orm"
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const userBirthProfileRecord = pgTable(
  "user_birth_profile_records",
  {
    userId: uuid("user_id").notNull(),
    profileId: uuid("profile_id").notNull(),
    ownerKind: text("owner_kind").notNull().default("other"),
    displayName: text("display_name").notNull().default(""),
    relationNote: text("relation_note").notNull().default(""),
    name: text("name").notNull().default(""),
    gender: smallint("gender").notNull(),
    calendarKind: text("calendar_kind").notNull(),
    solarBirthAt: timestamp("solar_birth_at", { withTimezone: true }).notNull(),
    lunarYear: integer("lunar_year").notNull(),
    lunarMonth: integer("lunar_month").notNull(),
    lunarDay: integer("lunar_day").notNull(),
    lunarHour: integer("lunar_hour").notNull(),
    lunarMinute: integer("lunar_minute").notNull(),
    lunarSecond: integer("lunar_second").notNull(),
    birthPlace: text("birth_place").notNull().default(""),
    birthPlaceLabel: text("birth_place_label"),
    birthPlaceLatitude: doublePrecision("birth_place_latitude"),
    birthPlaceLongitude: doublePrecision("birth_place_longitude"),
    birthPlaceTimezone: text("birth_place_timezone"),
    birthPlaceSource: text("birth_place_source"),
    birthPlaceProviderPlaceId: text("birth_place_provider_place_id"),
    usesTrueSolarTime: boolean("uses_true_solar_time").notNull().default(false),
    isPrimary: boolean("is_primary").notNull().default(false),
    source: text("source").notNull().default("manual"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.profileId],
      name: "user_birth_profile_records_pkey",
    }),
    uniqueIndex("user_birth_profile_records_one_primary")
      .on(table.userId)
      .where(sql`${table.isPrimary}`),
    index("user_birth_profile_records_user_updated_at_idx").on(table.userId, table.updatedAt),
  ]
)
