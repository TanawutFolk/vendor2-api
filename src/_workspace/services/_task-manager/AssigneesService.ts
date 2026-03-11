import { MySQLExecute } from '@businessData/dbExecute'
import { AssigneesSQL } from '../../sql/_task-manager/AssigneesSQL'

export const AssigneesService = {
    search: async (filters: any) => {
        const sql = AssigneesSQL.search(filters)
        const result = await MySQLExecute.search(sql)
        return result
    },

    save: async (data: any) => {
        if (data.Assignees_id) {
            const sql = AssigneesSQL.update(data)
            await MySQLExecute.execute(sql)
            return { message: 'Updated successfully', id: data.Assignees_id }
        } else {
            const sql = AssigneesSQL.insert(data)
            const result: any = await MySQLExecute.execute(sql)
            return { message: 'Inserted successfully', id: result.insertId }
        }
    },

    delete: async (id: number) => {
        const sql = AssigneesSQL.delete(id)
        await MySQLExecute.execute(sql)
        return { message: 'Deleted successfully' }
    }
}
