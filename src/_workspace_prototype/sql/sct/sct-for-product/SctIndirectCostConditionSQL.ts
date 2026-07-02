export const SctIndirectCostConditionSQL = {
  deleteBySctId: async (dataItem: { SCT_ID: string; UPDATE_BY: string }) => {
    const sql = `
      UPDATE ${process.env.STANDARD_COST_DB}.SCT_INDIRECT_COST_CONDITION
      SET
            INUSE = 0
          , UPDATE_DATE = CURRENT_TIMESTAMP()
          , UPDATE_BY = '${dataItem.UPDATE_BY}'
      WHERE
            SCT_ID = '${dataItem.SCT_ID}'
        AND INUSE = 1
    `

    return sql
  },

  insert: async (dataItem: { SCT_ID: string; INDIRECT_COST_CONDITION_ID: number; CREATE_BY: string; UPDATE_BY: string }) => {
    const sql = `
      INSERT INTO ${process.env.STANDARD_COST_DB}.SCT_INDIRECT_COST_CONDITION
      (
            INDIRECT_COST_CONDITION_ID
          , SCT_ID
          , CREATE_DATE
          , UPDATE_DATE
          , CREATE_BY
          , UPDATE_BY
          , INUSE
      )
      VALUES
      (
            ${dataItem.INDIRECT_COST_CONDITION_ID}
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
