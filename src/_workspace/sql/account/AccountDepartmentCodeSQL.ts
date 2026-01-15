export const AccountDepartmentCodeSQL = {
  getByAccountDepartmentCode_condition: async (dataItem: any) => {
    let sql = `
                                  SELECT
                                                    ACCOUNT_DEPARTMENT_CODE_ID
                                                  , ACCOUNT_DEPARTMENT_NAME
                                                  , ACCOUNT_DEPARTMENT_CODE
                                  FROM
                                                 ACCOUNT_DEPARTMENT_CODE

                                  WHERE
                                                ACCOUNT_DEPARTMENT_CODE = 'dataItem.ACCOUNT_DEPARTMENT_CODE'
                                                AND INUSE = '1'
                  `

    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE', dataItem['ACCOUNT_DEPARTMENT_CODE'])
    // console.log('getByAccountDepartmentCode_condition', sql)
    return sql
  },
  getByAccountDepartmentName_condition: async (dataItem: any) => {
    let sql = `
                                  SELECT
                                                    ACCOUNT_DEPARTMENT_CODE_ID
                                                  , ACCOUNT_DEPARTMENT_NAME
                                                  , ACCOUNT_DEPARTMENT_CODE
                                  FROM
                                                 ACCOUNT_DEPARTMENT_CODE

                                  WHERE
                                                ACCOUNT_DEPARTMENT_NAME = 'dataItem.ACCOUNT_DEPARTMENT_NAME'
                                                AND INUSE = '1'
                  `

    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_NAME', dataItem['ACCOUNT_DEPARTMENT_NAME'])
    // console.log('getByAccountDepartmentName_condition', sql)
    return sql
  },

  getByLikeAccountDepartmentCodeAndInuse: async (dataItem: any) => {
    let sql = `
                                        SELECT
                                                  ACCOUNT_DEPARTMENT_CODE_ID
                                                , ACCOUNT_DEPARTMENT_NAME
                                                , ACCOUNT_DEPARTMENT_CODE

                                        FROM
                                                  ACCOUNT_DEPARTMENT_CODE
                                        WHERE
                                                    ACCOUNT_DEPARTMENT_CODE LIKE '%dataItem.ACCOUNT_DEPARTMENT_CODE%'
                                                AND INUSE =1
                                        ORDER BY
                                                ACCOUNT_DEPARTMENT_CODE ASC
                                         LIMIT
                                              50
                                        `

    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE', dataItem['ACCOUNT_DEPARTMENT_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },

  delete: async (dataItem: any) => {
    let sql = `
      UPDATE
            ACCOUNT_DEPARTMENT_CODE
      SET
            INUSE = '0'
          , UPDATE_BY = 'dataItem.UPDATE_BY'
          , UPDATE_DATE = CURRENT_TIMESTAMP()
      WHERE
            ACCOUNT_DEPARTMENT_CODE_ID = 'dataItem.ACCOUNT_DEPARTMENT_CODE_ID'
        `

    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE_ID', dataItem['ACCOUNT_DEPARTMENT_CODE_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  update: async (dataItem: any) => {
    let sql = `
      UPDATE
              ACCOUNT_DEPARTMENT_CODE
      SET
              ACCOUNT_DEPARTMENT_CODE = 'dataItem.ACCOUNT_DEPARTMENT_CODE'
            , ACCOUNT_DEPARTMENT_NAME = 'dataItem.ACCOUNT_DEPARTMENT_NAME'
            , NOTE = 'dataItem.NOTE'
            , UPDATE_BY = 'dataItem.UPDATE_BY'
            , UPDATE_DATE = CURRENT_TIMESTAMP()
            , INUSE = 'dataItem.INUSE'
      WHERE
              ACCOUNT_DEPARTMENT_CODE_ID = "dataItem.ACCOUNT_DEPARTMENT_CODE_ID"
              `

    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE_ID', dataItem['ACCOUNT_DEPARTMENT_CODE_ID'])
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_NAME', dataItem['ACCOUNT_DEPARTMENT_NAME'])
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE', dataItem['ACCOUNT_DEPARTMENT_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('UPaccount' + sql)
    return sql
  },

  create: async (dataItem: any) => {
    let sql = `
      INSERT INTO ACCOUNT_DEPARTMENT_CODE
              (
                  ACCOUNT_DEPARTMENT_CODE_ID
                , ACCOUNT_DEPARTMENT_NAME
                , ACCOUNT_DEPARTMENT_CODE
                , DESCRIPTION
                , NOTE
                , CREATE_BY
                , UPDATE_BY
                , CREATE_DATE
                , UPDATE_DATE
              )
      VALUES
              (
                (SELECT IFNULL( MAX(ACCOUNT_DEPARTMENT_CODE_ID), 0) + 1 AS MAX_VAL FROM ACCOUNT_DEPARTMENT_CODE MAX_ID)
                , 'dataItem.ACCOUNT_DEPARTMENT_NAME'
                , 'dataItem.ACCOUNT_DEPARTMENT_CODE'
                , 'dataItem.DESCRIPTION'
                , 'dataItem.NOTE'
                , 'dataItem.CREATE_BY'
                , 'dataItem.CREATE_BY'
                , CURRENT_TIMESTAMP()
                , CURRENT_TIMESTAMP()
              )
      `

    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE', dataItem['ACCOUNT_DEPARTMENT_CODE'])
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_NAME', dataItem['ACCOUNT_DEPARTMENT_NAME'])
    sql = sql.replaceAll('dataItem.DESCRIPTION', dataItem['DESCRIPTION'])
    sql = sql.replaceAll('dataItem.NOTE', dataItem['NOTE'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    // console.log('insertAccount', sql)
    return sql
  },

  search: async (dataItem: any) => {
    let sqlList = []

    let sql = `
                          SELECT
                                  COUNT(*) AS TOTAL_COUNT

                           FROM (
                                SELECT
                                        dataItem.selectInuseForSearch
                                FROM
                                        dataItem.sqlJoin
                                        dataItem.sqlWhere
                                        dataItem.sqlHaving

                    )  AS TB_COUNT;
                          `
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.selectInuseForSearch', dataItem.selectInuseForSearch)

    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_NAME', dataItem['ACCOUNT_DEPARTMENT_NAME'])
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE', dataItem['ACCOUNT_DEPARTMENT_CODE'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    sqlList.push(sql)

    sql = `               SELECT
                                        tb_1.ACCOUNT_DEPARTMENT_CODE_ID
                                      , tb_1.ACCOUNT_DEPARTMENT_CODE
                                      , tb_1.ACCOUNT_DEPARTMENT_NAME
                                      , tb_1.NOTE
                                      , tb_1.CREATE_BY
                                      , DATE_FORMAT(tb_1.CREATE_DATE, '%d-%b-%Y %H:%i:%s') AS CREATE_DATE
                                      , tb_1.UPDATE_BY AS UPDATE_BY
                                      , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                                        , tb_1.INUSE AS inuseForSearch
                              FROM
                                       dataItem.sqlJoin
                                       dataItem.sqlWhere
                                       dataItem.sqlHaving
                              ORDER BY
                                      dataItem.Order
                              LIMIT
                                      dataItem.Start
                                    , dataItem.Limit
          `
    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE', dataItem['ACCOUNT_DEPARTMENT_CODE'])
    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_NAME', dataItem['ACCOUNT_DEPARTMENT_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])

    sqlList.push(sql)
    // console.log(sql)

    // sqlList = sqlList.join(";");
    //console.log('lost' + sqlList)
    return sqlList
  },
  getAccountDepartmentCodeByLikeAccountDepartmentCodeAndInuse: async (dataItem: any) => {
    let sql = `     SELECT
                                  tb_1.ACCOUNT_DEPARTMENT_CODE_ID
                                , tb_1.ACCOUNT_DEPARTMENT_NAME
                                , tb_1.ACCOUNT_DEPARTMENT_CODE
                    FROM
                                ACCOUNT_DEPARTMENT_CODE tb_1
                    WHERE
                                    tb_1.ACCOUNT_DEPARTMENT_CODE LIKE '%dataItem.ACCOUNT_DEPARTMENT_CODE%'
                                AND tb_1.INUSE = 1
                    ORDER BY
                                tb_1.ACCOUNT_DEPARTMENT_CODE ASC
                    LIMIT
                                50`

    sql = sql.replaceAll('dataItem.ACCOUNT_DEPARTMENT_CODE', dataItem.ACCOUNT_DEPARTMENT_CODE)
    sql = sql.replaceAll('dataItem.INUSE', dataItem.INUSE)
    return sql
  },
}
