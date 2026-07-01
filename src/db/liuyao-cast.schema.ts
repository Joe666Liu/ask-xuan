import { index, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core"

type LiuyaoCoinThrowJson = {
  id: string
  faces: number[]
}

export const userLiuyaoCast = pgTable(
  "user_liuyao_casts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    question: text("question").notNull(),
    coinThrows: jsonb("coin_throws").$type<LiuyaoCoinThrowJson[]>().notNull(),
    lowerTrigram: text("lower_trigram"),
    upperTrigram: text("upper_trigram"),
    hexagramTitle: text("hexagram_title").notNull(),
    resultOutput: text("result_output").notNull(),
    runId: text("run_id").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("user_liuyao_casts_user_completed_at_idx").on(table.userId, table.completedAt),
    uniqueIndex("user_liuyao_casts_user_run_id_idx").on(table.userId, table.runId),
  ]
)
