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
        const sql = await AssigneesSQL.search(dataItem)
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },

    // Save assignee (Create or Update)
    save: async (dataItem: any) => {
        try {
            const empcode = String(dataItem.empcode || '').trim()
            const groupCode = String(dataItem.group_code || '').trim().toUpperCase()
            const inUse = dataItem.INUSE === 0 || dataItem.INUSE === '0' || dataItem.INUSE === false ? 0 : 1

            if (!empcode) throw new Error('Employee code is required')
            if (!groupCode) throw new Error('Group code is required')

            const duplicateSql = await AssigneesSQL.findDuplicate({
                Assignees_id: dataItem.Assignees_id,
                empcode,
                group_code: groupCode,
            })
            const duplicateRows = (await MySQLExecute.search(duplicateSql)) as RowDataPacket[]
            const duplicate = duplicateRows[0]

            if (duplicate) {
                throw new Error(`Employee ${empcode} is already assigned to group ${groupCode}`)
            }

            let sql = ''
            let method = ''
            
            if (dataItem.Assignees_id) {
                sql = await AssigneesSQL.update({
                    ...dataItem,
                    empcode,
                    group_code: groupCode,
                    INUSE: inUse,
                })
                method = 'Update Assignee'
            } else {
                sql = await AssigneesSQL.insert({
                    ...dataItem,
                    empcode,
                    group_code: groupCode,
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
                TotalCountOnDb: 1
            }
        } catch (error: any) {
            console.error(`Error in AssigneesService.save:`, error)
            return {
                Status: false,
                Message: error?.message || 'Failed to save data',
                ResultOnDb: [],
                MethodOnDb: 'Save Assignee Failed',
                TotalCountOnDb: 0
            }
        }
    }
}
