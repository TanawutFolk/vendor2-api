export const FlowProcessSQL = {
  getByFlowId: async (dataItem: any) => {
    let sql = `     SELECT
                                tb_1.NO
                              , tb_1.FLOW_PROCESS_ID
                              , tb_2.PROCESS_ID
                              , tb_2.PROCESS_NAME
                              , tb_2.PROCESS_CODE
                              , tb_1.FLOW_ID
                    FROM
                              FLOW_PROCESS tb_1
                                  INNER JOIN
                              PROCESS tb_2
                                  ON tb_1.PROCESS_ID = tb_2.PROCESS_ID
                    WHERE
                                  tb_1.FLOW_ID = 'dataItem.FLOW_ID'
                              AND tb_1.INUSE = 1
                    ORDER BY
                              tb_1.NO
              `

    sql = sql.replaceAll('dataItem.FLOW_ID', dataItem['FLOW_ID'])

    return sql
  },
}
