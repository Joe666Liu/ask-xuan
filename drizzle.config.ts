import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: ['.env.local', '.env'] })

export default defineConfig({
  out: './drizzle',
  schema: './src/db/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: (process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL)!,
  },
})
