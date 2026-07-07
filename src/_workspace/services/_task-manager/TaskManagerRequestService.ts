import { MySQLExecute } from '@businessData/dbExecute'
import { TaskManagerSQL } from '../../sql/_task-manager/TaskManagerSQL'
import { RowDataPacket } from 'mysql2'
import getSqlWhere_aggrid from '@src/helpers/getSqlWhere_aggrid'

export const TaskManagerRequestService = {
  normalizeTaskManagerPagination: (limitValue: any, offsetValue: any) => {
    const parsedLimit = Number(limitValue)
    const parsedOffset = Number(offsetValue)

    return {
      limit: Number.isFinite(parsedLimit) ? Math.min(500, Math.max(1, Math.trunc(parsedLimit))) : 50,
      offset: Number.isFinite(parsedOffset) ? Math.max(0, Math.trunc(parsedOffset)) : 0,
    }
  },

  buildTaskManagerSqlDataItem: (dataItem: any) => {
    const pagination = TaskManagerRequestService.normalizeTaskManagerPagination(dataItem.LIMIT, dataItem.OFFSET ?? dataItem.START)

    const tableIds = [
      { table: 't', id: 'REQUEST_STATUS', Fns: '=' },
      { table: 't', id: 'CURRENT_OWNER_EMPCODE', Fns: '=' },
      { table: 't', id: 'COMPANY_NAME', Fns: 'LIKE' },
    ]
    const payload = { ...dataItem }
    getSqlWhere_aggrid(payload, tableIds, 't.REQUEST_REGISTER_VENDOR_ID')

    return {
      ...payload,
      LIMIT: pagination.limit,
      OFFSET: pagination.offset,
    }
  },

  searchAllTask: async (dataItem: any) => {
    const sqlArray = await TaskManagerSQL.searchAllTask(TaskManagerRequestService.buildTaskManagerSqlDataItem(dataItem))
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

