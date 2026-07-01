import dotenv from 'dotenv'
import mysql, { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import path from 'node:path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.development') })

const applyMigration = process.argv.includes('--apply')
const requiredEnv = ['HOST', 'USER_NAME', 'PASSWORD', 'DB'] as const

for (const key of requiredEnv) {
  if (!process.env[key]) throw new Error(`Missing ${key} in .env.development`)
}

const connection = await mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER_NAME,
  password: process.env.PASSWORD,
  database: process.env.DB,
})

const queryRows = async (sql: string, values: unknown[] = []) => {
  const [rows] = await connection.query<RowDataPacket[]>(sql, values)
  return rows
}

const getColumnState = () =>
  queryRows(
    `
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'request_approval_log'
        AND COLUMN_NAME IN ('DESCRIPTION', 'REJECT_REASON')
      ORDER BY ORDINAL_POSITION
    `
  )

const getIndexState = () =>
  queryRows(
    `
      SELECT INDEX_NAME, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS COLUMNS
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'request_approval_log'
        AND INDEX_NAME = 'idx_request_approval_log_reject_reason'
      GROUP BY INDEX_NAME
    `
  )

try {
  const beforeColumns = await getColumnState()
  const beforeIndexes = await getIndexState()

  console.log('\nrequest_approval_log reject reason column state')
  console.table(beforeColumns)
  console.log('\nrequest_approval_log reject reason index state')
  console.table(beforeIndexes)

  if (!applyMigration) {
    console.log('\nInspect only. Run db:reject-reason:apply to add/backfill REJECT_REASON.')
    process.exitCode = 0
  } else {
    const hasRejectReason = beforeColumns.some((row) => String(row.COLUMN_NAME) === 'REJECT_REASON')
    const hasRejectReasonIndex = beforeIndexes.length > 0

    if (!hasRejectReason) {
      await connection.query(`
        ALTER TABLE request_approval_log
          ADD COLUMN REJECT_REASON VARCHAR(500) NULL AFTER DESCRIPTION
      `)
      console.log('Added request_approval_log.REJECT_REASON')
    } else {
      await connection.query(`
        ALTER TABLE request_approval_log
          MODIFY COLUMN REJECT_REASON VARCHAR(500) NULL
      `)
      console.log('Ensured request_approval_log.REJECT_REASON is VARCHAR(500) NULL')
    }

    if (!hasRejectReasonIndex) {
      await connection.query(`
        ALTER TABLE request_approval_log
          ADD KEY idx_request_approval_log_reject_reason (REQUEST_REGISTER_VENDOR_ID, ACTION_TYPE, CREATE_DATE)
      `)
      console.log('Added idx_request_approval_log_reject_reason')
    }

    const [backfillResult] = await connection.query<ResultSetHeader>(`
      UPDATE request_approval_log
      SET REJECT_REASON = NULLIF(DESCRIPTION, '')
      WHERE LOWER(ACTION_TYPE) IN ('rejected', 'vendor_disagreed')
        AND (REJECT_REASON IS NULL OR TRIM(REJECT_REASON) = '')
    `)
    console.log(`Backfilled reject reasons: ${backfillResult.affectedRows}`)

    const afterColumns = await getColumnState()
    const afterIndexes = await getIndexState()
    console.log('\nrequest_approval_log reject reason column state after migration')
    console.table(afterColumns)
    console.log('\nrequest_approval_log reject reason index state after migration')
    console.table(afterIndexes)
  }
} finally {
  await connection.end()
}