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

  const requestId = request.REQUEST_ID
  const vendorId = request.VENDOR_ID

  const [selectionRows] = await conn.query(
    'SELECT * FROM request_vendor_selections WHERE REQUEST_ID = ? ORDER BY SELECTION_ID',
    [requestId]
  )
  const selectionIds = selectionRows.map((row) => row.SELECTION_ID).filter(Boolean)

  console.log('\n=== key summary ===')
  console.log(JSON.stringify({
    requestNumber,
    requestId,
    vendorId,
    selectionIds,
    currentStatusId: request.CURRENT_STATUS_ID,
    currentStepId: request.CURRENT_STEP_ID,
    requestState: request.REQUEST_STATE,
  }, null, 2))

  const [columnRows] = await conn.query(
    "SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND COLUMN_NAME IN ('REQUEST_ID','request_id','SELECTION_ID','selection_id','VENDOR_ID','vendor_id') ORDER BY TABLE_NAME, COLUMN_NAME"
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

    if (columns.includes('REQUEST_ID')) {
      where.push('REQUEST_ID = ?')
      params.push(requestId)
    }
    if (columns.includes('request_id')) {
      where.push('request_id = ?')
      params.push(requestId)
    }
    if (columns.includes('SELECTION_ID') && selectionIds.length) {
      where.push(`SELECTION_ID IN (${selectionIds.map(() => '?').join(',')})`)
      params.push(...selectionIds)
    }
    if (columns.includes('selection_id') && selectionIds.length) {
      where.push(`selection_id IN (${selectionIds.map(() => '?').join(',')})`)
      params.push(...selectionIds)
    }
    if (columns.includes('VENDOR_ID')) {
      where.push('VENDOR_ID = ?')
      params.push(vendorId)
    }
    if (columns.includes('vendor_id')) {
      where.push('vendor_id = ?')
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
    ['current_status', 'SELECT * FROM m_request_status WHERE STATUS_ID = ?', [request.CURRENT_STATUS_ID]],
    ['current_step', 'SELECT * FROM request_approval_step WHERE STEP_ID = ?', [request.CURRENT_STEP_ID]],
    ['all_request_status', 'SELECT * FROM m_request_status ORDER BY STATUS_ID', []],
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
