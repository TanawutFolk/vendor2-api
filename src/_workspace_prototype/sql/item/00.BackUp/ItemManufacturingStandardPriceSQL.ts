export const ItemManufacturingStandardPriceSQL = {
  getStandardPriceByItemId: async (dataItem: any, fiscalYear: any) => {
    let sql = `
                SELECT
                    ITEM_M_S_PRICE_ID
                FROM
                    ITEM_M_O_PRICE tb_1
                JOIN
                    ITEM_M_S_PRICE tb_2
                ON
                    tb_1.ITEM_M_O_PRICE_ID = tb_2.ITEM_M_O_PRICE_ID AND tb_1.INUSE = '1' AND tb_2.INUSE = '1'
                WHERE
                        tb_1.ITEM_ID IN (${dataItem.join(',')})
                    AND tb_2.FISCAL_YEAR = 'dataItem.FISCAL_YEAR'
                `

    sql = sql.replaceAll('dataItem.FISCAL_YEAR', fiscalYear)

    return sql
  },
  getItemMSPriceBySctFId: async (dataItem: any) => {
    let sql = `
                SELECT
                      tb_2.ITEM_M_S_PRICE_ID
                    , tb_4.ITEM_ID
                FROM
                    SCR_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT tb_1
                ON
                    tb_1.SCT_F_ID = tb_1.SCT_F_ID AND tb_1.INUSE = 1
                JOIN
                    SCT_F_MATERIAL_PRICE tb_2
                ON
                    tb_1.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID = tb_2.SCT_F_COMPONENT_TYPE_RESOURCE_OPTION_SELECT_ID
                JOIN
                    ITEM_M_S_PRICE tb_3
                ON
                    tb_2.ITEM_M_S_PRICE_ID = tb_3.ITEM_M_S_PRICE_ID
                JOIN
                    ITEM_M_O_PRICE tb_4
                ON
                    tb_4.ITEM_M_O_PRICE_ID = tb_4.ITEM_M_O_PRICE_ID
                WHERE
                        tb_1.SCT_F_ID = dataItem.SCT_F_ID
                    AND tb_1.SCT_F_COMPONENT_TYPE_ID = 2
                `

    sql = sql.replaceAll('dataItem.PRODUCT_TYPE_ID', dataItem['MATERIAL_PRICE'].SCT_F_ID)

    return sql
  },
}
