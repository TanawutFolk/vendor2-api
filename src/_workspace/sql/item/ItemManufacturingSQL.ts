export const ItemManufacturingSQL = {
  getByLikeItemManufacturingByProductTypeId: async (dataItem: any) => {
    let sql = `            SELECT     tb_3.ITEM_ID
                                    , tb_3.ITEM_CODE_FOR_SUPPORT_MES
                                    , tb_3.ITEM_INTERNAL_CODE
                                    , tb_3.ITEM_INTERNAL_SHORT_NAME
                                    , tb_3.ITEM_INTERNAL_FULL_NAME

                           FROM
                                BOM tb_1
                            JOIN BOM_FLOW_PROCESS_ITEM_USAGE tb_2 ON tb_2.BOM_ID = tb_1.BOM_ID AND tb_1.PRODUCT_MAIN_ID = 'dataItem.PRODUCT_MAIN_ID'
                            AND tb_2.INUSE = 1
                            JOIN ITEM_MANUFACTURING tb_3 ON tb_3.ITEM_ID = tb_2.ITEM_ID AND tb_3.INUSE = 1
                            JOIN ITEM tb_4 ON tb_4.ITEM_ID = tb_3.ITEM_ID AND tb_4.INUSE = 1
                            JOIN ITEM_CATEGORY tb_5 ON tb_5.ITEM_CATEGORY_ID = tb_4.ITEM_CATEGORY_ID AND tb_5.PURCHASE_MODULE_ID = 3 AND tb_5.INUSE = 1

                            GROUP BY tb_3.ITEM_ID
                            ORDER BY tb_3.ITEM_CODE_FOR_SUPPORT_MES
                    `

    sql = sql.replaceAll('dataItem.PRODUCT_MAIN_ID', dataItem['PRODUCT_MAIN_ID'])
    //  console.log(sql)
    return sql
  },
  createItemManufacturingByProductType: async (dataItem: any) => {
    let sql = `
      INSERT INTO ITEM_MANUFACTURING
      (
                ITEM_MANUFACTURING_ID
              , ITEM_ID
              , ITEM_PURPOSE_ID
              , ITEM_GROUP_ID
              , VENDOR_ID
              , MAKER_ID
              , WIDTH
              , HEIGHT
              , DEPTH
              , ITEM_PROPERTY_COLOR_ID
              , ITEM_PROPERTY_SHAPE_ID
              , ITEM_PROPERTY_MADE_BY_ID
              , IMAGE_PATH
              , ITEM_INTERNAL_CODE
              , ITEM_INTERNAL_FULL_NAME
              , ITEM_INTERNAL_SHORT_NAME
              , ITEM_EXTERNAL_CODE
              , ITEM_EXTERNAL_FULL_NAME
              , ITEM_EXTERNAL_SHORT_NAME
              , IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE
              , ITEM_CODE_FOR_SUPPORT_MES
              , PURCHASE_UNIT_ID
              , PURCHASE_UNIT_RATIO
              , USAGE_UNIT_RATIO
              , USAGE_UNIT_ID
              , CREATE_BY
              , UPDATE_DATE
              , UPDATE_BY
      )
      SELECT
                1 + coalesce((SELECT max(ITEM_MANUFACTURING_ID) FROM ITEM_MANUFACTURING), 0)
              ,  @itemId
              , 'dataItem.ITEM_PURPOSE_ID'
              ,  @itemGroupId
              , 'dataItem.VENDOR_ID'
              , 'dataItem.MAKER_ID'
              , dataItem.WIDTH
              , dataItem.HEIGHT
              , dataItem.DEPTH
              , dataItem.ITEM_PROPERTY_COLOR_ID
              , dataItem.ITEM_PROPERTY_SHAPE_ID
              , dataItem.ITEM_PROPERTY_MADE_BY_ID
              , dataItem.IMAGE_PATH
              , 'dataItem.ITEM_INTERNAL_CODE'
              , 'dataItem.ITEM_INTERNAL_FULL_NAME'
              , dataItem.ITEM_INTERNAL_SHORT_NAME
              , 'dataItem.ITEM_EXTERNAL_CODE'
              , 'dataItem.ITEM_EXTERNAL_FULL_NAME'
              , 'dataItem.ITEM_EXTERNAL_SHORT_NAME'
              , 'dataItem.IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE'
              , 'dataItem.ITEM_CODE_FOR_SUPPORT_MES'
              , 'dataItem.PURCHASE_UNIT_ID'
              , 'dataItem.PURCHASE_UNIT_RATIO'
              , 'dataItem.USAGE_UNIT_RATIO'
              , 'dataItem.USAGE_UNIT_ID'
              , 'dataItem.CREATE_BY'
              ,  CURRENT_TIMESTAMP()
              , 'dataItem.CREATE_BY'

                                `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.ITEM_PURPOSE_ID', dataItem['ITEM_PURPOSE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_GROUP_ID', dataItem['ITEM_GROUP_ID'])
    sql = sql.replaceAll('dataItem.VENDOR_ID', dataItem['VENDOR_ID'])
    sql = sql.replaceAll('dataItem.MAKER_ID', dataItem['MAKER_ID'])

    sql = sql.replaceAll('dataItem.WIDTH', dataItem['WIDTH'] != '' ? dataItem['WIDTH'] : 'NULL')
    sql = sql.replaceAll('dataItem.HEIGHT', dataItem['HEIGHT'] != '' ? dataItem['HEIGHT'] : 'NULL')
    sql = sql.replaceAll('dataItem.DEPTH', dataItem['DEPTH'] != '' ? dataItem['DEPTH'] : 'NULL')

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_COLOR_ID', dataItem['ITEM_PROPERTY_COLOR_ID'] != '' ? dataItem['ITEM_PROPERTY_COLOR_ID'] : 'NULL')
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_SHAPE_ID', dataItem['ITEM_PROPERTY_SHAPE_ID'] != '' ? dataItem['ITEM_PROPERTY_SHAPE_ID'] : 'NULL')
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_MADE_BY_ID', dataItem['ITEM_PROPERTY_MADE_BY_ID'] != '' ? dataItem['ITEM_PROPERTY_MADE_BY_ID'] : 'NULL')

    sql = sql.replaceAll('dataItem.IMAGE_PATH', dataItem['IMAGE_PATH'] != '' ? "'" + dataItem['IMAGE_PATH'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_CODE', dataItem['ITEM_INTERNAL_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_FULL_NAME', dataItem['ITEM_INTERNAL_FULL_NAME'])

    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_SHORT_NAME', dataItem['ITEM_INTERNAL_SHORT_NAME'] != '' ? "'" + dataItem['ITEM_INTERNAL_SHORT_NAME'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.ITEM_EXTERNAL_CODE', dataItem['ITEM_EXTERNAL_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_EXTERNAL_FULL_NAME', dataItem['ITEM_EXTERNAL_FULL_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_EXTERNAL_SHORT_NAME', dataItem['ITEM_EXTERNAL_SHORT_NAME'])

    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])

    sql = sql.replaceAll('dataItem.IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE', dataItem['IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE'])

    sql = sql.replaceAll('dataItem.PURCHASE_UNIT_ID', dataItem['PURCHASE_UNIT_ID'])
    sql = sql.replaceAll('dataItem.PURCHASE_UNIT_RATIO', dataItem['PURCHASE_UNIT_RATIO'])
    sql = sql.replaceAll('dataItem.USAGE_UNIT_RATIO', dataItem['USAGE_UNIT_RATIO'])
    sql = sql.replaceAll('dataItem.USAGE_UNIT_ID', dataItem['USAGE_UNIT_ID'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  createItemManufacturingByProductTypeAndItemGroupId: async (dataItem: any) => {
    let sql = `
      INSERT INTO ITEM_MANUFACTURING
      (
                ITEM_MANUFACTURING_ID
              , ITEM_ID
              , ITEM_PURPOSE_ID
              , ITEM_GROUP_ID
              , VENDOR_ID
              , MAKER_ID
              , WIDTH
              , HEIGHT
              , DEPTH
              , ITEM_PROPERTY_COLOR_ID
              , ITEM_PROPERTY_SHAPE_ID
              , ITEM_PROPERTY_MADE_BY_ID
              , IMAGE_PATH
              , ITEM_INTERNAL_CODE
              , ITEM_INTERNAL_FULL_NAME
              , ITEM_INTERNAL_SHORT_NAME
              , ITEM_EXTERNAL_CODE
              , ITEM_EXTERNAL_FULL_NAME
              , ITEM_EXTERNAL_SHORT_NAME
              , IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE
              , ITEM_CODE_FOR_SUPPORT_MES
              , PURCHASE_UNIT_ID
              , PURCHASE_UNIT_RATIO
              , USAGE_UNIT_RATIO
              , USAGE_UNIT_ID
              , CREATE_BY
              , UPDATE_DATE
              , UPDATE_BY
      )
      SELECT
                1 + coalesce((SELECT max(ITEM_MANUFACTURING_ID) FROM ITEM_MANUFACTURING), 0)
              ,  @itemId
              , 'dataItem.ITEM_PURPOSE_ID'
              , 'dataItem.ITEM_GROUP_ID'
              , 'dataItem.VENDOR_ID'
              , 'dataItem.MAKER_ID'
              , dataItem.WIDTH
              , dataItem.HEIGHT
              , dataItem.DEPTH
              , dataItem.ITEM_PROPERTY_COLOR_ID
              , dataItem.ITEM_PROPERTY_SHAPE_ID
              , dataItem.ITEM_PROPERTY_MADE_BY_ID
              , dataItem.IMAGE_PATH
              , 'dataItem.ITEM_INTERNAL_CODE'
              , 'dataItem.ITEM_INTERNAL_FULL_NAME'
              , dataItem.ITEM_INTERNAL_SHORT_NAME
              , 'dataItem.ITEM_EXTERNAL_CODE'
              , 'dataItem.ITEM_EXTERNAL_FULL_NAME'
              , 'dataItem.ITEM_EXTERNAL_SHORT_NAME'
              , 'dataItem.IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE'
              , 'dataItem.ITEM_CODE_FOR_SUPPORT_MES'
              , 'dataItem.PURCHASE_UNIT_ID'
              , 'dataItem.PURCHASE_UNIT_RATIO'
              , 'dataItem.USAGE_UNIT_RATIO'
              , 'dataItem.USAGE_UNIT_ID'
              , 'dataItem.CREATE_BY'
              ,  CURRENT_TIMESTAMP()
              , 'dataItem.CREATE_BY'

                                `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.ITEM_PURPOSE_ID', dataItem['ITEM_PURPOSE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_GROUP_ID', dataItem['ITEM_GROUP_ID'])
    sql = sql.replaceAll('dataItem.VENDOR_ID', dataItem['VENDOR_ID'])
    sql = sql.replaceAll('dataItem.MAKER_ID', dataItem['MAKER_ID'])

    sql = sql.replaceAll('dataItem.WIDTH', dataItem['WIDTH'] != '' ? dataItem['WIDTH'] : 'NULL')
    sql = sql.replaceAll('dataItem.HEIGHT', dataItem['HEIGHT'] != '' ? dataItem['HEIGHT'] : 'NULL')
    sql = sql.replaceAll('dataItem.DEPTH', dataItem['DEPTH'] != '' ? dataItem['DEPTH'] : 'NULL')

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_COLOR_ID', dataItem['ITEM_PROPERTY_COLOR_ID'] != '' ? dataItem['ITEM_PROPERTY_COLOR_ID'] : 'NULL')
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_SHAPE_ID', dataItem['ITEM_PROPERTY_SHAPE_ID'] != '' ? dataItem['ITEM_PROPERTY_SHAPE_ID'] : 'NULL')
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_MADE_BY_ID', dataItem['ITEM_PROPERTY_MADE_BY_ID'] != '' ? dataItem['ITEM_PROPERTY_MADE_BY_ID'] : 'NULL')

    sql = sql.replaceAll('dataItem.IMAGE_PATH', dataItem['IMAGE_PATH'] != '' ? "'" + dataItem['IMAGE_PATH'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_CODE', dataItem['ITEM_INTERNAL_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_FULL_NAME', dataItem['ITEM_INTERNAL_FULL_NAME'])

    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_SHORT_NAME', dataItem['ITEM_INTERNAL_SHORT_NAME'] != '' ? "'" + dataItem['ITEM_INTERNAL_SHORT_NAME'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.ITEM_EXTERNAL_CODE', dataItem['ITEM_EXTERNAL_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_EXTERNAL_FULL_NAME', dataItem['ITEM_EXTERNAL_FULL_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_EXTERNAL_SHORT_NAME', dataItem['ITEM_EXTERNAL_SHORT_NAME'])

    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])

    sql = sql.replaceAll('dataItem.IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE', dataItem['IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE'])

    sql = sql.replaceAll('dataItem.PURCHASE_UNIT_ID', dataItem['PURCHASE_UNIT_ID'])
    sql = sql.replaceAll('dataItem.PURCHASE_UNIT_RATIO', dataItem['PURCHASE_UNIT_RATIO'])
    sql = sql.replaceAll('dataItem.USAGE_UNIT_RATIO', dataItem['USAGE_UNIT_RATIO'])
    sql = sql.replaceAll('dataItem.USAGE_UNIT_ID', dataItem['USAGE_UNIT_ID'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
  createItemManufacturing: async (dataItem: {
    ITEM_CODE_FOR_SUPPORT_MES: string
    ITEM_CATEGORY_ID: string

    ITEM_PURPOSE_ID: string
    ITEM_GROUP_ID: string
    VENDOR_ID: string
    MAKER_ID: string
    WIDTH: string
    HEIGHT: string
    DEPTH: string

    ITEM_PROPERTY_COLOR_ID: string
    ITEM_PROPERTY_SHAPE_ID: string

    ITEM_INTERNAL_FULL_NAME: string
    ITEM_INTERNAL_SHORT_NAME: string
    ITEM_EXTERNAL_CODE: string
    ITEM_EXTERNAL_FULL_NAME: string
    ITEM_EXTERNAL_SHORT_NAME: string

    PURCHASE_UNIT_ID: string
    PURCHASE_UNIT_RATIO: string
    USAGE_UNIT_RATIO: string
    USAGE_UNIT_ID: string

    CREATE_BY: string
  }) => {
    let sql = `
    INSERT INTO ITEM_MANUFACTURING
    (
              ITEM_MANUFACTURING_ID
            , ITEM_ID
            , ITEM_PURPOSE_ID
            , ITEM_GROUP_ID
            , VENDOR_ID
            , MAKER_ID
            , WIDTH
            , HEIGHT
            , DEPTH
            , ITEM_PROPERTY_COLOR_ID
            , ITEM_PROPERTY_SHAPE_ID
            , ITEM_PROPERTY_MADE_BY_ID
            , IMAGE_PATH
            , ITEM_INTERNAL_CODE
            , ITEM_INTERNAL_FULL_NAME
            , ITEM_INTERNAL_SHORT_NAME
            , ITEM_EXTERNAL_CODE
            , ITEM_EXTERNAL_FULL_NAME
            , ITEM_EXTERNAL_SHORT_NAME
            , IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE
            , ITEM_CODE_FOR_SUPPORT_MES
            , PURCHASE_UNIT_ID
            , PURCHASE_UNIT_RATIO
            , USAGE_UNIT_RATIO
            , USAGE_UNIT_ID
            , CREATE_BY
            , UPDATE_DATE
            , UPDATE_BY
            , VERSION_NO
            , IS_CURRENT
    )
    SELECT
              1 + coalesce((SELECT max(ITEM_MANUFACTURING_ID) FROM ITEM_MANUFACTURING), 0)
            ,  @itemId
            , 'dataItem.ITEM_PURPOSE_ID'
            , 'dataItem.ITEM_GROUP_ID'
            , 'dataItem.VENDOR_ID'
            , 'dataItem.MAKER_ID'
            , dataItem.WIDTH
            , dataItem.HEIGHT
            , dataItem.DEPTH
            , dataItem.ITEM_PROPERTY_COLOR_ID
            , dataItem.ITEM_PROPERTY_SHAPE_ID
            , dataItem.ITEM_PROPERTY_MADE_BY_ID
            , dataItem.IMAGE_PATH
            , 'dataItem.ITEM_INTERNAL_CODE'
            , 'dataItem.ITEM_INTERNAL_FULL_NAME'
            , dataItem.ITEM_INTERNAL_SHORT_NAME
            , 'dataItem.ITEM_EXTERNAL_CODE'
            , 'dataItem.ITEM_EXTERNAL_FULL_NAME'
            , 'dataItem.ITEM_EXTERNAL_SHORT_NAME'
            , 'dataItem.IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE'
            , 'dataItem.ITEM_CODE_FOR_SUPPORT_MES'
            , 'dataItem.PURCHASE_UNIT_ID'
            , 'dataItem.PURCHASE_UNIT_RATIO'
            , 'dataItem.USAGE_UNIT_RATIO'
            , 'dataItem.USAGE_UNIT_ID'
            , 'dataItem.CREATE_BY'
            ,  CURRENT_TIMESTAMP()
            , 'dataItem.CREATE_BY'
            , 1
            , 1

                              `

    sql = sql.replaceAll('dataItem.ITEM_CATEGORY_ID', dataItem['ITEM_CATEGORY_ID'])
    sql = sql.replaceAll('dataItem.ITEM_PURPOSE_ID', dataItem['ITEM_PURPOSE_ID'])
    sql = sql.replaceAll('dataItem.ITEM_GROUP_ID', dataItem['ITEM_GROUP_ID'])
    sql = sql.replaceAll('dataItem.VENDOR_ID', dataItem['VENDOR_ID'])
    sql = sql.replaceAll('dataItem.MAKER_ID', dataItem['MAKER_ID'])

    sql = sql.replaceAll('dataItem.WIDTH', dataItem['WIDTH'] != '' ? dataItem['WIDTH'] : 'NULL')
    sql = sql.replaceAll('dataItem.HEIGHT', dataItem['HEIGHT'] != '' ? dataItem['HEIGHT'] : 'NULL')
    sql = sql.replaceAll('dataItem.DEPTH', dataItem['DEPTH'] != '' ? dataItem['DEPTH'] : 'NULL')

    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_COLOR_ID', dataItem['ITEM_PROPERTY_COLOR_ID'] != '' ? dataItem['ITEM_PROPERTY_COLOR_ID'] : 'NULL')
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_SHAPE_ID', dataItem['ITEM_PROPERTY_SHAPE_ID'] != '' ? dataItem['ITEM_PROPERTY_SHAPE_ID'] : 'NULL')
    sql = sql.replaceAll('dataItem.ITEM_PROPERTY_MADE_BY_ID', 'NULL')

    sql = sql.replaceAll('dataItem.IMAGE_PATH', 'NULL')

    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_CODE', '')
    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_FULL_NAME', dataItem['ITEM_INTERNAL_FULL_NAME'])

    sql = sql.replaceAll('dataItem.ITEM_INTERNAL_SHORT_NAME', dataItem['ITEM_INTERNAL_SHORT_NAME'] != '' ? "'" + dataItem['ITEM_INTERNAL_SHORT_NAME'] + "'" : 'NULL')

    sql = sql.replaceAll('dataItem.ITEM_EXTERNAL_CODE', dataItem['ITEM_EXTERNAL_CODE'])
    sql = sql.replaceAll('dataItem.ITEM_EXTERNAL_FULL_NAME', dataItem['ITEM_EXTERNAL_FULL_NAME'])
    sql = sql.replaceAll('dataItem.ITEM_EXTERNAL_SHORT_NAME', dataItem['ITEM_EXTERNAL_SHORT_NAME'])

    sql = sql.replaceAll('dataItem.ITEM_CODE_FOR_SUPPORT_MES', dataItem['ITEM_CODE_FOR_SUPPORT_MES'])

    sql = sql.replaceAll('dataItem.IS_SAME_ITEM_INTERNAL_CODE_FOR_ITEM_EXTERNAL_CODE', '0')

    sql = sql.replaceAll('dataItem.PURCHASE_UNIT_ID', dataItem['PURCHASE_UNIT_ID'])
    sql = sql.replaceAll('dataItem.PURCHASE_UNIT_RATIO', dataItem['PURCHASE_UNIT_RATIO'])
    sql = sql.replaceAll('dataItem.USAGE_UNIT_RATIO', dataItem['USAGE_UNIT_RATIO'])
    sql = sql.replaceAll('dataItem.USAGE_UNIT_ID', dataItem['USAGE_UNIT_ID'])

    sql = sql.replaceAll('dataItem.CREATE_BY', dataItem['CREATE_BY'])

    return sql
  },
}
