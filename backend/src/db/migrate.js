import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import sql from './client.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, 'migrations')

export async function runMigrations() {
  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `

  const files = (await readdir(MIGRATIONS_DIR))
    .filter(f => f.endsWith('.sql'))
    .sort()

  for (const filename of files) {
    const [already] = await sql`
      SELECT 1 FROM _migrations WHERE filename = ${filename}
    `
    if (already) continue

    const sql_text = await readFile(join(MIGRATIONS_DIR, filename), 'utf8')
    await sql.unsafe(sql_text)
    await sql`INSERT INTO _migrations (filename) VALUES (${filename})`
    console.log(`[migrate] Applied: ${filename}`)
  }
}
