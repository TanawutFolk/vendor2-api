import { MySQLExecute } from '@businessData/dbExecute'
import { TaskManagerSQL } from '../../sql/_task-manager/TaskManagerSQL'
import { RowDataPacket } from 'mysql2'

export const TaskManagerRequestService = {
  buildTaskManagerOrder: (value: any) => {
    const sortableColumns: any = {
      request_id: 't.REQUEST_REGISTER_VENDOR_ID',
      request_number: 't.REQUEST_NUMBER',
      company_name: 't.COMPANY_NAME',
      request_status: 't.REQUEST_STATUS',
      request_state: 't.REQUEST_STATE',
      vendor_region: 't.VENDOR_REGION',
      create_date: 't.CREATE_DATE',
      workflow_type: 't.workflow_type',
      current_step_name: 't.current_step_name',
      current_step_code: 't.current_step_code',
      current_group_code: 't.current_group_code',
      current_group_name: 't.current_group_name',
      current_owner_empcode: 't.current_owner_empcode',
      current_owner_active: 't.current_owner_active',
      assignment_health: 't.assignment_health',
    }

    const orderItems = String(value ?? '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
      .flatMap(item => {
        const match = item.match(/^(?:t\.)?([a-zA-Z_]+)\s+(ASC|DESC)$/i)
        if (!match) return []

        const column = sortableColumns[match[1].toLowerCase()]
        if (!column) return []

        return [`${column} ${match[2].toUpperCase()}`]
      })

    return orderItems.length > 0 ? orderItems.join(', ') : 't.REQUEST_REGISTER_VENDOR_ID DESC'
  },

  normalizeTaskManagerPagination: (limitValue: any, offsetValue: any) => {
    const parsedLimit = Number(limitValue)
    const parsedOffset = Number(offsetValue)

    return {
      limit: Number.isFinite(parsedLimit) ? Math.min(500, Math.max(1, Math.trunc(parsedLimit))) : 50,
      offset: Number.isFinite(parsedOffset) ? Math.max(0, Math.trunc(parsedOffset)) : 0,
    }
  },

  buildTaskManagerWhere: (dataItem: any) => {
    const filterConditions: any = []

    if (dataItem.SEARCHFILTERS && Array.isArray(dataItem.SEARCHFILTERS)) {
      for (const f of dataItem.SEARCHFILTERS) {
        if (f.value === null || f.value === undefined || f.value === '') continue
        const safeVal = f.value
        if (f.id === 'request_status') {
          let condition = 't.REQUEST_STATUS = \'dataItem.FILTER_VALUE\''
          condition = condition.replaceAll('dataItem.FILTER_VALUE', safeVal)
          filterConditions.push(condition)
        }
        if (f.id === 'current_owner_empcode') {
          let condition = 't.CURRENT_OWNER_EMPCODE = \'dataItem.FILTER_VALUE\''
          condition = condition.replaceAll('dataItem.FILTER_VALUE', safeVal)
          filterConditions.push(condition)
        }
        if (f.id === 'company_name') {
          let condition = 't.COMPANY_NAME LIKE \'%dataItem.FILTER_VALUE%\''
          condition = condition.replaceAll('dataItem.FILTER_VALUE', safeVal)
          filterConditions.push(condition)
        }
      }
    }

    return filterConditions.length > 0 ? 'WHERE ' + filterConditions.join(' AND ') : ''
  },

  buildTaskManagerSqlDataItem: (dataItem: any) => {
    const pagination = TaskManagerRequestService.normalizeTaskManagerPagination(dataItem.LIMIT, dataItem.OFFSET)

    return {
      ...dataItem,
      SQLWHERE: dataItem.SQLWHERE || TaskManagerRequestService.buildTaskManagerWhere(dataItem),
      ORDER: TaskManagerRequestService.buildTaskManagerOrder(dataItem.ORDER),
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

