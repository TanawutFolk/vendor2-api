import { MySQLExecute } from '@businessData/dbExecute'
import { ClearTimeSQL } from '@src/_workspace/sql/sct/clear-time/ClearTimeSQL'
import { ResponseI } from '@src/types/ResponseI'
import { RowDataPacket } from 'mysql2'

import { v7 as uuidv7 } from 'uuid'

export const ClearTimeService = {
  getClearTimeExportDataByProductTypeId: async (dataItem: any) => {
    // ** Check Revision
    let resultData
    let sqlWhere = ''
    // console.log(dataItem)

    let sqlCheck = await ClearTimeSQL.GetLastClearTimeRevision(dataItem)
    resultData = (await MySQLExecute.search(sqlCheck)) as RowDataPacket[]

    if (resultData.length > 0) {
      // if (resultData[0].FISCAL_YEAR != 0 && resultData[0].FISCAL_YEAR != null) {
      //   sqlWhere += ` AND tb_9.FISCAL_YEAR  = '${resultData[0].FISCAL_YEAR}'`
      // }
      if (resultData[0].REVISION_NO > 0) {
        sqlWhere += ` AND tb_9.REVISION_NO = '${resultData[0].REVISION_NO}'`
      }

      const sql = await ClearTimeSQL.getClearTimeExportDataByProductTypeId(dataItem, sqlWhere)
      resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
      return resultData
    }
  },

  createClearTime: async (dataItem: any) => {
    try {
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

        sqlList.push(await ClearTimeSQL.generateClearTimeRevisionNo(element[0]))

        // ** Insert Total
        const CLEAR_TIME_TOTAL_FOR_SCT_ID = uuidv7()
        sqlList.push(await ClearTimeSQL.insertTotalClearTime(element[0], CLEAR_TIME_TOTAL_FOR_SCT_ID))

        // ** Insert Process
        for (const data of element) {
          const UUID_CLEAR_TIME_PROCESS_FOR_SCT_ID = uuidv7()
          sqlList.push(await ClearTimeSQL.insertClearTime(data, UUID_CLEAR_TIME_PROCESS_FOR_SCT_ID))
        }
      }

      await MySQLExecute.executeList(sqlList)

      return {
        Status: true,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Create Clear Time',
        Message: 'บันทึกข้อมูลสำเร็จ Successfully saved',
      } as ResponseI
    } catch (error) {
      return {
        Status: false,
        ResultOnDb: [],
        TotalCountOnDb: 0,
        MethodOnDb: 'Create Clear Time',
        Message: 'บันทึกข้อมูลไม่สำเร็จ Failed to save' + error,
      } as ResponseI
    }
  },
}
