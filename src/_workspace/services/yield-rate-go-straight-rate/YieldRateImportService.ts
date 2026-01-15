import { MySQLExecute } from '@businessData/dbExecute'
import { YieldRateAndGoStraightRateSQL } from '@src/_workspace/sql/sct/yield-rate-go-straight-rate/YieldRateAndGoStraightRateSQL'
import { RowDataPacket } from 'mysql2'

import { v7 as uuidv7 } from 'uuid'

export const YieldRateImportService = {
  createYieldRate: async (dataItem: any) => {
    let sqlList = []

    // ** Separate Data By Product Type [Group By]
    const groupedByProductType = dataItem.reduce((group: any, item: any) => {
      const { PRODUCT_TYPE_ID } = item
      if (!group[PRODUCT_TYPE_ID]) {
        group[PRODUCT_TYPE_ID] = []
      }
      group[PRODUCT_TYPE_ID].push(item)
      return group
    }, {})

    for (let i = 0; i < Object.keys(groupedByProductType)?.length; i++) {
      const element = groupedByProductType[Object.keys(groupedByProductType)[i]]

      sqlList.push(await YieldRateAndGoStraightRateSQL.generateYieldRateRevisionNo(element[0]))

      // ** Insert Total
      const YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT_ID = uuidv7()
      sqlList.push(await YieldRateAndGoStraightRateSQL.insertTotalYieldRate(element[0], YIELD_RATE_GO_STRAIGHT_RATE_TOTAL_FOR_SCT_ID))

      // ** Insert Process
      for (const data of element) {
        const UUID_YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT_ID = uuidv7()
        sqlList.push(await YieldRateAndGoStraightRateSQL.insertYieldRate(data, UUID_YIELD_RATE_GO_STRAIGHT_RATE_PROCESS_FOR_SCT_ID))
      }
    }

    let resultData = await MySQLExecute.executeList(sqlList)

    return resultData
  },
  getAll: async () => {
    let sql = await YieldRateAndGoStraightRateSQL.getAll()
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },
}
