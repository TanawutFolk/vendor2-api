const dotenv = require('dotenv')
const mysql = require('mysql2/promise')

dotenv.config({ path: '.env.development' })

const requestNumber = process.argv[2] || 'Selection-26-N003'
const updateBy = process.argv[3] || 'CODEX_REPAIR'

const connect = () =>
  mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER_NAME,
    password: process.env.PASSWORD,
    database: process.env.DB,
    port: Number(process.env.DB_PORT || 3306),
    charset: 'utf8mb4',
    multipleStatements: true,
  })

const getSteps = async (conn) => {
  const [rows] = await conn.query(
    `
      SELECT
        ras.REQUEST_APPROVAL_STEP_ID,
        ras.STEP_ORDER,
        wsm.STEP_CODE,
        mrs.STATUS_VALUE AS DESCRIPTION,
        ras.STEP_STATUS,
        ras.APPROVER_EMPCODE,
        ras.GROUP_CODE,
        (
          SELECT ato.EMPCODE
          FROM assignees_to ato
          WHERE ato.GROUP_CODE = ras.GROUP_CODE
            AND ato.INUSE = 1
          ORDER BY ato.ASSIGNEES_TO_ID ASC
          LIMIT 1
        ) AS SHOULD_APPROVER_ID
      FROM request_approval_step ras
      INNER JOIN workflow_step_master wsm
        ON wsm.WORKFLOW_STEP_MASTER_ID = ras.WORKFLOW_STEP_MASTER_ID
      INNER JOIN m_request_status mrs
        ON mrs.M_REQUEST_STATUS_ID = wsm.M_REQUEST_STATUS_ID
      INNER JOIN request_register_vendor rr
        ON rr.REQUEST_REGISTER_VENDOR_ID = ras.REQUEST_REGISTER_VENDOR_ID
      WHERE rr.REQUEST_NUMBER = ?
        AND ras.INUSE = 1
      ORDER BY ras.STEP_ORDER ASC
    `,
    [requestNumber]
  )

  return rows
}

const main = async () => {
  const conn = await connect()

  try {
    console.log('=== before ===')
    console.log(JSON.stringify(await getSteps(conn), null, 2))

    await conn.beginTransaction()

    const [result] = await conn.query(
      `
        UPDATE request_approval_step ras
        INNER JOIN request_register_vendor rr
          ON rr.REQUEST_REGISTER_VENDOR_ID = ras.REQUEST_REGISTER_VENDOR_ID
        INNER JOIN assignees_to ato
          ON ato.GROUP_CODE = ras.GROUP_CODE
         AND ato.INUSE = 1
         AND ato.ASSIGNEES_TO_ID = (
              SELECT MIN(ato2.ASSIGNEES_TO_ID)
              FROM assignees_to ato2
              WHERE ato2.GROUP_CODE = ras.GROUP_CODE
                AND ato2.INUSE = 1
            )
        SET ras.APPROVER_EMPCODE = ato.EMPCODE,
            ras.ASSIGNMENT_MODE = 'AUTO',
            ras.UPDATE_BY = ?,
            ras.UPDATE_DATE = NOW()
        WHERE rr.REQUEST_NUMBER = ?
          AND ras.INUSE = 1
          AND COALESCE(TRIM(ras.APPROVER_EMPCODE), '') = ''
          AND COALESCE(TRIM(ras.GROUP_CODE), '') <> ''
      `,
      [updateBy, requestNumber]
    )

    await conn.commit()

    console.log('=== repair result ===')
    console.log(JSON.stringify({
      requestNumber,
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
    }, null, 2))

    console.log('=== after ===')
    console.log(JSON.stringify(await getSteps(conn), null, 2))
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    await conn.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
