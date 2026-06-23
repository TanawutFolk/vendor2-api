import { MySQLExecute } from '@businessData/dbExecute'
import { AssigneesSQL } from '../../sql/_Employee-manager/AssigneesSQL'
import { ResultSetHeader, RowDataPacket } from 'mysql2'

export const AssigneesService = {
  getGroups: async (dataItem: any) => {
    const sql = await AssigneesSQL.getGroups(dataItem || {})
    const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
    return resultData
  },

  // Search assignees
  search: async (dataItem: any) => {
    const [countSql, dataSql] = await AssigneesSQL.search(dataItem)
    const totalCountRows = (await MySQLExecute.search(countSql)) as RowDataPacket[]
    const resultData = (await MySQLExecute.search(dataSql)) as RowDataPacket[]

    return {
      resultData,
      totalCount: Number(totalCountRows[0]?.TOTAL_COUNT || 0),
    }
  },

  // Save assignee (Create or Update)
  save: async (dataItem: any) => {
    try {
      const empcode = String(dataItem.EMPCODE || '').trim()
      const groupCode = String(dataItem.GROUP_CODE || '')
        .trim()
        .toUpperCase()
      const updateBy = String(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM').trim() || 'SYSTEM'
      const inUse = dataItem.INUSE === 0 || dataItem.INUSE === '0' || dataItem.INUSE === false ? 0 : 1

      if (!empcode) throw new Error('Employee code is required')
      if (!groupCode) throw new Error('Group code is required')

      const duplicateSql = await AssigneesSQL.findDuplicate({
        ASSIGNEES_TO_ID: dataItem.ASSIGNEES_TO_ID,
        EMPCODE: empcode,
        GROUP_CODE: groupCode,
      })
      const duplicateRows = (await MySQLExecute.search(duplicateSql)) as RowDataPacket[]
      const duplicate = duplicateRows[0]

      if (duplicate) {
        throw new Error(`Employee ${empcode} is already assigned to group ${groupCode}`)
      }

      let sql = ''
      let method = ''

      if (dataItem.ASSIGNEES_TO_ID) {
        sql = await AssigneesSQL.update({
          ...dataItem,
          EMPCODE: empcode,
          GROUP_CODE: groupCode,
          UPDATE_BY: updateBy,
          INUSE: inUse,
        })
        method = 'Update Assignee'
      } else {
        sql = await AssigneesSQL.insert({
          ...dataItem,
          EMPCODE: empcode,
          GROUP_CODE: groupCode,
          CREATE_BY: updateBy,
          UPDATE_BY: updateBy,
          INUSE: inUse,
        })
        method = 'Create Assignee'
      }

      const resultData = (await MySQLExecute.execute(sql)) as ResultSetHeader

      return {
        Status: true,
        Message: 'Data has been saved successfully',
        ResultOnDb: resultData,
        MethodOnDb: method,
        TotalCountOnDb: 1,
      }
    } catch (error: any) {
      console.error('Error in AssigneesService.save:', error)
      return {
        Status: false,
        Message: error?.message || 'Failed to save data',
        ResultOnDb: [],
        MethodOnDb: 'Save Assignee Failed',
        TotalCountOnDb: 0,
      }
    }
  },
}
