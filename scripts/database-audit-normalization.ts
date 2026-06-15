import dotenv from 'dotenv'
import mysql, { RowDataPacket } from 'mysql2/promise'
import path from 'node:path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.development') })

const applyMigration = process.argv.includes('--apply')
const snapshotBatch = '20260615_PHASE3_VENDOR_AUDIT'

const targetTables = [
  'assignees_to',
  'blacklist_us',
  'blacklist_cn',
  'blacklist_cn_aliases',
  'business_category',
  'info_currency',
  'm_request_status',
  'master_product_groups',
  'master_vendor_types',
  'request_approval_log',
  'request_approval_step',
  'request_assignment_history',
  'request_register_file',
  'request_register_vendor',
  'request_register_vendor_contacts',
  'request_vendor_gpr_c_action_required',
  'request_vendor_gpr_c_action_setup',
  'request_vendor_gpr_c_circular_members',
  'request_vendor_gpr_c_flows',
  'request_vendor_gpr_c_steps',
  'request_vendor_selections',
  'staging_prones_data',
  'vendor_contacts',
  'vendor_match_result',
  'vendor_products',
  'vendor_selection_criteria',
  'vendor_selection_financials',
  'vendors',
  'workflow_definition',
  'workflow_step_master',
  'workflow_transition',
] as const

const auditColumns = {
  DESCRIPTION: 'VARCHAR(100) NULL',
  CREATE_BY: "VARCHAR(50) NOT NULL DEFAULT 'SYSTEM'",
  UPDATE_BY: 'VARCHAR(50) NULL DEFAULT NULL',
  CREATE_DATE: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
  UPDATE_DATE: 'DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  INUSE: 'TINYINT(1) NOT NULL DEFAULT 1',
} as const

const requiredEnv = ['HOST', 'USER_NAME', 'PASSWORD', 'DB'] as const
for (const key of requiredEnv) {
  if (!process.env[key]) throw new Error(`Missing ${key} in .env.development`)
}

const connection = await mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER_NAME,
  password: process.env.PASSWORD,
  database: process.env.DB,
  multipleStatements: true,
})

const quoteIdentifier = (value: string) => `\`${value.replaceAll('`', '``')}\``
const tableListSql = targetTables.map((table) => `'${table}'`).join(', ')

const queryRows = async (sql: string, values: unknown[] = []) => {
  const [rows] = await connection.query<RowDataPacket[]>(sql, values)
  return rows
}

const inspectAuditColumns = () =>
  queryRows(`
    SELECT
      t.TABLE_NAME,
      SUM(c.COLUMN_NAME = 'DESCRIPTION') AS has_description,
      SUM(c.COLUMN_NAME = 'CREATE_BY') AS has_create_by,
      SUM(c.COLUMN_NAME = 'UPDATE_BY') AS has_update_by,
      SUM(c.COLUMN_NAME = 'CREATE_DATE') AS has_create_date,
      SUM(c.COLUMN_NAME = 'UPDATE_DATE') AS has_update_date,
      SUM(c.COLUMN_NAME = 'INUSE') AS has_inuse,
      GROUP_CONCAT(
        CONCAT(c.COLUMN_NAME, ' ', c.COLUMN_TYPE)
        ORDER BY FIELD(
          c.COLUMN_NAME,
          'DESCRIPTION',
          'CREATE_BY',
          'UPDATE_BY',
          'CREATE_DATE',
          'UPDATE_DATE',
          'INUSE'
        )
        SEPARATOR ', '
      ) AS current_definition
    FROM information_schema.TABLES t
    LEFT JOIN information_schema.COLUMNS c
      ON c.TABLE_SCHEMA = t.TABLE_SCHEMA
     AND c.TABLE_NAME = t.TABLE_NAME
     AND c.COLUMN_NAME IN (
       'DESCRIPTION',
       'CREATE_BY',
       'UPDATE_BY',
       'CREATE_DATE',
       'UPDATE_DATE',
       'INUSE'
     )
    WHERE t.TABLE_SCHEMA = DATABASE()
      AND t.TABLE_TYPE = 'BASE TABLE'
      AND t.TABLE_NAME IN (${tableListSql})
    GROUP BY t.TABLE_NAME
    ORDER BY t.TABLE_NAME
  `)

const createSchemaSnapshot = async () => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS zz_backup_audit_column_schema_20260615 (
      SNAPSHOT_BATCH VARCHAR(64) NOT NULL,
      TABLE_NAME VARCHAR(64) NOT NULL,
      COLUMN_NAME VARCHAR(64) NOT NULL,
      ORDINAL_POSITION INT NOT NULL,
      COLUMN_TYPE TEXT NOT NULL,
      IS_NULLABLE VARCHAR(3) NOT NULL,
      COLUMN_DEFAULT TEXT NULL,
      EXTRA VARCHAR(255) NULL,
      SNAPSHOT_DATE DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (SNAPSHOT_BATCH, TABLE_NAME, COLUMN_NAME)
    )
  `)
  await connection.query(
    `
      INSERT IGNORE INTO zz_backup_audit_column_schema_20260615 (
        SNAPSHOT_BATCH,
        TABLE_NAME,
        COLUMN_NAME,
        ORDINAL_POSITION,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        EXTRA
      )
      SELECT
        ?,
        TABLE_NAME,
        COLUMN_NAME,
        ORDINAL_POSITION,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        EXTRA
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN (${tableListSql})
    `,
    [snapshotBatch]
  )
}

const runPreflight = async () => {
  const existingTables = await queryRows(`
    SELECT TABLE_NAME
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_TYPE = 'BASE TABLE'
      AND TABLE_NAME IN (${tableListSql})
  `)
  const existingNames = new Set(existingTables.map((row) => String(row.TABLE_NAME)))
  const missingTables = targetTables.filter((table) => !existingNames.has(table))
  if (missingTables.length > 0) {
    throw new Error(`Missing audit target tables: ${missingTables.join(', ')}`)
  }

  const blockers: Array<{ table_name: string; issue: string; value: number }> = []
  for (const table of targetTables) {
    const columns = await queryRows(
      `
        SELECT COLUMN_NAME
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME IN ('DESCRIPTION', 'INUSE')
      `,
      [table]
    )
    const names = new Set(columns.map((row) => String(row.COLUMN_NAME)))

    if (names.has('DESCRIPTION')) {
      const rows = await queryRows(
        `SELECT COUNT(*) AS issue_count FROM ${quoteIdentifier(table)}
         WHERE CHAR_LENGTH(DESCRIPTION) > 100`
      )
      const count = Number(rows[0]?.issue_count || 0)
      if (count > 0) blockers.push({ table_name: table, issue: 'description_over_100', value: count })
    }

    if (names.has('INUSE')) {
      const rows = await queryRows(
        `SELECT COUNT(*) AS issue_count FROM ${quoteIdentifier(table)}
         WHERE INUSE IS NOT NULL AND INUSE NOT IN (0, 1)`
      )
      const count = Number(rows[0]?.issue_count || 0)
      if (count > 0) blockers.push({ table_name: table, issue: 'invalid_inuse', value: count })
    }
  }

  console.log('\nAudit normalization preflight')
  console.table(blockers)
  if (blockers.length > 0) {
    throw new Error('Audit normalization blocked by incompatible existing data')
  }
}

const ensureAuditColumns = async (table: string) => {
  const existingColumns = await queryRows(
    `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME IN (
          'DESCRIPTION',
          'CREATE_BY',
          'UPDATE_BY',
          'CREATE_DATE',
          'UPDATE_DATE',
          'INUSE'
        )
    `,
    [table]
  )
  const existingNames = new Set(existingColumns.map((row) => String(row.COLUMN_NAME)))

  for (const [column, definition] of Object.entries(auditColumns)) {
    if (!existingNames.has(column)) {
      await connection.query(
        `ALTER TABLE ${quoteIdentifier(table)}
         ADD COLUMN ${quoteIdentifier(column)} ${definition}`
      )
    }
  }

  await connection.query(`
    UPDATE ${quoteIdentifier(table)}
    SET
      CREATE_BY = COALESCE(NULLIF(TRIM(CREATE_BY), ''), 'SYSTEM'),
      UPDATE_BY = COALESCE(NULLIF(TRIM(UPDATE_BY), ''), NULLIF(TRIM(CREATE_BY), ''), 'SYSTEM'),
      CREATE_DATE = COALESCE(CREATE_DATE, CURRENT_TIMESTAMP),
      UPDATE_DATE = COALESCE(UPDATE_DATE, CREATE_DATE, CURRENT_TIMESTAMP),
      INUSE = CASE WHEN INUSE = 0 THEN 0 ELSE 1 END
  `)

  const modifySql = Object.entries(auditColumns)
    .map(([column, definition]) => `MODIFY COLUMN ${quoteIdentifier(column)} ${definition}`)
    .join(',\n')
  await connection.query(`ALTER TABLE ${quoteIdentifier(table)}\n${modifySql}`)
}

const backfillDescriptions = async () => {
  const statements = [
    "UPDATE assignees_to SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(CONCAT(GROUP_NAME, ': ', COALESCE(EMPNAME, EMPCODE)), 100))",
    "UPDATE info_currency SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(CURRENCY_NAME, 100))",
    "UPDATE m_request_status SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(STATUS_LABEL, 100))",
    "UPDATE master_product_groups SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(GROUP_NAME, 100))",
    "UPDATE master_vendor_types SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(NAME, 100))",
    "UPDATE request_approval_log SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(REMARK, 100)), CREATE_BY = ACTION_BY, UPDATE_BY = ACTION_BY, CREATE_DATE = ACTION_DATE, UPDATE_DATE = ACTION_DATE",
    "UPDATE request_register_file SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(FILE_NAME, 100))",
    "UPDATE request_register_vendor SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(REQUESTER_REMARK, 100))",
    "UPDATE request_vendor_gpr_c_action_setup SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(CONCAT(STAGE_CODE, ': ', COALESCE(RESULT_NOTE, '')), 100))",
    "UPDATE request_vendor_gpr_c_circular_members SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(COALESCE(MEMBER_NAME, EMAIL), 100))",
    "UPDATE request_vendor_gpr_c_flows SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(COALESCE(CURRENT_STEP_CODE, FLOW_STATUS), 100))",
    "UPDATE request_vendor_gpr_c_steps SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(STEP_CODE, 100))",
    "UPDATE request_vendor_selections SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(SUGGESTION, 100))",
    "UPDATE staging_prones_data SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(CUSTOMER_NAME, 100))",
    "UPDATE vendor_contacts SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(CONTACT_NAME, 100))",
    "UPDATE vendor_match_result SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(MATCH_METHOD, 100)), CREATE_DATE = COALESCE(LAST_UPDATED, CREATE_DATE), UPDATE_DATE = COALESCE(LAST_UPDATED, UPDATE_DATE)",
    "UPDATE vendor_products SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(CONCAT_WS(' / ', PRODUCT_NAME, MAKER_NAME, MODEL_LIST), 100))",
    "UPDATE vendor_selection_criteria SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(COALESCE(REMARK, CRITERIA_VALUE), 100))",
    "UPDATE vendor_selection_financials SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(CONCAT('Financial year ', YEAR), 100))",
    "UPDATE vendors SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(COALESCE(NOTE, COMPANY_NAME), 100))",
    "UPDATE workflow_definition SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(WORKFLOW_NAME, 100)), INUSE = IS_ACTIVE",
    "UPDATE workflow_step_master SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(STEP_CODE, 100)), INUSE = IS_ACTIVE",
    "UPDATE workflow_transition SET DESCRIPTION = COALESCE(DESCRIPTION, LEFT(ACTION_CODE, 100)), INUSE = IS_ACTIVE",
  ]
  for (const statement of statements) await connection.query(statement)
}

try {
  await runPreflight()

  if (!applyMigration) {
    const state = await inspectAuditColumns()
    console.log('\nVendor audit column state')
    console.table(state)
    console.log('\nPreflight passed. Run db:audit:apply to normalize the database.')
  } else {
    await createSchemaSnapshot()
    for (const table of targetTables) {
      await ensureAuditColumns(table)
      console.log(`Normalized audit columns: ${table}`)
    }
    await backfillDescriptions()

    const state = await inspectAuditColumns()
    console.log('\nVendor audit column state after migration')
    console.table(state)
  }
} finally {
  await connection.end()
}
