export const SctCostConditionSettingSQL = {
  deleteBySctId: async (dataItem: { SCT_ID: string }) => {
    const sql = `
      UPDATE ${process.env.STANDARD_COST_DB}.sct_cost_condition_setting
      SET
            INUSE = 0
          , UPDATE_DATE = CURRENT_TIMESTAMP()
      WHERE
            SCT_ID = '${dataItem.SCT_ID}'
        AND INUSE = 1
    `
    return sql
  },

  insert: async (dataItem: { SCT_ID: string; COST_CONDITION_SETTING_ID: number; CREATE_BY: string; UPDATE_BY: string }) => {
    const sql = `
      INSERT INTO ${process.env.STANDARD_COST_DB}.sct_cost_condition_setting
      (
            COST_CONDITION_SETTING_ID
          , SCT_ID
          , CREATE_DATE
          , UPDATE_DATE
          , CREATE_BY
          , UPDATE_BY
          , INUSE
      )
      VALUES
      (
            ${dataItem.COST_CONDITION_SETTING_ID}
          , '${dataItem.SCT_ID}'
          , CURRENT_TIMESTAMP()
          , CURRENT_TIMESTAMP()
          , '${dataItem.CREATE_BY}'
          , '${dataItem.UPDATE_BY}'
          , 1
      )
    `
    return sql
  },
}
