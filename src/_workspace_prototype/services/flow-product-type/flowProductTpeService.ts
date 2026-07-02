import { FlowProductTypeSQL } from '@src/_workspace/sql/flow-product-type/FlowProductTypeSQL'
import { MySQLExecute } from '@src/businessData/dbExecute'
import { RowDataPacket } from 'mysql2'

export const FlowProductTypeService = {
  searchFlowProductTypeByFlowId: async (dataItem: any) => {
    let sql = await FlowProductTypeSQL.searchFlowProductTypeByFlowId(dataItem)
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
