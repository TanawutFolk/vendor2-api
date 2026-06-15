import fs from 'node:fs/promises'
import path from 'node:path'
import dotenv from 'dotenv'
import mysql, { RowDataPacket } from 'mysql2/promise'

dotenv.config({ path: path.resolve(process.cwd(), '.env.development') })

const applyMigration = process.argv.includes('--apply')
const resumeMigration = process.argv.includes('--resume')
const inspectSchema = process.argv.includes('--schema')
const repairGprForeignKeys = process.argv.includes('--repair-gpr-fks')
const repairApprovalStep = process.argv.includes('--repair-approval-step')
const applyGprSetupNormalization = process.argv.includes('--apply-gpr-setup')

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

const queryRows = async (sql: string) => {
  const [rows] = await connection.query<RowDataPacket[]>(sql)
  return rows
}

const printRows = (title: string, rows: RowDataPacket[]) => {
  console.log(`\n${title}`)
  console.table(rows)
}

try {
  if (applyGprSetupNormalization) {
    const migrationPath = path.resolve(
      process.cwd(),
      'database_normalization_phase2_gpr_setup.sql'
    )
    const migrationSql = await fs.readFile(migrationPath, 'utf8')
    const [migrationResult] = await connection.query(migrationSql)
    console.log('GPR setup normalization executed.')
    if (Array.isArray(migrationResult)) {
      const finalResult = migrationResult.at(-1)
      if (Array.isArray(finalResult)) console.table(finalResult)
    }
  } else if (repairApprovalStep) {
    const statements = [
      {
        name: 'backfill_workflow_step_id',
        sql: `UPDATE request_approval_step ras
          JOIN workflow_step_master wsm ON wsm.STATUS_ID = ras.STATUS_ID
          SET ras.WORKFLOW_STEP_ID = wsm.WORKFLOW_STEP_ID`,
      },
      {
        name: 'workflow_step_id_not_null',
        sql: `ALTER TABLE request_approval_step
          MODIFY COLUMN WORKFLOW_STEP_ID SMALLINT UNSIGNED NOT NULL`,
      },
      {
        name: 'uq_request_workflow_step',
        sql: `ALTER TABLE request_approval_step
          ADD CONSTRAINT uq_request_workflow_step UNIQUE (REQUEST_ID, WORKFLOW_STEP_ID)`,
      },
      {
        name: 'uq_request_step_pair',
        sql: `ALTER TABLE request_approval_step
          ADD CONSTRAINT uq_request_step_pair UNIQUE (REQUEST_ID, STEP_ID)`,
      },
      {
        name: 'idx_request_active_step',
        sql: `ALTER TABLE request_approval_step
          ADD KEY idx_request_active_step (REQUEST_ID, STEP_STATUS, INUSE)`,
      },
      {
        name: 'fk_request_approval_workflow_step',
        sql: `ALTER TABLE request_approval_step
          ADD CONSTRAINT fk_request_approval_workflow_step
          FOREIGN KEY (WORKFLOW_STEP_ID) REFERENCES workflow_step_master (WORKFLOW_STEP_ID)`,
      },
    ]

    for (const statement of statements) {
      await connection.query(statement.sql)
      console.log(`Applied ${statement.name}`)
    }
  } else if (repairGprForeignKeys) {
    const statements = [
      {
        name: 'fk_gpr_c_flow_request',
        sql: `ALTER TABLE request_vendor_gpr_c_flows
          ADD CONSTRAINT fk_gpr_c_flow_request
          FOREIGN KEY (REQUEST_ID) REFERENCES request_register_vendor (REQUEST_ID)`,
      },
      {
        name: 'fk_gpr_c_flow_selection',
        sql: `ALTER TABLE request_vendor_gpr_c_flows
          ADD CONSTRAINT fk_gpr_c_flow_selection
          FOREIGN KEY (SELECTION_ID) REFERENCES request_vendor_selections (SELECTION_ID)`,
      },
      {
        name: 'fk_gpr_c_step_flow',
        sql: `ALTER TABLE request_vendor_gpr_c_steps
          ADD CONSTRAINT fk_gpr_c_step_flow
          FOREIGN KEY (GPR_C_FLOW_ID) REFERENCES request_vendor_gpr_c_flows (GPR_C_FLOW_ID)`,
      },
      {
        name: 'fk_gpr_c_step_request',
        sql: `ALTER TABLE request_vendor_gpr_c_steps
          ADD CONSTRAINT fk_gpr_c_step_request
          FOREIGN KEY (REQUEST_ID) REFERENCES request_register_vendor (REQUEST_ID)`,
      },
      {
        name: 'fk_gpr_c_action_flow',
        sql: `ALTER TABLE request_vendor_gpr_c_action_required
          ADD CONSTRAINT fk_gpr_c_action_flow
          FOREIGN KEY (GPR_C_FLOW_ID) REFERENCES request_vendor_gpr_c_flows (GPR_C_FLOW_ID)`,
      },
      {
        name: 'fk_gpr_c_action_step',
        sql: `ALTER TABLE request_vendor_gpr_c_action_required
          ADD CONSTRAINT fk_gpr_c_action_step
          FOREIGN KEY (GPR_C_STEP_ID) REFERENCES request_vendor_gpr_c_steps (GPR_C_STEP_ID)`,
      },
      {
        name: 'fk_gpr_c_action_request',
        sql: `ALTER TABLE request_vendor_gpr_c_action_required
          ADD CONSTRAINT fk_gpr_c_action_request
          FOREIGN KEY (REQUEST_ID) REFERENCES request_register_vendor (REQUEST_ID)`,
      },
    ]

    for (const statement of statements) {
      await connection.query(statement.sql)
      console.log(`Added ${statement.name}`)
    }
  } else if (inspectSchema) {
    const columns = await queryRows(`
      SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN (
          'request_register_vendor',
          'vendor_contacts',
          'request_register_vendor_contacts',
          'request_register_file',
          'request_vendor_selections',
          'vendor_selection_criteria',
          'vendor_selection_financials',
          'request_assignment_history',
          'request_approval_step',
          'request_approval_log',
          'm_request_status',
          'request_vendor_gpr_c_flows',
          'request_vendor_gpr_c_steps',
          'request_vendor_gpr_c_action_required'
        )
        AND COLUMN_NAME LIKE '%ID'
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `)
    printRows('Normalization column state', columns)

    const tableState = await queryRows(`
      SELECT TABLE_NAME, ENGINE, TABLE_COLLATION
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN (
          'request_register_vendor',
          'vendor_contacts',
          'request_register_vendor_contacts',
          'request_vendor_selections',
          'request_vendor_gpr_c_flows',
          'request_vendor_gpr_c_steps',
          'request_vendor_gpr_c_action_required'
        )
      ORDER BY TABLE_NAME
    `)
    printRows('Contact table state', tableState)

    const contactIntegrity = await queryRows(`
      SELECT 'contact_bridge_missing_request' AS check_name, COUNT(*) AS issue_count
      FROM request_register_vendor_contacts rc
      LEFT JOIN request_register_vendor rr ON rr.REQUEST_ID = rc.REQUEST_ID
      WHERE rr.REQUEST_ID IS NULL
      UNION ALL
      SELECT 'contact_bridge_missing_contact', COUNT(*)
      FROM request_register_vendor_contacts rc
      LEFT JOIN vendor_contacts vc ON vc.VENDOR_CONTACT_ID = rc.VENDOR_CONTACT_ID
      WHERE vc.VENDOR_CONTACT_ID IS NULL
    `)
    printRows('Contact integrity state', contactIntegrity)

    for (const tableName of [
      'request_register_vendor',
      'request_vendor_selections',
      'request_vendor_gpr_c_flows',
    ]) {
      const createRows = await queryRows(`SHOW CREATE TABLE ${tableName}`)
      console.log(`\nDDL ${tableName}`)
      console.log(createRows[0]?.['Create Table'])
    }

    const objects = await queryRows(`
      SELECT TABLE_NAME, CONSTRAINT_NAME, CONSTRAINT_TYPE
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN (
          'request_register_vendor',
          'request_register_vendor_contacts',
          'request_register_file',
          'request_vendor_selections',
          'vendor_selection_criteria',
          'vendor_selection_financials',
          'request_assignment_history',
          'request_approval_step',
          'request_approval_log',
          'request_vendor_gpr_c_flows',
          'request_vendor_gpr_c_steps',
          'request_vendor_gpr_c_action_required',
          'workflow_definition',
          'workflow_step_master',
          'workflow_transition'
        )
      ORDER BY TABLE_NAME, CONSTRAINT_TYPE, CONSTRAINT_NAME
    `)
    printRows('Normalization constraint state', objects)

    const gprConstraintNames = await queryRows(`
      SELECT TABLE_NAME, CONSTRAINT_NAME, CONSTRAINT_TYPE
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
        AND CONSTRAINT_NAME LIKE 'fk_gpr_c%'
      ORDER BY TABLE_NAME, CONSTRAINT_NAME
    `)
    printRows('Existing GPR constraint names', gprConstraintNames)

    try {
      const innodbStatus = await queryRows('SHOW ENGINE INNODB STATUS')
      const statusText = String(innodbStatus[0]?.Status || '')
      const foreignKeyErrorIndex = statusText.indexOf('LATEST FOREIGN KEY ERROR')
      if (foreignKeyErrorIndex >= 0) {
        console.log('\nLatest InnoDB foreign key error')
        console.log(statusText.slice(foreignKeyErrorIndex, foreignKeyErrorIndex + 2500))
      }
    } catch {
      console.log('\nLatest InnoDB foreign key error is unavailable for this database user.')
    }
    process.exitCode = 0
  } else {
  const preflight = await queryRows(`
    SELECT 'duplicate_primary_contacts' AS check_name, COUNT(*) AS issue_count
    FROM (
      SELECT REQUEST_ID
      FROM request_register_vendor_contacts
      WHERE INUSE = 1 AND IS_PRIMARY = 1
      GROUP BY REQUEST_ID
      HAVING COUNT(*) > 1
    ) duplicate_rows
    UNION ALL
    SELECT 'multiple_active_steps', COUNT(*)
    FROM (
      SELECT REQUEST_ID
      FROM request_approval_step
      WHERE INUSE = 1 AND LOWER(STEP_STATUS) = 'in_progress'
      GROUP BY REQUEST_ID
      HAVING COUNT(*) > 1
    ) duplicate_rows
    UNION ALL
    SELECT 'duplicate_currency_names', COUNT(*)
    FROM (
      SELECT CURRENCY_NAME
      FROM info_currency
      GROUP BY CURRENCY_NAME
      HAVING COUNT(*) > 1
    ) duplicate_rows
    UNION ALL
    SELECT 'duplicate_selection_requests', COUNT(*)
    FROM (
      SELECT s.REQUEST_ID
      FROM request_vendor_selections s
      JOIN request_register_vendor rr ON rr.REQUEST_ID = s.REQUEST_ID
      GROUP BY s.REQUEST_ID
      HAVING COUNT(*) > 1
    ) duplicate_rows
    UNION ALL
    SELECT 'duplicate_financial_years', COUNT(*)
    FROM (
      SELECT f.SELECTION_ID, f.YEAR
      FROM vendor_selection_financials f
      JOIN request_vendor_selections s ON s.SELECTION_ID = f.SELECTION_ID
      JOIN request_register_vendor rr ON rr.REQUEST_ID = s.REQUEST_ID
      WHERE NOT (
        NULLIF(TRIM(f.YEAR), '') IS NULL
        AND f.TOTAL_REVENUE IS NULL
        AND f.NET_PROFIT IS NULL
      )
      GROUP BY f.SELECTION_ID, f.YEAR
      HAVING COUNT(*) > 1
    ) duplicate_rows
    UNION ALL
    SELECT 'duplicate_criteria_numbers', COUNT(*)
    FROM (
      SELECT c.SELECTION_ID, c.CRITERIA_NO
      FROM vendor_selection_criteria c
      JOIN request_vendor_selections s ON s.SELECTION_ID = c.SELECTION_ID
      JOIN request_register_vendor rr ON rr.REQUEST_ID = s.REQUEST_ID
      GROUP BY c.SELECTION_ID, c.CRITERIA_NO
      HAVING COUNT(*) > 1
    ) duplicate_rows
  `)

  printRows('Normalization preflight', preflight)

  const blockers = preflight.filter((row) => Number(row.issue_count) > 0)
  if (blockers.length > 0) {
    throw new Error(`Normalization blocked by: ${blockers.map((row) => row.check_name).join(', ')}`)
  }

  if (!applyMigration && !resumeMigration) {
    const approvalSteps = await queryRows(`
      SELECT REQUEST_ID, STEP_ID, STATUS_ID, STEP_ORDER, STEP_STATUS, STEP_CODE
      FROM request_approval_step
      ORDER BY REQUEST_ID, STEP_ORDER
    `)
    printRows('Approval steps', approvalSteps)
    console.log('\nPreflight passed. Run with --apply to execute database_normalization_phase1.sql.')
    process.exitCode = 0
  } else {
    const migrationPath = path.resolve(process.cwd(), 'database_normalization_phase1.sql')
    const fullMigrationSql = await fs.readFile(migrationPath, 'utf8')
    const resumeMarker = 'ALTER TABLE request_register_vendor_contacts\r\n    ADD KEY idx_request_primary_contact'
    const fallbackResumeMarker = 'ALTER TABLE request_register_vendor_contacts\n    ADD KEY idx_request_primary_contact'
    const resumeIndex = Math.max(
      fullMigrationSql.indexOf(resumeMarker),
      fullMigrationSql.indexOf(fallbackResumeMarker)
    )
    const migrationSql = resumeMigration
      ? fullMigrationSql.slice(resumeIndex)
      : fullMigrationSql

    if (resumeMigration && resumeIndex < 0) {
      throw new Error('Resume marker not found in database_normalization_phase1.sql')
    }
    const [migrationResult] = await connection.query(migrationSql)

    console.log(`\nMigration ${resumeMigration ? 'resumed' : 'executed'}.`)
    if (Array.isArray(migrationResult)) {
      const finalResult = migrationResult.at(-1)
      if (Array.isArray(finalResult)) console.table(finalResult)
    }

    const postflight = await queryRows(`
      SELECT
        rr.REQUEST_ID,
        rr.REQUEST_STATE,
        rr.CURRENT_STATUS_ID,
        rr.CURRENT_STEP_ID,
        ras.STEP_CODE AS current_step_code
      FROM request_register_vendor rr
      LEFT JOIN request_approval_step ras
        ON ras.REQUEST_ID = rr.REQUEST_ID
       AND ras.STEP_ID = rr.CURRENT_STEP_ID
      ORDER BY rr.REQUEST_ID
    `)
    printRows('Request workflow state after migration', postflight)
  }
  }
} finally {
  await connection.end()
}
