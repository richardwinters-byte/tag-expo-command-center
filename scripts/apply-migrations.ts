/**
 * One-shot migration runner.
 *
 * Reads DATABASE_URL from .env.local, then runs every file in
 * supabase/migrations/*.sql in lexicographic (numeric) order.
 * Each file is wrapped in a transaction so a failure in the middle
 * rolls back that file cleanly; previously-completed files stay applied.
 *
 * Idempotent overall: the SQL files themselves use ON CONFLICT DO NOTHING
 * or guarded CREATE statements where appropriate.
 *
 * Usage: npx tsx scripts/apply-migrations.ts
 */
import { config } from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { Client } from 'pg';

config({ path: path.resolve(process.cwd(), '.env.local') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('Missing DATABASE_URL in .env.local');
  process.exit(1);
}

async function main() {
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration files in ${migrationsDir}`);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    for (const file of files) {
      const fullPath = path.join(migrationsDir, file);
      const sql = readFileSync(fullPath, 'utf8');
      process.stdout.write(`-> ${file} ... `);
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log('OK');
      } catch (err) {
        await client.query('ROLLBACK');
        console.log('FAILED');
        console.error(`\nError applying ${file}:`);
        console.error(err);
        process.exit(1);
      }
    }

    const tablesResult = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log(`\nTables in public schema (${tablesResult.rows.length}):`);
    for (const row of tablesResult.rows) {
      console.log(`  - ${row.table_name}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
