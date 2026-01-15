export const BoiNameForMaterialConsumableSQL = {
  insertBoiDescriptionSubNameByBoiNameForMaterial: async (dataItem: any) => {
    let sql = `
                        INSERT INTO BOI_NAME_FOR_MATERIAL_CONSUMABLE
                                (
                                    BOI_GROUP_NO
                                  , BOI_PROJECT_ID
                                  , BOI_UNIT_ID
                                  , BOI_DESCRIPTION_MAIN_NAME
                                  , BOI_DESCRIPTION_SUB_NAME
                                  , CREATE_BY
                                  , UPDATE_BY
                                  , CREATE_DATE
                                  , UPDATE_DATE
                                  , INUSE
                                )
                                SELECT
                                     BOI_GROUP_NO
                                  ,  BOI_PROJECT_ID
                                  , 'dataItem.BOI_UNIT_ID'
                                  , 'dataItem.BOI_DESCRIPTION_MAIN_NAME'
                                  , 'dataItem.BOI_DESCRIPTION_SUB_NAME'
                                  , 'dataItem.CREATE_BY'
                                  , 'dataItem.CREATE_BY'
                                  ,  CURRENT_TIMESTAMP()
                                  ,  CURRENT_TIMESTAMP()
                                  ,  1
                                FROM
                                    BOI_NAME_FOR_MATERIAL_CONSUMABLE
                                WHERE
                                    BOI_PROJECT_ID ='dataItem.BOI_PROJECT_ID'
                                  AND
                                    BOI_GROUP_NO = 'dataItem.BOI_GROUP_NO'
                                  AND
                                    BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID = 'dataItem.BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID'

                        `
    sql = sql.replaceAll('dataItem.BOI_GROUP_NO', dataItem['BOI_GROUP_NO'])
    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'])
    sql = sql.replaceAll('dataItem.BOI_UNIT_ID', dataItem['BOI_UNIT_ID'])
    sql = sql.replaceAll('dataItem.BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID', dataItem['BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID'])
    sql = sql.replaceAll('dataItem.BOI_DESCRIPTION_MAIN_NAME', dataItem['BOI_DESCRIPTION_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.BOI_DESCRIPTION_SUB_NAME', dataItem['BOI_DESCRIPTION_SUB_NAME'] != ' ' ? dataItem['BOI_DESCRIPTION_SUB_NAME'] : ' ')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    //console.log('Add add' + sql)
    return sql
  },
  DeleteBoiDescriptionSub: async (dataItem: any) => {
    let sql = `
                  UPDATE
                            BOI_NAME_FOR_MATERIAL_CONSUMABLE
                  SET
                            INUSE = '0'
                          , UPDATE_BY = 'dataItem.UPDATE_BY'
                          , UPDATE_DATE = CURRENT_TIMESTAMP()
                  WHERE
                      BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID = 'dataItem.BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID'
                            `
    sql = sql.replaceAll('dataItem.BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID', dataItem['BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    //console.log('luckiiiii' + sql)
    return sql
  },
  getDescriptionMainAndDescriptionSubForCheck: async (dataItem: any) => {
    let sql = `     SELECT
                          BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID
                        , BOI_GROUP_NO
                        , BOI_PROJECT_ID
                        , BOI_UNIT_ID
                        , BOI_DESCRIPTION_MAIN_NAME
                        , BOI_DESCRIPTION_SUB_NAME
                      FROM
                        BOI_NAME_FOR_MATERIAL_CONSUMABLE
                      WHERE
                        BOI_PROJECT_ID = 'dataItem.BOI_PROJECT_ID'
                      AND   BOI_GROUP_NO = 'dataItem.BOI_GROUP_NO'
                      AND   INUSE=1
`

    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'])
    sql = sql.replaceAll('dataItem.BOI_GROUP_NO', dataItem['BOI_GROUP_NO'])
    //console.log('SearchBefore' + sql)
    return sql
  },
  insertBoiDescriptionMainNameByBoiNameForMaterial: async (dataItem: any) => {
    let sql = `
                        INSERT INTO BOI_NAME_FOR_MATERIAL_CONSUMABLE
                                (
                                    BOI_GROUP_NO
                                  , BOI_PROJECT_ID
                                  , BOI_UNIT_ID
                                  , BOI_DESCRIPTION_MAIN_NAME
                                  , BOI_DESCRIPTION_SUB_NAME
                                  , CREATE_BY
                                  , UPDATE_BY
                                  , CREATE_DATE
                                  , UPDATE_DATE
                                  , INUSE
                                )
                                SELECT
                                     BOI_GROUP_NO
                                  ,  BOI_PROJECT_ID
                                  , 'dataItem.BOI_UNIT_ID'
                                  , 'dataItem.BOI_DESCRIPTION_MAIN_NAME'
                                  ,  BOI_DESCRIPTION_SUB_NAME
                                  , 'dataItem.CREATE_BY'
                                  , 'dataItem.CREATE_BY'
                                  ,  CURRENT_TIMESTAMP()
                                  ,  CURRENT_TIMESTAMP()
                                  ,  1
                                FROM
                                    BOI_NAME_FOR_MATERIAL_CONSUMABLE
                                WHERE
                                    BOI_PROJECT_ID ='dataItem.BOI_PROJECT_ID'
                                  AND
                                    BOI_GROUP_NO = 'dataItem.BOI_GROUP_NO'
                                GROUP BY
                                    BOI_DESCRIPTION_SUB_NAME
                        `
    sql = sql.replaceAll('dataItem.BOI_GROUP_NO', dataItem['BOI_GROUP_NO'])
    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'])
    sql = sql.replaceAll('dataItem.BOI_UNIT_ID', dataItem['BOI_UNIT_ID'])
    sql = sql.replaceAll('dataItem.BOI_DESCRIPTION_MAIN_NAME', dataItem['BOI_DESCRIPTION_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.BOI_DESCRIPTION_SUB_NAME', dataItem['BOI_DESCRIPTION_SUB_NAME'] != ' ' ? dataItem['BOI_DESCRIPTION_SUB_NAME'] : ' ')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    //console.log('Add all' + sql)
    return sql
  },

  DeleteBoiNameForMaterial: async (dataItem: any) => {
    let sql = `
                  UPDATE
                            BOI_NAME_FOR_MATERIAL_CONSUMABLE
                  SET
                            INUSE = '0'
                          , UPDATE_BY = 'dataItem.UPDATE_BY'
                          , UPDATE_DATE = CURRENT_TIMESTAMP()
                  WHERE
                       BOI_PROJECT_ID = 'dataItem.BOI_PROJECT_ID'
                   AND    BOI_GROUP_NO = 'dataItem.BOI_GROUP_NO'
                   AND    INUSE = 1
                            `

    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'])
    sql = sql.replaceAll('dataItem.BOI_GROUP_NO', dataItem['BOI_GROUP_NO'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    //console.log('lucki' + sql)
    return sql
  },
  getByBoiProjectIdAndBoiGroupNoAndInuse: async (dataItem: any) => {
    let sql = `     SELECT
                          BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID
                        , BOI_GROUP_NO
                        , BOI_PROJECT_ID
                        , BOI_UNIT_ID
                        , BOI_DESCRIPTION_MAIN_NAME
                        , BOI_DESCRIPTION_SUB_NAME
                      FROM
                        BOI_NAME_FOR_MATERIAL_CONSUMABLE
                      WHERE
                        BOI_DESCRIPTION_MAIN_NAME = 'dataItem.BOI_DESCRIPTION_MAIN_NAME'
                        AND INUSE=1
`
    sql = sql.replaceAll('dataItem.BOI_DESCRIPTION_MAIN_NAME', dataItem['BOI_DESCRIPTION_MAIN_NAME'])
    //console.log('SearchBefore' + sql)
    return sql
  },

  SearchWorkFlowStepDescriptionMainNameForFetch: async (dataItem: any) => {
    let sql = `
              SELECT BOI_PROJECT_ID AS value
                    ,BOI_DESCRIPTION_MAIN_NAME AS label
                    ,tb_1.BOI_GROUP_NO
                    ,tb_1.BOI_DESCRIPTION_SUB_NAME
                    ,tb_1.BOI_UNIT_ID
                    ,tb_2.BOI_UNIT_SYMBOL
                from BOI_NAME_FOR_MATERIAL_CONSUMABLE tb_1
          INNER JOIN
                    BOI_UNIT tb_2
                  ON tb_1.BOI_UNIT_ID  = tb_2.BOI_UNIT_ID
                    WHERE BOI_GROUP_NO LIKE '%dataItem.BOI_GROUP_NO%'
                          AND BOI_PROJECT_ID LIKE '%dataItem.BOI_PROJECT_ID%'
                    GROUP BY BOI_DESCRIPTION_MAIN_NAME
`
    sql = sql.replaceAll('dataItem.BOI_GROUP_NO', dataItem.BOI_GROUP_NO)
    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem.BOI_PROJECT_ID)
    //console.log('9999999' + sql)
    return sql
  },
  SearchWorkFlowStepBoiGroupNoForFetch: async (dataItem: any) => {
    let sql = `
                      SELECT BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID AS value
                            ,BOI_GROUP_NO AS label
                            ,BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID
                            ,tb_1.BOI_PROJECT_ID
                            ,tb_1.BOI_DESCRIPTION_MAIN_NAME
                            ,tb_1.BOI_UNIT_ID
                            ,tb_2.BOI_UNIT_SYMBOL
                        from BOI_NAME_FOR_MATERIAL_CONSUMABLE tb_1
                        INNER JOIN
                              BOI_UNIT tb_2
                           ON tb_1.BOI_UNIT_ID  = tb_2.BOI_UNIT_ID
                        WHERE tb_1.BOI_GROUP_NO LIKE '%dataItem.BOI_GROUP_NO%'
                          AND tb_1.BOI_PROJECT_ID LIKE '%dataItem.BOI_PROJECT_ID%'
                          AND tb_1.INUSE = 1
                            group by tb_1.BOI_GROUP_NO
                            ORDER BY tb_1.BOI_GROUP_NO
 `
    sql = sql.replaceAll('dataItem.BOI_GROUP_NO', dataItem.BOI_GROUP_NO)
    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem.BOI_PROJECT_ID)
    //console.log('12345' + sql)
    return sql
  },
  getByLikeBoiGroupNoAndInuse: async (dataItem: any) => {
    let sql = `
                      SELECT
                                BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID
                              , BOI_GROUP_NO
                      FROM
                                BOI_NAME_FOR_MATERIAL_CONSUMABLE
                      WHERE
                              BOI_GROUP_NO LIKE '%dataItem.BOI_GROUP_NO%'
                      GROUP BY  BOI_GROUP_NO
                      ORDER BY
                                BOI_GROUP_NO ASC
                      `

    sql = sql.replaceAll('dataItem.BOI_GROUP_NO', dataItem['BOI_GROUP_NO'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('boiGroupNo' + sql)
    return sql
  },
  getByLikeBoiSymbolAndInuse: async (dataItem: any) => {
    let sql = `
                          SELECT
                                    BOI_UNIT_ID
                                  , BOI_UNIT_NAME
                                  , BOI_UNIT_SYMBOL
                          FROM
                                    BOI_UNIT
                          WHERE
                                    BOI_UNIT_SYMBOL LIKE '%dataItem.BOI_UNIT_SYMBOL%'

                          GROUP BY  BOI_UNIT_SYMBOL

                          `

    sql = sql.replaceAll('dataItem.BOI_UNIT_SYMBOL', dataItem['BOI_UNIT_SYMBOL'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    //console.log('hhhh', sql)

    return sql
  },

  // getByLikeProductMainNameAndProductCategoryIdAndInuse: async dataItem => {
  //   let sql = `      SELECT
  //                           tb_1.PRODUCT_MAIN_ID
  //                         , tb_1.PRODUCT_MAIN_NAME
  //                       FROM
  //                         PRODUCT_MAIN tb_1
  //                             INNER JOIN
  //                         PRODUCT_CATEGORY tb_2
  //                             ON (tb_1.PRODUCT_CATEGORY_ID = 'dataItem.PRODUCT_CATEGORY_ID' ) = tb_2.PRODUCT_CATEGORY_ID
  //                       WHERE
  //                             tb_1.PRODUCT_MAIN_NAME LIKE '%dataItem.PRODUCT_MAIN_NAME%'
  //                         AND tb_1.INUSE LIKE '%dataItem.INUSE%'
  //                       ORDER BY
  //                         tb_1.PRODUCT_MAIN_NAME ASC
  //                       LIMIT
  //                         50
  //             `

  //   sql = sql.replaceAll('dataItem.PRODUCT_MAIN_NAME', dataItem['PRODUCT_MAIN_NAME'])
  //   sql = sql.replaceAll(
  //     'dataItem.PRODUCT_CATEGORY_ID',
  //     dataItem['PRODUCT_CATEGORY_ID'] ? dataItem['PRODUCT_CATEGORY_ID'] : ''
  //   )

  //   sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'] ? dataItem['INUSE'] : '')

  //   return sql
  // },

  delete: async (dataItem: any) => {
    let sql = `
    UPDATE
    BOI_NAME_FOR_MATERIAL_CONSUMABLE
    SET
          INUSE = '0'
        , UPDATE_BY = 'dataItem.UPDATE_BY'
        , UPDATE_DATE = CURRENT_TIMESTAMP()
    WHERE
    BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID = 'dataItem.BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID'
      `

    sql = sql.replaceAll('dataItem.BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID', dataItem['BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    //console.log('deleteBoi', sql)
    return sql
  },

  update: async (dataItem: any) => {
    let sql = `    UPDATE
                          BOI_UNIT
                      SET
                          BOI_UNIT_NAME = 'dataItem.BOI_UNIT_NAME'
                          , BOI_UNIT_SYMBOL = 'dataItem.BOI_UNIT_SYMBOL'
                          , INUSE = 'dataItem.INUSE'
                          , UPDATE_BY = 'dataItem.UPDATE_BY'
                          , UPDATE_DATE = CURRENT_TIMESTAMP()
                      WHERE
                          BOI_UNIT_ID = 'dataItem.BOI_UNIT_ID'
                      `

    sql = sql.replaceAll('dataItem.BOI_UNIT_ID', dataItem['BOI_UNIT_ID'])
    sql = sql.replaceAll('dataItem.BOI_UNIT_NAME', dataItem['BOI_UNIT_NAME'])
    sql = sql.replaceAll('dataItem.BOI_UNIT_SYMBOL', dataItem['BOI_UNIT_SYMBOL'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },

  create: async (dataItem: any) => {
    let sql = `
    INSERT INTO BOI_NAME_FOR_MATERIAL_CONSUMABLE
            (
                BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID
              , BOI_GROUP_NO
              , BOI_PROJECT_ID
              , BOI_UNIT_ID
              , BOI_DESCRIPTION_MAIN_NAME
              , BOI_DESCRIPTION_SUB_NAME
              , CREATE_BY
              , UPDATE_BY
              , CREATE_DATE
              , UPDATE_DATE
            )
            SELECT
                1 + COALESCE((SELECT MAX(BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID) FROM BOI_NAME_FOR_MATERIAL_CONSUMABLE), 0)
              , 'dataItem.BOI_GROUP_NO'
              , 'dataItem.BOI_PROJECT_ID'
              , 'dataItem.BOI_UNIT_ID'
              , 'dataItem.BOI_DESCRIPTION_MAIN_NAME'
              , 'dataItem.BOI_DESCRIPTION_SUB_NAME'
              , 'dataItem.CREATE_BY'
              , 'dataItem.CREATE_BY'
              ,  CURRENT_TIMESTAMP()
              ,  CURRENT_TIMESTAMP()
    `
    sql = sql.replaceAll('dataItem.BOI_GROUP_NO', dataItem['BOI_GROUP_NO'])
    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'])
    sql = sql.replaceAll('dataItem.BOI_UNIT_ID', dataItem['BOI_UNIT_ID'])
    sql = sql.replaceAll('dataItem.BOI_DESCRIPTION_MAIN_NAME', dataItem['BOI_DESCRIPTION_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.BOI_DESCRIPTION_SUB_NAME', dataItem['BOI_DESCRIPTION_SUB_NAME'] != ' ' ? dataItem['BOI_DESCRIPTION_SUB_NAME'] : ' ')
    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    //console.log('Add BOI' + sql)
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
    sql = sql.replaceAll('dataItem.BOI_PROJECT_NAME', dataItem['BOI_PROJECT_NAME'])
    sql = sql.replaceAll('dataItem.BOI_GROUP_NO', dataItem['BOI_GROUP_NO'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    sqlList.push(sql)

    sql = `
                            SELECT
                                      tb_1.BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID
                                    , tb_1.BOI_GROUP_NO
                                    , tb_2.BOI_PROJECT_ID
                                    , tb_2.BOI_PROJECT_NAME
                                    , tb_2.BOI_PROJECT_CODE
                                    , tb_3.BOI_UNIT_SYMBOL
                                    , tb_3.BOI_UNIT_ID
                                    , tb_1.BOI_DESCRIPTION_MAIN_NAME
                                    , tb_1.BOI_DESCRIPTION_SUB_NAME
                                    , tb_1.CREATE_BY
                                    , DATE_FORMAT(tb_1.CREATE_DATE, '%d-%b-%Y %H:%i:%s') AS CREATE_DATE
                                    , tb_1.UPDATE_BY AS UPDATE_BY
                                    , DATE_FORMAT(tb_1.UPDATE_DATE, '%d-%b-%Y %H:%i:%s') AS UPDATE_DATE
                                    , tb_1.INUSE as inuseForSearch
                            FROM
                                        dataItem.sqlJoin
                                        dataItem.sqlWhere
                                        dataItem.sqlHaving

                            ORDER BY
                                        dataItem.Order
                            LIMIT
                                        dataItem.Start, dataItem.Limit
        `
    sql = sql.replaceAll('dataItem.sqlWhere', dataItem['sqlWhere'])
    sql = sql.replaceAll('dataItem.sqlHaving', dataItem['sqlHaving'])
    sql = sql.replaceAll('dataItem.sqlJoin', dataItem.sqlJoin)
    sql = sql.replaceAll('dataItem.BOI_GROUP_NO', dataItem['BOI_GROUP_NO'])
    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'])
    sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    sql = sql.replaceAll('dataItem.Order', dataItem['Order'])
    sql = sql.replaceAll('dataItem.Start', dataItem['Start'])
    sql = sql.replaceAll('dataItem.Limit', dataItem['Limit'])
    // //console.log('GOodDay' + sql)
    sqlList.push(sql)

    // sqlList = sqlList.join(";");

    return sqlList
  },

  updateBOIDescriptionSubName: async (dataItem: any) => {
    let sql = `    UPDATE
                          boi_name_for_material_consumable
                      SET
                          BOI_DESCRIPTION_SUB_NAME = 'dataItem.BOI_DESCRIPTION_SUB_NAME'
                      WHERE
                          BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID = 'dataItem.BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID'
                      `

    sql = sql.replaceAll('dataItem.BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID', dataItem['BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID'])
    sql = sql.replaceAll('dataItem.BOI_DESCRIPTION_SUB_NAME', dataItem['BOI_DESCRIPTION_SUB_NAME'])
    // sql = sql.replaceAll('dataItem.BOI_UNIT_NAME', dataItem['BOI_UNIT_NAME'])
    // sql = sql.replaceAll('dataItem.BOI_UNIT_SYMBOL', dataItem['BOI_UNIT_SYMBOL'])
    // sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])
    //console.log(sql)

    return sql
  },
  updateBOIDescriptionMainName: async (element: any, dataItem: any) => {
    let sql = `    UPDATE
                          boi_name_for_material_consumable
                      SET
                          BOI_DESCRIPTION_MAIN_NAME = 'dataItem.BOI_DESCRIPTION_MAIN_NAME'
                          ,BOI_UNIT_ID = 'dataItem.BOI_UNIT_ID'
                      WHERE
                          BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID = 'dataItem.BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID'
                      `

    sql = sql.replaceAll('dataItem.BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID', element['BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID'])
    sql = sql.replaceAll('dataItem.BOI_DESCRIPTION_MAIN_NAME', dataItem['BOI_DESCRIPTION_MAIN_NAME'])
    sql = sql.replaceAll('dataItem.BOI_UNIT_ID', dataItem['BOI_UNIT_ID'])
    // sql = sql.replaceAll('dataItem.BOI_UNIT_NAME', dataItem['BOI_UNIT_NAME'])
    // sql = sql.replaceAll('dataItem.BOI_UNIT_SYMBOL', dataItem['BOI_UNIT_SYMBOL'])
    // sql = sql.replaceAll('dataItem.INUSE', dataItem['INUSE'])
    // sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'])

    return sql
  },
  getBoiNameForMaterial: async (dataItem: any) => {
    let sql = `
                    SELECT BOI_NAME_FOR_MATERIAL_CONSUMABLE_ID
                          ,BOI_DESCRIPTION_MAIN_NAME
                          ,BOI_DESCRIPTION_SUB_NAME
                          ,BOI_UNIT_ID
                    FROM BOI_NAME_FOR_MATERIAL_CONSUMABLE
                    WHERE BOI_PROJECT_ID = 'dataItem.BOI_PROJECT_ID'
                      AND BOI_GROUP_NO = 'dataItem.BOI_GROUP_NO'
                      AND INUSE = 1
    `

    sql = sql.replaceAll('dataItem.BOI_PROJECT_ID', dataItem['BOI_PROJECT_ID'])
    sql = sql.replaceAll('dataItem.BOI_GROUP_NO', dataItem['BOI_GROUP_NO'])

    return sql
  },
}
