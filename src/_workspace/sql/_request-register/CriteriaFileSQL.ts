const numberSql = (value: any) => String(Number(value) || 0)

const escapeSqlText = (value: any) =>
  String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "''")

const nullableTextSql = (value: any) => {
  const normalized = String(value ?? '').trim()
  return normalized ? "'" + escapeSqlText(normalized) + "'" : 'NULL'
}

export const CriteriaFileSQL = {
  getSelectionForUpdate: (dataItem: any) => {
    let sql = `
      SELECT REQUEST_VENDOR_SELECTIONS_ID
      FROM request_vendor_selections
      WHERE REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        AND INUSE = 1
      ORDER BY REQUEST_VENDOR_SELECTIONS_ID DESC
      LIMIT 1
      FOR UPDATE
    `

    sql = sql.replaceAll(
      'dataItem.REQUEST_REGISTER_VENDOR_ID',
      numberSql(dataItem.REQUEST_REGISTER_VENDOR_ID),
    )

    return sql
  },

  upsertCriteria: (dataItem: any) => {
    let sql = `
      INSERT INTO vendor_selection_criteria (
        REQUEST_VENDOR_SELECTIONS_ID,
        CRITERIA_NO,
        CREATE_BY,
        UPDATE_BY,
        INUSE
      )
      VALUES (
        dataItem.REQUEST_VENDOR_SELECTIONS_ID,
        'dataItem.CRITERIA_NO',
        'dataItem.CREATE_BY',
        'dataItem.UPDATE_BY',
        1
      )
      ON DUPLICATE KEY UPDATE
        UPDATE_BY = VALUES(UPDATE_BY),
        UPDATE_DATE = NOW(),
        INUSE = 1
    `

    sql = sql.replaceAll(
      'dataItem.REQUEST_VENDOR_SELECTIONS_ID',
      numberSql(dataItem.REQUEST_VENDOR_SELECTIONS_ID),
    )
    sql = sql.replaceAll('dataItem.CRITERIA_NO', escapeSqlText(dataItem.CRITERIA_NO))
    sql = sql.replaceAll('dataItem.CREATE_BY', escapeSqlText(dataItem.CREATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem.UPDATE_BY || 'SYSTEM'))

    return sql
  },

  getCriteriaForUpdate: (dataItem: any) => {
    let sql = `
      SELECT VENDOR_SELECTION_CRITERIA_ID
      FROM vendor_selection_criteria
      WHERE REQUEST_VENDOR_SELECTIONS_ID = dataItem.REQUEST_VENDOR_SELECTIONS_ID
        AND CRITERIA_NO = 'dataItem.CRITERIA_NO'
      LIMIT 1
      FOR UPDATE
    `

    sql = sql.replaceAll(
      'dataItem.REQUEST_VENDOR_SELECTIONS_ID',
      numberSql(dataItem.REQUEST_VENDOR_SELECTIONS_ID),
    )
    sql = sql.replaceAll('dataItem.CRITERIA_NO', escapeSqlText(dataItem.CRITERIA_NO))

    return sql
  },

  getActiveFileOrdersForUpdate: (dataItem: any) => {
    let sql = `
      SELECT FILE_ORDER
      FROM vendor_selection_criteria_files
      WHERE VENDOR_SELECTION_CRITERIA_ID = dataItem.VENDOR_SELECTION_CRITERIA_ID
        AND INUSE = 1
      FOR UPDATE
    `

    sql = sql.replaceAll(
      'dataItem.VENDOR_SELECTION_CRITERIA_ID',
      numberSql(dataItem.VENDOR_SELECTION_CRITERIA_ID),
    )

    return sql
  },

  upsertCriteriaFile: (dataItem: any) => {
    let sql = `
      INSERT INTO vendor_selection_criteria_files (
        VENDOR_SELECTION_CRITERIA_ID,
        FILE_ORDER,
        FILE_PATH,
        FILE_NAME,
        FILE_SIZE,
        FILE_TYPE,
        CREATE_BY,
        UPDATE_BY,
        INUSE,
        DESCRIPTION
      )
      VALUES (
        dataItem.VENDOR_SELECTION_CRITERIA_ID,
        dataItem.FILE_ORDER,
        'dataItem.FILE_PATH',
        'dataItem.FILE_NAME',
        dataItem.FILE_SIZE,
        dataItem.FILE_TYPE,
        'dataItem.CREATE_BY',
        'dataItem.UPDATE_BY',
        1,
        NULL
      )
      ON DUPLICATE KEY UPDATE
        VENDOR_SELECTION_CRITERIA_FILE_ID = LAST_INSERT_ID(VENDOR_SELECTION_CRITERIA_FILE_ID),
        FILE_PATH = VALUES(FILE_PATH),
        FILE_NAME = VALUES(FILE_NAME),
        FILE_SIZE = VALUES(FILE_SIZE),
        FILE_TYPE = VALUES(FILE_TYPE),
        UPDATE_BY = VALUES(UPDATE_BY),
        UPDATE_DATE = NOW(),
        INUSE = 1,
        DESCRIPTION = NULL
    `

    sql = sql.replaceAll(
      'dataItem.VENDOR_SELECTION_CRITERIA_ID',
      numberSql(dataItem.VENDOR_SELECTION_CRITERIA_ID),
    )
    sql = sql.replaceAll('dataItem.FILE_ORDER', numberSql(dataItem.FILE_ORDER))
    sql = sql.replaceAll('dataItem.FILE_PATH', escapeSqlText(dataItem.FILE_PATH))
    sql = sql.replaceAll('dataItem.FILE_NAME', escapeSqlText(dataItem.FILE_NAME))
    sql = sql.replaceAll(
      'dataItem.FILE_SIZE',
      Number(dataItem.FILE_SIZE || 0) ? numberSql(dataItem.FILE_SIZE) : 'NULL',
    )
    sql = sql.replaceAll('dataItem.FILE_TYPE', nullableTextSql(dataItem.FILE_TYPE))
    sql = sql.replaceAll('dataItem.CREATE_BY', escapeSqlText(dataItem.CREATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem.UPDATE_BY || 'SYSTEM'))

    return sql
  },

  getForDelete: (dataItem: any) => {
    let sql = `
      SELECT
        vscf.VENDOR_SELECTION_CRITERIA_FILE_ID,
        vscf.VENDOR_SELECTION_CRITERIA_ID,
        vsc.REQUEST_VENDOR_SELECTIONS_ID,
        vsc.CRITERIA_NO,
        vscf.FILE_ORDER,
        vscf.FILE_PATH,
        vscf.FILE_NAME,
        vscf.FILE_SIZE,
        vscf.FILE_TYPE
      FROM vendor_selection_criteria_files vscf
      INNER JOIN vendor_selection_criteria vsc
        ON vsc.VENDOR_SELECTION_CRITERIA_ID = vscf.VENDOR_SELECTION_CRITERIA_ID
       AND vsc.INUSE = 1
      INNER JOIN request_vendor_selections rvs
        ON rvs.REQUEST_VENDOR_SELECTIONS_ID = vsc.REQUEST_VENDOR_SELECTIONS_ID
       AND rvs.INUSE = 1
      WHERE rvs.REQUEST_REGISTER_VENDOR_ID = dataItem.REQUEST_REGISTER_VENDOR_ID
        AND vscf.VENDOR_SELECTION_CRITERIA_FILE_ID = dataItem.VENDOR_SELECTION_CRITERIA_FILE_ID
        AND vscf.INUSE = 1
      LIMIT 1
    `

    sql = sql.replaceAll(
      'dataItem.REQUEST_REGISTER_VENDOR_ID',
      numberSql(dataItem.REQUEST_REGISTER_VENDOR_ID),
    )
    sql = sql.replaceAll(
      'dataItem.VENDOR_SELECTION_CRITERIA_FILE_ID',
      numberSql(dataItem.VENDOR_SELECTION_CRITERIA_FILE_ID),
    )

    return sql
  },

  softDelete: (dataItem: any) => {
    let sql = `
      UPDATE vendor_selection_criteria_files
      SET INUSE = 0,
          UPDATE_BY = 'dataItem.UPDATE_BY',
          UPDATE_DATE = NOW()
      WHERE VENDOR_SELECTION_CRITERIA_FILE_ID = dataItem.VENDOR_SELECTION_CRITERIA_FILE_ID
        AND INUSE = 1
    `

    sql = sql.replaceAll('dataItem.UPDATE_BY', escapeSqlText(dataItem.UPDATE_BY || 'SYSTEM'))
    sql = sql.replaceAll(
      'dataItem.VENDOR_SELECTION_CRITERIA_FILE_ID',
      numberSql(dataItem.VENDOR_SELECTION_CRITERIA_FILE_ID),
    )

    return sql
  },
}
