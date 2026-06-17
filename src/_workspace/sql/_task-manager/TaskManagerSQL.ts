import { getTaskManagerTerminalStatuses } from '../../services/_task-manager/TaskManagerRules'
import { requestStatusExpr } from '../_request-register/RequestStatusSqlSnippets'

export interface TaskManagerDataItem {
  [key: string]: any
  sqlWhere?: string
  sqlWhereColumnFilter?: string
  Order?: string
  Limit?: number | string
  Offset?: number | string
  SearchFilters?: Array<{ id: string; value: any }>
  ColumnFilters?: Array<{ id: string; value: any }>
}

const SORTABLE_COLUMNS: Record<string, string> = {
  request_id: 't.REQUEST_ID',
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

const escapeSqlText = (value: unknown) =>
  String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")

export const buildTaskManagerOrder = (value: unknown) => {
  const orderItems = String(value ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .flatMap(item => {
      const match = item.match(/^(?:t\.)?([a-zA-Z_]+)\s+(ASC|DESC)$/i)
      if (!match) return []

      const column = SORTABLE_COLUMNS[match[1].toLowerCase()]
      if (!column) return []

      return [`${column} ${match[2].toUpperCase()}`]
    })

  return orderItems.length > 0 ? orderItems.join(', ') : 't.REQUEST_ID DESC'
}

export const normalizeTaskManagerPagination = (limitValue: unknown, offsetValue: unknown) => {
  const parsedLimit = Number(limitValue)
  const parsedOffset = Number(offsetValue)

  return {
    limit: Number.isFinite(parsedLimit) ? Math.min(500, Math.max(1, Math.trunc(parsedLimit))) : 50,
    offset: Number.isFinite(parsedOffset) ? Math.max(0, Math.trunc(parsedOffset)) : 0,
  }
}

export const TaskManagerSQL = {
  /**
   * Request-level PO PIC manager.
   * Reassign from this page only updates request_register_vendor.assign_to.
   */
  searchAllTask: async (dataItem: TaskManagerDataItem): Promise<string[]> => {
    const filterConditions: string[] = []

    if (dataItem.SEARCHFILTERS && Array.isArray(dataItem.SEARCHFILTERS)) {
      for (const f of dataItem.SEARCHFILTERS) {
        if (f.value === null || f.value === undefined || f.value === '') continue
        const safeVal = escapeSqlText(f.value)
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

    const whereClause = filterConditions.length > 0 ? 'WHERE ' + filterConditions.join(' AND ') : ''

    const terminalStatusSql = getTaskManagerTerminalStatuses()
      .map(status => `'${status}'`)
      .join(', ')
    const innerQuery = `
            (
                SELECT
                    rr.REQUEST_ID,
                    rr.REQUEST_NUMBER,
                    v.COMPANY_NAME,
                    ${requestStatusExpr('rr')} AS REQUEST_STATUS,
                    rr.REQUEST_STATE,
                    v.VENDOR_REGION,
                    rr.CREATE_DATE,
                    'Request PO PIC' AS workflow_type,
                    ras.STATUS_ID AS current_status_id,
                    IFNULL(ras.DESCRIPTION, IFNULL(ras.STEP_CODE, '-')) AS current_step_name,
                    UPPER(IFNULL(ras.STEP_CODE, '')) AS current_step_code,
                    CASE
                        WHEN LOWER(IFNULL(v.VENDOR_REGION, '')) = 'oversea' THEN 'OVERSEA_PO_PIC'
                        ELSE 'LOCAL_PO_PIC'
                    END AS current_group_code,
                    CASE
                        WHEN LOWER(IFNULL(v.VENDOR_REGION, '')) = 'oversea' THEN 'OVERSEA_PO_PIC'
                        ELSE 'LOCAL_PO_PIC'
                    END AS current_group_name,
                    IFNULL(rr.ASSIGN_TO, '-') AS current_owner_empcode,
                    'REQUEST_PIC' AS assignment_scope,
                    CASE WHEN a_pic.ASSIGNEES_ID IS NOT NULL THEN 1 ELSE 0 END AS current_owner_active,
                    CASE
                        WHEN ras.STEP_ID IS NOT NULL
                          AND LOWER(TRIM(IFNULL(rr.REQUEST_STATE, ''))) NOT IN (${terminalStatusSql})
                        THEN 1
                        ELSE 0
                    END AS reassign_enabled,
                    CASE
                        WHEN a_pic.ASSIGNEES_ID IS NOT NULL THEN 'Healthy'
                        ELSE 'Needs Reassign'
                    END AS assignment_health,
                    NULL AS gpr_c_flow_id,
                    NULL AS gpr_c_step_id
                FROM request_register_vendor rr
                    LEFT JOIN request_approval_step ras
                        ON ras.REQUEST_ID = rr.REQUEST_ID
                        AND ras.STEP_STATUS = 'in_progress'
                        AND ras.INUSE = 1
                        AND ras.STEP_ID = (
                            SELECT ras_current.STEP_ID
                            FROM request_approval_step ras_current
                            WHERE ras_current.REQUEST_ID = rr.REQUEST_ID
                              AND ras_current.STEP_STATUS = 'in_progress'
                              AND ras_current.INUSE = 1
                            ORDER BY ras_current.STEP_ORDER ASC, ras_current.STEP_ID ASC
                            LIMIT 1
                        )
                    LEFT JOIN vendors v
                        ON v.VENDOR_ID = rr.VENDOR_ID
                    LEFT JOIN assignees_to a_pic
                        ON a_pic.ASSIGNEES_ID = (
                            SELECT MIN(a_pic_match.ASSIGNEES_ID)
                            FROM assignees_to a_pic_match
                            WHERE a_pic_match.INUSE = 1
                              AND a_pic_match.EMPCODE = rr.ASSIGN_TO
                              AND (
                                  UPPER(TRIM(COALESCE(a_pic_match.GROUP_CODE, ''))) = CASE
                                      WHEN LOWER(IFNULL(v.VENDOR_REGION, '')) = 'oversea' THEN 'OVERSEA_PO_PIC'
                                      ELSE 'LOCAL_PO_PIC'
                                  END
                                  OR UPPER(TRIM(COALESCE(a_pic_match.GROUP_NAME, ''))) = CASE
                                      WHEN LOWER(IFNULL(v.VENDOR_REGION, '')) = 'oversea' THEN 'OVERSEA_PO_PIC'
                                      ELSE 'LOCAL_PO_PIC'
                                  END
                              )
                        )
                WHERE rr.INUSE = 1
            ) t
        `

    let countSql = `
            SELECT COUNT(*) AS TOTAL_COUNT
            FROM dataItem.INNERQUERY
            dataItem.WHERECLAUSE
        `

    let dataSql = `
            SELECT t.*
            FROM dataItem.INNERQUERY
            dataItem.WHERECLAUSE
            ORDER BY dataItem.ORDER
            LIMIT dataItem.LIMIT OFFSET dataItem.OFFSET
        `

    countSql = countSql.replaceAll('dataItem.INNERQUERY', innerQuery)
    countSql = countSql.replaceAll('dataItem.WHERECLAUSE', whereClause)
    dataSql = dataSql.replaceAll('dataItem.INNERQUERY', innerQuery)
    dataSql = dataSql.replaceAll('dataItem.WHERECLAUSE', whereClause)
    const orderBy = buildTaskManagerOrder(dataItem['ORDER'])
    const { limit, offset } = normalizeTaskManagerPagination(dataItem['LIMIT'], dataItem['OFFSET'])

    dataSql = dataSql.replaceAll('dataItem.ORDER', orderBy)
    dataSql = dataSql.replaceAll('dataItem.LIMIT', limit.toString())
    dataSql = dataSql.replaceAll('dataItem.OFFSET', offset.toString())

    return [countSql, dataSql]
  },
}
