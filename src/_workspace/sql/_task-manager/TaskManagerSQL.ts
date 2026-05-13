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
        const safeVal = String(f.value).replace(/'/g, "\\'")
        if (f.id === 'request_status') {
          let condition = `t.REQUEST_STATUS = 'dataItem.FILTER_VALUE'`
          condition = condition.replaceAll('dataItem.FILTER_VALUE', safeVal)
          filterConditions.push(condition)
        }
        if (f.id === 'current_owner_empcode') {
          let condition = `t.CURRENT_OWNER_EMPCODE LIKE '%dataItem.FILTER_VALUE%'`
          condition = condition.replaceAll('dataItem.FILTER_VALUE', safeVal)
          filterConditions.push(condition)
        }
        if (f.id === 'company_name') {
          let condition = `t.COMPANY_NAME LIKE '%dataItem.FILTER_VALUE%'`
          condition = condition.replaceAll('dataItem.FILTER_VALUE', safeVal)
          filterConditions.push(condition)
        }
      }
    }

    const whereClause = filterConditions.length > 0 ? 'WHERE ' + filterConditions.join(' AND ') : ''

    const innerQuery = `
            (
                SELECT
                    rr.REQUEST_ID,
                    rr.REQUEST_NUMBER,
                    v.COMPANY_NAME,
                    rr.REQUEST_STATUS,
                    v.VENDOR_REGION,
                    rr.CREATE_DATE,
                    'Request PO PIC' AS workflow_type,
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
                    1 AS reassign_enabled,
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
                            SELECT MIN(ras_current.STEP_ID)
                            FROM request_approval_step ras_current
                            WHERE ras_current.REQUEST_ID = rr.REQUEST_ID
                              AND ras_current.STEP_STATUS = 'in_progress'
                              AND ras_current.INUSE = 1
                        )
                    LEFT JOIN vendors v
                        ON v.VENDOR_ID = rr.VENDOR_ID
                    LEFT JOIN assignees_to a_pic
                        ON a_pic.INUSE = 1
                        AND a_pic.EMPCODE = rr.ASSIGN_TO
                        AND (
                            UPPER(TRIM(COALESCE(a_pic.GROUP_CODE, ''))) = CASE
                                WHEN LOWER(IFNULL(v.VENDOR_REGION, '')) = 'oversea' THEN 'OVERSEA_PO_PIC'
                                ELSE 'LOCAL_PO_PIC'
                            END
                            OR UPPER(TRIM(COALESCE(a_pic.GROUP_NAME, ''))) = CASE
                                WHEN LOWER(IFNULL(v.VENDOR_REGION, '')) = 'oversea' THEN 'OVERSEA_PO_PIC'
                                ELSE 'LOCAL_PO_PIC'
                            END
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
    dataSql = dataSql.replaceAll('dataItem.ORDER', dataItem['ORDER'] || 't.REQUEST_ID DESC')
    dataSql = dataSql.replaceAll('dataItem.LIMIT', (dataItem['LIMIT'] || 50).toString())
    dataSql = dataSql.replaceAll('dataItem.OFFSET', (dataItem['OFFSET'] || 0).toString())

    return [countSql, dataSql]
  },
}
