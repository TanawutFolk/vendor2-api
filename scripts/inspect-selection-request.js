const dotenv = require('dotenv')
const mysql = require('mysql2/promise')

dotenv.config({ path: '.env.development' })

const requestNumber = process.argv[2] || 'Selection-26-N003'

const connect = () =>
  mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER_NAME,
    password: process.env.PASSWORD,
    database: process.env.DB,
    port: Number(process.env.DB_PORT || 3306),
    charset: 'utf8mb4',
  })

const printRows = (name, rows) => {
  if (!rows.length) return
  console.log(`\n=== ${name} (${rows.length}) ===`)
  console.log(JSON.stringify(rows, null, 2))
}

const main = async () => {
  const conn = await connect()

  const [requestRows] = await conn.query(
    'SELECT * FROM request_register_vendor WHERE REQUEST_NUMBER = ?',
    [requestNumber]
  )
  printRows('request_register_vendor by request number', requestRows)

  const request = requestRows[0]
  if (!request) {
    await conn.end()
    return
  }

  const requestId = request.REQUEST_REGISTER_VENDOR_ID
  const vendorId = request.VENDORS_ID

  const [selectionRows] = await conn.query(
    'SELECT * FROM request_vendor_selections WHERE REQUEST_REGISTER_VENDOR_ID = ? ORDER BY REQUEST_VENDOR_SELECTIONS_ID',
    [requestId]
  )
  const selectionIds = selectionRows.map((row) => row.REQUEST_VENDOR_SELECTIONS_ID).filter(Boolean)

  console.log('\n=== key summary ===')
  console.log(JSON.stringify({
    requestNumber,
    requestId,
    vendorId,
    selectionIds,
    currentStatusId: request.CURRENT_M_REQUEST_STATUS_ID,
    currentStepId: request.CURRENT_REQUEST_APPROVAL_STEP_ID,
    requestState: request.REQUEST_STATE,
  }, null, 2))

  const [columnRows] = await conn.query(
    "SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME IN ('REQUEST_REGISTER_VENDOR_ID','REQUEST_VENDOR_SELECTIONS_ID','VENDORS_ID') ORDER BY TABLE_NAME, COLUMN_NAME"
  )
  console.log('\n=== related tables by key column ===')
  console.log(JSON.stringify(columnRows, null, 2))

  const tables = [...new Set(columnRows.map((row) => row.TABLE_NAME))]
  for (const table of tables) {
    const columns = columnRows
      .filter((row) => row.TABLE_NAME === table)
      .map((row) => row.COLUMN_NAME)
    const where = []
    const params = []

    if (columns.includes('REQUEST_REGISTER_VENDOR_ID')) {
      where.push('REQUEST_REGISTER_VENDOR_ID = ?')
      params.push(requestId)
    }
    if (columns.includes('REQUEST_VENDOR_SELECTIONS_ID') && selectionIds.length) {
      where.push(`REQUEST_VENDOR_SELECTIONS_ID IN (${selectionIds.map(() => '?').join(',')})`)
      params.push(...selectionIds)
    }
    if (columns.includes('VENDORS_ID')) {
      where.push('VENDORS_ID = ?')
      params.push(vendorId)
    }
    if (!where.length) continue

    const [rows] = await conn.query(
      `SELECT * FROM ${mysql.escapeId(table)} WHERE ${where.join(' OR ')} ORDER BY 1`,
      params
    )
    printRows(table, rows)
  }

  const extraQueries = [
    ['current_status', 'SELECT * FROM m_request_status WHERE M_REQUEST_STATUS_ID = ?', [request.CURRENT_M_REQUEST_STATUS_ID]],
    ['current_step', `
      SELECT
        ras.*,
        wsm.M_REQUEST_STATUS_ID,
        wsm.STEP_CODE,
        wsm.ACTOR_TYPE,
        mrs.STATUS_VALUE AS DESCRIPTION
      FROM request_approval_step ras
      INNER JOIN workflow_step_master wsm
        ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
      INNER JOIN m_request_status mrs
        ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
      WHERE ras.REQUEST_APPROVAL_STEP_ID = ?
    `, [request.CURRENT_REQUEST_APPROVAL_STEP_ID]],
    ['all_request_status', 'SELECT * FROM m_request_status ORDER BY M_REQUEST_STATUS_ID', []],
  ]

  for (const [name, sql, params] of extraQueries) {
    const [rows] = await conn.query(sql, params)
    printRows(name, rows)
  }

  await conn.end()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
