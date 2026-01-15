export const ProductSpecificationDocumentSettingSQL = {
  getByLikeSpecificationSettingAndInuse: async (dataItem: any) => {
    let sql = `   SELECT
                            PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                        , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION
                        , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME
                        , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER
                        , PRODUCT_PART_NUMBER
                    FROM
                          PRODUCT_SPECIFICATION_DOCUMENT_SETTING
                    WHERE
                          PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME LIKE '%dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME%'
                      AND INUSE LIKE '%dataItem.INUSE%'
                    ORDER BY
                      PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME ASC
                    LIMIT
                      50
                    `

    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('getBy', sql)
    return sql
  },

  getBySpecificationSettingForCopy: async () => {
    let sqlList = []
    // let sql = `     SELECT
    //                               PRODUCT_CATEGORY_ID
    //                             , PRODUCT_CATEGORY_NAME
    //                             , PRODUCT_CATEGORY_CODE
    //                             , PRODUCT_CATEGORY_ALPHABET
    //                             , INUSE
    //                      FROM
    //                             PRODUCT_CATEGORY; `

    let sql = `    SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM
                        PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_1
                    WHERE
                            tb_1.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME LIKE '%dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME%'
                        AND tb_1.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER LIKE '%dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER%'
                        AND tb_1.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION LIKE '%dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION%'
                        AND tb_1.PRODUCT_PART_NUMBER LIKE '%dataItem.PRODUCT_PART_NUMBER%'
                        AND tb_1.PRODUCT_MODEL_NUMBER LIKE '%dataItem.PRODUCT_MODEL_NUMBER%'
                        AND tb_1.INUSE LIKE '%dataItem.INUSE%' `

    // console.log('getBySpecificationSettingForCopySearch', sql)
    sqlList.push(sql)

    sql = `SELECT
                  tb_1.PRODUCT_MAIN_ID
                , tb_3.PRODUCT_MAIN_NAME
                , tb_4.PRODUCT_SPECIFICATION_TYPE_NAME
                , tb_1.CUSTOMER_ORDER_FROM_ID
                , tb_2.CUSTOMER_ORDER_FROM_NAME
                , tb_1.PRODUCT_SPECIFICATION_TYPE_ID
                , tb_1.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                , tb_1.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION
                , tb_1.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME
                , tb_1.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER
                , tb_1.PRODUCT_MODEL_NUMBER
                , tb_1.PRODUCT_PART_NUMBER
                , tb_1.UPDATE_BY
                , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS MODIFIED_DATE
                , tb_1.INUSE
                FROM
                    PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_1
                LEFT JOIN
                    CUSTOMER_ORDER_FROM tb_2
                        ON tb_1.CUSTOMER_ORDER_FROM_ID = tb_2.CUSTOMER_ORDER_FROM_ID
                LEFT JOIN
                    PRODUCT_MAIN tb_3
                        ON tb_1.PRODUCT_MAIN_ID = tb_3.PRODUCT_MAIN_ID
                LEFT JOIN
                    PRODUCT_SPECIFICATION_TYPE tb_4
                        ON tb_1.PRODUCT_SPECIFICATION_TYPE_ID = tb_4.PRODUCT_SPECIFICATION_TYPE_ID
            `
    sqlList.push(sql)
    // console.log('getBySpecificationSettingForCopy' + sqlList)
    return sqlList
  },

  generateProductSpecificationDocumentSettingId_Variable: async () => {
    let sql = 'SET @productSpecificationDocumentSettingId = (1 + coalesce((SELECT max(PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID) FROM PRODUCT_SPECIFICATION_DOCUMENT_SETTING), 0));'
    //console.log('createSpecificationSettingSpecificationTypeId', sql)
    return sql
  },
  createProductTypeProductSpecificationId: async () => {
    let sql = `  SET @productTypeProductSpecificationId = (1 + coalesce((SELECT max(PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID)
                FROM PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING), 0)) ; `
    //console.log('createSpecificationSettingSpecificationTypeId', sql)
    return sql
  },
  createProductTypeIdForSpecification: async () => {
    let sql = `  SET @productTypeIdForSpecification = (1 + coalesce((SELECT max(PRODUCT_TYPE_ID)
                FROM PRODUCT_TYPE), 0)) ; `
    //console.log('createSpecificationSettingSpecificationTypeId', sql)
    return sql
  },
  createSpecificationSettingSpecificationTypeId: async () => {
    let sql = `  SET @specificationSettingSpecificationTypeId = (1 + coalesce((SELECT max(PRODUCT_SPECIFICATION_SETTING_PRODUCT_SPECIFICATION_TYPE_ID)
                FROM PRODUCT_SPECIFICATION_SETTING_PRODUCT_SPECIFICATION_TYPE), 0)) ; `
    //console.log('createSpecificationSettingSpecificationTypeId', sql)
    return sql
  },
  createSpecificationSettingId: async () => {
    let sql = `  SET @specificationId=(1 + coalesce((SELECT max(PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID)
                FROM PRODUCT_SPECIFICATION_DOCUMENT_SETTING), 0)) ; `
    //console.log('CreateId', sql)
    return sql
  },
  createProductTypeProgressWorkingId: async () => {
    let sql = `  SET @productTypeProgressWorkingId=(1 + coalesce((SELECT max(PRODUCT_TYPE_PROGRESS_WORKING_ID)
                FROM PRODUCT_TYPE_PROGRESS_WORKING), 0)) ; `
    //console.log('CreateId', sql)
    return sql
  },

  getByLikeCustomerOrderFromNameAndInuse: async (dataItem: any) => {
    let sql = `         SELECT
                                CUSTOMER_ORDER_FROM_ID
                              , CUSTOMER_ORDER_FROM_NAME
                          FROM
                                CUSTOMER_ORDER_FROM
                          WHERE
                                CUSTOMER_ORDER_FROM_NAME LIKE '%dataItem.CUSTOMER_ORDER_FROM_NAME%'
                          AND   INUSE LIKE '%dataItem.INUSE%'
                          ORDER BY
                          CUSTOMER_ORDER_FROM_NAME
                          LIMIT 50
                                              `

    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_NAME', dataItem['CUSTOMER_ORDER_FROM_NAME'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    return sql
  },
  delete: async (dataItem: any) => {
    let sql = `    UPDATE
                        PRODUCT_SPECIFICATION_DOCUMENT_SETTING
                    SET
                        INUSE = '0'
                        , UPDATE_BY = 'dataItem.UPDATE_BY'
                        , UPDATE_DATE = CURRENT_TIMESTAMP()
                    WHERE
                        PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID'
                      `

    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  update: async (dataItem: any) => {
    let sql = `    UPDATE
                            PRODUCT_SPECIFICATION_DOCUMENT_SETTING
                        SET
                            CUSTOMER_ORDER_FROM_ID = dataItem.CUSTOMER_ORDER_FROM_ID
                            , PRODUCT_MAIN_ID = dataItem.PRODUCT_MAIN_ID
                            , PRODUCT_PART_NUMBER = 'dataItem.PRODUCT_PART_NUMBER'
                            , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME = 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME'
                            , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER = 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER'
                            , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION = 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION'
                            , INUSE = 'dataItem.INUSE'
                            , UPDATE_BY = 'dataItem.UPDATE_BY'
                            , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                            PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID'
                      `

    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_ID', dataItem['CUSTOMER_ORDER_FROM_ID'] != '' ? "'" + dataItem['CUSTOMER_ORDER_FROM_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'] != '' ? "'" + dataItem['PRODUCT_MAIN_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  createSpecificationSettingSpecificationType: async (dataItem: any) => {
    let sql = `
    INSERT INTO PRODUCT_SPECIFICATION_SETTING_PRODUCT_SPECIFICATION_TYPE
    (
          PRODUCT_SPECIFICATION_SETTING_PRODUCT_SPECIFICATION_TYPE_ID
        , PRODUCT_SPECIFICATION_TYPE_ID
        , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
        , CREATE_BY
        , UPDATE_DATE
        , UPDATE_BY
    )
    VALUES (
           @specificationSettingSpecificationTypeId
        , 'dataItem.PRODUCT_SPECIFICATION_TYPE_ID'
        , @specificationId
        , 'dataItem.CREATE_BY'
        ,  CURRENT_TIMESTAMP()
        , 'dataItem.CREATE_BY' )
`
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_TYPE_ID', dataItem['PRODUCT_SPECIFICATION_TYPE_ID'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  createProductTypeProgressWorking: async (dataItem: any) => {
    let sql = `
    INSERT INTO PRODUCT_TYPE_PROGRESS_WORKING
    (
          PRODUCT_TYPE_PROGRESS_WORKING_ID
        , PRODUCT_TYPE_ID
        , PRODUCT_TYPE_STATUS_WORKING_ID
        , CREATE_BY
        , UPDATE_DATE
        , UPDATE_BY
        , INUSE
    )
    VALUES (
           1 + coalesce((SELECT max(PRODUCT_TYPE_PROGRESS_WORKING_ID) FROM PRODUCT_TYPE_PROGRESS_WORKING), 0)
        ,  @productTypeId
        ,  'dataItem.PRODUCT_TYPE_STATUS_WORKING_ID'
        , 'dataItem.CREATE_BY'
        ,  CURRENT_TIMESTAMP()
        , 'dataItem.UPDATE_BY'
        ,  dataItem.INUSE
        )
`
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  create: async (dataItem: any) => {
    let sql = `
    INSERT INTO PRODUCT_SPECIFICATION_DOCUMENT_SETTING
    (
          PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
        , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME
        , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER
        , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION
        , PRODUCT_PART_NUMBER
        , PRODUCT_MODEL_NUMBER
        , PRODUCT_MAIN_ID
        , CUSTOMER_ORDER_FROM_ID
        , PRODUCT_SPECIFICATION_TYPE_ID
        , CREATE_BY
        , UPDATE_DATE
        , UPDATE_BY
    )
    VALUES (
           @productSpecificationDocumentSettingId
        , 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME'
        , 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER'
        , 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION'
        , 'dataItem.PRODUCT_PART_NUMBER'
        , 'dataItem.PRODUCT_MODEL_NUMBER'
        ,  dataItem.PRODUCT_MAIN_ID
        , dataItem.CUSTOMER_ORDER_FROM_ID
        , 'dataItem.PRODUCT_SPECIFICATION_TYPE_ID'
        , 'dataItem.CREATE_BY'
        ,  CURRENT_TIMESTAMP()
        , 'dataItem.CREATE_BY'
        )
`
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION'])
    sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_MODEL_NUMBER', dataItem['PRODUCT_MODEL_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_TYPE_ID', dataItem['PRODUCT_SPECIFICATION_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'] != '' ? "'" + dataItem['PRODUCT_MAIN_ID'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_ID', dataItem['CUSTOMER_ORDER_FROM_ID'] != '' ? "'" + dataItem['CUSTOMER_ORDER_FROM_ID'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    //console.log('CreateSpecification', sql)
    return sql
  },
  //   createProductTypeForSpecification: async dataItem => {
  //     let sql = `
  //    INSERT INTO PRODUCT_TYPE
  //     (
  //          PRODUCT_TYPE_ID
  //         , CREATE_BY
  //         , UPDATE_DATE
  //         , UPDATE_BY
  //     )
  //     VALUES (
  //            @productTypeIdForSpecification
  //         , 'dataItem.CREATE_BY'
  //         ,  CURRENT_TIMESTAMP()
  //         , 'dataItem.CREATE_BY' )
  // `
  //     sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

  //     return sql
  //   },
  createProductTypeProductSpecification: async (dataItem: any) => {
    let sql = `
   INSERT INTO PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING
    (
          PRODUCT_TYPE_PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
        , PRODUCT_TYPE_ID
        , PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
        , CREATE_BY
        , UPDATE_DATE
        , UPDATE_BY
    )
    VALUES (
            @productTypeProductSpecificationId
        ,  @productTypeIdForSpecification
        ,  @specificationId
        , 'dataItem.CREATE_BY'
        ,  CURRENT_TIMESTAMP()
        , 'dataItem.CREATE_BY' )
`
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },

  search: async (dataItem: any) => {
    let sqlList = []

    let sql = `    SELECT
                        COUNT(*) AS TOTAL_COUNT
                    FROM
                        PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_1
                        LEFT JOIN
                              CUSTOMER_ORDER_FROM tb_2
                                  ON tb_1.CUSTOMER_ORDER_FROM_ID = tb_2.CUSTOMER_ORDER_FROM_ID
                        LEFT JOIN
                              PRODUCT_MAIN tb_3
                                  ON tb_1.PRODUCT_MAIN_ID = tb_3.PRODUCT_MAIN_ID
                          dataItem.sqlWhere
                        `
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sql = sql.replaceAll('dataItem.sqlWhere', dataItem.sqlWhere)
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION'])
    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_ID', dataItem['CUSTOMER_ORDER_FROM_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_TYPE_ID', dataItem['PRODUCT_SPECIFICATION_TYPE_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MODEL_NUMBER', dataItem['PRODUCT_MODEL_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('SpecificationTotalSearch', sql)
    sqlList.push(sql)

    sql = `SELECT
                  tb_1.PRODUCT_MAIN_ID
                , tb_3.PRODUCT_MAIN_NAME
                , tb_1.CUSTOMER_ORDER_FROM_ID
                , tb_2.CUSTOMER_ORDER_FROM_NAME
                , tb_1.PRODUCT_SPECIFICATION_TYPE_ID
                , tb_4.PRODUCT_SPECIFICATION_TYPE_NAME
                , tb_1.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID
                , tb_1.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION
                , tb_1.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME
                , tb_1.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER
                , tb_1.PRODUCT_MODEL_NUMBER
                , tb_1.PRODUCT_PART_NUMBER
                , tb_1.UPDATE_BY
                , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                , tb_1.INUSE
                , (IF (tb_1.INUSE = 0 ,0 ,IF(
                                    EXISTS
                                            (
                                                SELECT
                                                    tbs_1.PRODUCT_SUB_ID
                                                FROM
                                                    PRODUCT_SUB tbs_1
                                                WHERE
                                                        tbs_1.INUSE = 1
                                                    AND tbs_1.PRODUCT_MAIN_ID = tb_1.PRODUCT_MAIN_ID) = TRUE
                                            , 2
                                            ,   IF(
                                                        EXISTS
                                                        (
                                                            SELECT
                                                                      tbs_1.PRODUCT_SUB_ID
                                                            FROM
                                                                      PRODUCT_SUB tbs_1
                                                            WHERE
                                                                      tbs_1.PRODUCT_MAIN_ID = tb_1.PRODUCT_MAIN_ID
                                                        ) = TRUE
                                            , 3
                                            , 1
                                            )))) AS inuseForSearch
                FROM
                    PRODUCT_SPECIFICATION_DOCUMENT_SETTING tb_1
                LEFT JOIN
                    CUSTOMER_ORDER_FROM tb_2
                        ON tb_1.CUSTOMER_ORDER_FROM_ID = tb_2.CUSTOMER_ORDER_FROM_ID
                LEFT JOIN
                    PRODUCT_MAIN tb_3
                        ON tb_1.PRODUCT_MAIN_ID = tb_3.PRODUCT_MAIN_ID
                LEFT JOIN
                    PRODUCT_SPECIFICATION_TYPE tb_4
                        ON tb_1.PRODUCT_SPECIFICATION_TYPE_ID = tb_4.PRODUCT_SPECIFICATION_TYPE_ID
                dataItem.sqlWhere
                dataItem.sqlHaving
                ORDER BY
                  dataItem.Order
                LIMIT dataItem.Start,dataItem.Limit ;
            `

    sql = sql.replaceAll('dataItem.sqlHaving', dataItem.sqlHaving)
    sql = sql.replaceAll('dataItem.sqlWhere', dataItem.sqlWhere)
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_MODEL_NUMBER', dataItem['PRODUCT_MODEL_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', dataItem['PRODUCT_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_ID', dataItem['CUSTOMER_ORDER_FROM_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_TYPE_ID', dataItem['PRODUCT_SPECIFICATION_TYPE_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.inuseForSearch', dataItem['inuseForSearch'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sql = sql.replaceAll('sqlWhereColumnFilter', dataItem['sqlWhereColumnFilter'])
    sqlList.push(sql)

    return sqlList
  },

  checkDuplicate: async (dataItem: any) => {
    let sql = `
                  SELECT
                          COUNT(*) AS TOTAL_COUNT
                  FROM
                          PRODUCT_SPECIFICATION_DOCUMENT_SETTING
                  WHERE
                                PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME = 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME'
                          AND  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER = 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER'
                          AND  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION = 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION'
                          AND  PRODUCT_PART_NUMBER = 'dataItem.PRODUCT_PART_NUMBER'
                          AND  PRODUCT_MODEL_NUMBER = 'dataItem.PRODUCT_MODEL_NUMBER'
                          AND  PRODUCT_MAIN_ID dataItem.PRODUCT_MAIN_ID
                          AND  CUSTOMER_ORDER_FROM_ID = 'dataItem.CUSTOMER_ORDER_FROM_ID'
                          AND  PRODUCT_SPECIFICATION_TYPE_ID = 'dataItem.PRODUCT_SPECIFICATION_TYPE_ID'
                          AND INUSE = '1' `

    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NAME'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_VERSION_REVISION'])
    sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])
    sql = sql.replaceAll('dataItem.PRODUCT_MODEL_NUMBER', dataItem['PRODUCT_MODEL_NUMBER'])

    // special case
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])

    sql = sql.replaceAll('dataItem.CUSTOMER_ORDER_FROM_ID', dataItem['CUSTOMER_ORDER_FROM_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_TYPE_ID', dataItem['PRODUCT_SPECIFICATION_TYPE_ID'])

    return sql
  },

  getByProductSpecificationDocumentSettingNameAndProductPartNumberAndInuse: async (dataItem: any) => {
    let sql = `
                  SELECT
                          COUNT(*) AS TOTAL_COUNT
                  FROM
                          PRODUCT_SPECIFICATION_DOCUMENT_SETTING
                  WHERE

                               PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER = 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER'
                          AND  PRODUCT_PART_NUMBER = 'dataItem.PRODUCT_PART_NUMBER'
                          AND  PRODUCT_MAIN_ID dataItem.PRODUCT_MAIN_ID
                          AND  INUSE = dataItem.INUSE `

    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_NUMBER'])

    sql = sql.replaceAll('dataItem.PRODUCT_PART_NUMBER', dataItem['PRODUCT_PART_NUMBER'])

    // special case
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'] === '' ? ' IS NULL' : " = '" + dataItem['PRODUCT_MAIN_ID'] + "'")

    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])

    return sql
  },
  updateProductMainForSpecification: async (dataItem: any) => {
    let sql = `        UPDATE
                                  PRODUCT_SPECIFICATION_DOCUMENT_SETTING
                          SET
                                  PRODUCT_MAIN_ID = dataItem.PRODUCT_MAIN_ID
                                , UPDATE_BY = 'dataItem.UPDATE_BY'
                                , UPDATE_DATE = CURRENT_TIMESTAMP()
                        WHERE
                                  PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID = 'dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID'
  `
    sql = sql.replaceAll('dataItem.PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID', dataItem['PRODUCT_SPECIFICATION_DOCUMENT_SETTING_ID'])
    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'] != '' ? "'" + dataItem['PRODUCT_MAIN_ID'] + "'" : 'NULL')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    // console.log('updateProductTypeProductMain', sql)
    return sql
  },
}
