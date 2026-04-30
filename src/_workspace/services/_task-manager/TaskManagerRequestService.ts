import { MySQLExecute } from '@businessData/dbExecute'
import { RowDataPacket } from 'mysql2'
import { GprCApprovalSQL } from '../../sql/_approval-GPRC/GprCApprovalSQL'

export const TaskManagerRequestService = {
    gprCTaskManagerQueue: async () => {
        try {
            const sql = GprCApprovalSQL.getTaskManagerQueue()
            const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]

            return {
                Status: true,
                Message: 'GPR C task manager queue loaded',
                ResultOnDb: rows,
                MethodOnDb: 'Get GPR C Task Manager Queue',
                TotalCountOnDb: rows.length,
            }
        } catch (error: any) {
            return {
                Status: false,
                Message: error?.message || 'Failed to get GPR C task manager queue',
                ResultOnDb: [],
                MethodOnDb: 'Get GPR C Task Manager Queue Failed',
                TotalCountOnDb: 0,
            }
        }
    },
}
