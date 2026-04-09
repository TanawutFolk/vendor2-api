import { MySQLExecute } from '@businessData/dbExecute'
import { AssigneesSQL } from '../../sql/_task-manager/AssigneesSQL'
import { ResultSetHeader, RowDataPacket } from 'mysql2'

export const AssigneesService = {
    // Search assignees
    search: async (dataItem: any) => {
        const sql = await AssigneesSQL.search(dataItem)
        const resultData = (await MySQLExecute.search(sql)) as RowDataPacket[]
        return resultData
    },

    // Save assignee (Create or Update)
    save: async (dataItem: any) => {
        try {
            let sql = ''
            let method = ''
            
            if (dataItem.Assignees_id) {
                sql = await AssigneesSQL.update(dataItem)
                method = 'Update Assignee'
            } else {
                sql = await AssigneesSQL.insert(dataItem)
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
    },

    // Delete assignee
    delete: async (dataItem: any) => {
        try {
            const sql = await AssigneesSQL.delete(dataItem)
            const resultData = await MySQLExecute.execute(sql)

            return {
                Status: true,
                Message: 'Deleted successfully',
                ResultOnDb: resultData,
                MethodOnDb: 'Delete Assignee',
                TotalCountOnDb: 1
            }
        } catch (error: any) {
            return {
                Status: false,
                Message: error?.message || 'Failed to delete data',
                ResultOnDb: [],
                MethodOnDb: 'Delete Assignee Failed',
                TotalCountOnDb: 0
            }
        }
    }
}
