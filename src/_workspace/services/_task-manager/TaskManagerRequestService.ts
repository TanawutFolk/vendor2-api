import { MySQLExecute } from '@businessData/dbExecute'
import { TaskManagerSQL, type TaskManagerDataItem } from '../../sql/_task-manager/TaskManagerSQL'
import { RowDataPacket } from 'mysql2'

export const TaskManagerRequestService = {
  searchAllTask: async (dataItem: TaskManagerDataItem) => {
    const sqlArray = await TaskManagerSQL.searchAllTask(dataItem)
    const result = (await MySQLExecute.searchList(sqlArray)) as any[][]

    return {
      totalCount: result[0]?.[0]?.TOTAL_COUNT || 0,
      data: result[1] || [],
    }
  },

  gprCTaskManagerQueue: async () => {
    const { GprCApprovalSQL } = await import('../../sql/_approval-GPRC/GprCApprovalSQL')
    const sql = GprCApprovalSQL.getTaskManagerQueue()
    const rows = (await MySQLExecute.search(sql)) as RowDataPacket[]

    return {
      Status: true,
      Message: 'GPR C task manager queue loaded',
      ResultOnDb: rows,
      MethodOnDb: 'Get GPR C Task Manager Queue',
      TotalCountOnDb: rows.length,
    }
  },
}
