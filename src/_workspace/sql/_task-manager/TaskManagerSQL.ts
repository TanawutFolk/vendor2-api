export interface TaskManagerDataItem {
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

    if (dataItem.SearchFilters && Array.isArray(dataItem.SearchFilters)) {
      for (const f of dataItem.SearchFilters) {
        if (f.value === null || f.value === undefined || f.value === '') continue
        const safeVal = String(f.value).replace(/'/g, "\\'")
        if (f.id === 'request_status') {
          filterConditions.push(`t.request_status = '${safeVal}'`)
        }
        if (f.id === 'current_owner_empcode') {
          filterConditions.push(`t.current_owner_empcode LIKE '%${safeVal}%'`)
        }
        if (f.id === 'company_name') {
          filterConditions.push(`t.company_name LIKE '%${safeVal}%'`)
        }
      }
    }

    const whereClause = filterConditions.length > 0 ? 'WHERE ' + filterConditions.join(' AND ') : ''

    const innerQuery = `
            (
                SELECT
                    rr.request_id,
                    rr.request_number,
                    v.company_name,
                    rr.request_status,
                    v.vendor_region,
                    rr.CREATE_DATE,
                    'Request PO PIC' AS workflow_type,
                    IFNULL(ras.DESCRIPTION, IFNULL(ras.step_code, '-')) AS current_step_name,
                    UPPER(IFNULL(ras.step_code, '')) AS current_step_code,
                    CASE
                        WHEN LOWER(IFNULL(v.vendor_region, '')) = 'oversea' THEN 'OVERSEA_PO_PIC'
                        ELSE 'LOCAL_PO_PIC'
                    END AS current_group_code,
                    CASE
                        WHEN LOWER(IFNULL(v.vendor_region, '')) = 'oversea' THEN 'OVERSEA_PO_PIC'
                        ELSE 'LOCAL_PO_PIC'
                    END AS current_group_name,
                    IFNULL(rr.assign_to, '-') AS current_owner_empcode,
                    'REQUEST_PIC' AS assignment_scope,
                    CASE WHEN a_pic.Assignees_id IS NOT NULL THEN 1 ELSE 0 END AS current_owner_active,
                    1 AS reassign_enabled,
                    CASE
                        WHEN a_pic.Assignees_id IS NOT NULL THEN 'Healthy'
                        ELSE 'Needs Reassign'
                    END AS assignment_health,
                    NULL AS gpr_c_flow_id,
                    NULL AS gpr_c_step_id
                FROM request_register_vendor rr
                    LEFT JOIN request_approval_step ras
                        ON ras.request_id = rr.request_id
                        AND ras.step_status = 'in_progress'
                        AND ras.INUSE = 1
                        AND ras.step_id = (
                            SELECT MIN(ras_current.step_id)
                            FROM request_approval_step ras_current
                            WHERE ras_current.request_id = rr.request_id
                              AND ras_current.step_status = 'in_progress'
                              AND ras_current.INUSE = 1
                        )
                    LEFT JOIN vendors v
                        ON v.vendor_id = rr.vendor_id
                    LEFT JOIN assignees_to a_pic
                        ON a_pic.INUSE = 1
                        AND a_pic.empcode = rr.assign_to
                        AND (
                            UPPER(TRIM(COALESCE(a_pic.group_code, ''))) = CASE
                                WHEN LOWER(IFNULL(v.vendor_region, '')) = 'oversea' THEN 'OVERSEA_PO_PIC'
                                ELSE 'LOCAL_PO_PIC'
                            END
                            OR UPPER(TRIM(COALESCE(a_pic.group_name, ''))) = CASE
                                WHEN LOWER(IFNULL(v.vendor_region, '')) = 'oversea' THEN 'OVERSEA_PO_PIC'
                                ELSE 'LOCAL_PO_PIC'
                            END
                        )
                WHERE rr.INUSE = 1
            ) t
        `

    let countSql = `
            SELECT COUNT(*) AS TOTAL_COUNT
            FROM ${innerQuery}
            ${whereClause}
        `

    let dataSql = `
            SELECT t.*
            FROM ${innerQuery}
            ${whereClause}
            ORDER BY dataItem.Order
            LIMIT dataItem.Limit OFFSET dataItem.Offset
        `

    dataSql = dataSql.replaceAll('dataItem.Order', dataItem['Order'] || 't.request_id DESC')
    dataSql = dataSql.replaceAll('dataItem.Limit', (dataItem['Limit'] || 50).toString())
    dataSql = dataSql.replaceAll('dataItem.Offset', (dataItem['Offset'] || 0).toString())

    return [countSql, dataSql]
  },
}
