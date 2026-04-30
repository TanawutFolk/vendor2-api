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
     * SearchAllTask — Unified task-manager query
     * Merges Main Workflow (request_register_vendor + request_approval_step)
     * with GPR C Sub-Workflow (REQUEST_VENDOR_GPR_C_FLOWS + STEPS)
     * and LEFT JOINs assignees_to to resolve owner-active status.
     *
     * Returns [countSql, dataSql] — same pattern as ApprovalQueueSQL.getAllRequests
     */
    searchAllTask: async (dataItem: TaskManagerDataItem): Promise<string[]> => {
        // ── Build WHERE conditions from SearchFilters ──
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

        const whereClause = filterConditions.length > 0
            ? 'WHERE ' + filterConditions.join(' AND ')
            : ''

        // ── Shared inner query (UNION of Main + GPR C) ──
        const innerQuery = `
            (
                /* ── Main Workflow: requests with an in-progress approval step ── */
                SELECT
                    rr.request_id,
                    rr.request_number,
                    v.company_name,
                    rr.request_status,
                    v.vendor_region,
                    rr.CREATE_DATE,
                    CASE
                        WHEN UPPER(IFNULL(ras.step_code, '')) = 'ISSUE_GPR_C'
                             OR LOWER(IFNULL(ras.DESCRIPTION, '')) LIKE '%issue gpr c%'
                        THEN 'Main Workflow (GPR C Holder)'
                        ELSE 'Main Workflow'
                    END AS workflow_type,
                    IFNULL(ras.DESCRIPTION, IFNULL(ras.step_code, '-')) AS current_step_name,
                    UPPER(IFNULL(ras.step_code, '')) AS current_step_code,
                    IFNULL(ras.group_code, '') AS current_group_code,
                    CASE
                        WHEN UPPER(IFNULL(ras.step_code, '')) = 'ISSUE_GPR_C'
                             OR LOWER(IFNULL(ras.DESCRIPTION, '')) LIKE '%issue gpr c%'
                        THEN 'GPR C Sub-Workflow'
                        WHEN ras.group_code IS NOT NULL AND ras.group_code != '' THEN ras.group_code
                        ELSE '-'
                    END AS current_group_name,
                    CASE
                        WHEN LOWER(IFNULL(ras.actor_type, '')) = 'pic'
                             OR LOWER(IFNULL(ras.step_code, '')) LIKE '%pic%'
                             OR LOWER(IFNULL(ras.DESCRIPTION, '')) LIKE '%pic%'
                        THEN IFNULL(rr.assign_to, '-')
                        ELSE IFNULL(ras.approver_id, '-')
                    END AS current_owner_empcode,
                    CASE
                        WHEN LOWER(IFNULL(ras.actor_type, '')) = 'pic'
                             OR LOWER(IFNULL(ras.step_code, '')) LIKE '%pic%'
                             OR LOWER(IFNULL(ras.DESCRIPTION, '')) LIKE '%pic%'
                        THEN 'REQUEST_PIC'
                        ELSE 'CURRENT_STEP'
                    END AS assignment_scope,
                    CASE
                        WHEN UPPER(IFNULL(ras.step_code, '')) = 'ISSUE_GPR_C'
                             OR LOWER(IFNULL(ras.DESCRIPTION, '')) LIKE '%issue gpr c%'
                        THEN 1
                        WHEN a_main.Assignees_id IS NOT NULL THEN 1
                        ELSE 0
                    END AS current_owner_active,
                    CASE
                        WHEN UPPER(IFNULL(ras.step_code, '')) = 'ISSUE_GPR_C'
                             OR LOWER(IFNULL(ras.DESCRIPTION, '')) LIKE '%issue gpr c%'
                        THEN 0
                        WHEN ras.group_code IS NOT NULL AND ras.group_code != ''
                             AND (ras.approver_id IS NOT NULL AND ras.approver_id != '')
                        THEN 1
                        ELSE 0
                    END AS reassign_enabled,
                    CASE
                        WHEN UPPER(IFNULL(ras.step_code, '')) = 'ISSUE_GPR_C'
                             OR LOWER(IFNULL(ras.DESCRIPTION, '')) LIKE '%issue gpr c%'
                        THEN 'Not Managed'
                        WHEN a_main.Assignees_id IS NOT NULL THEN 'Healthy'
                        ELSE 'Needs Reassign'
                    END AS assignment_health,
                    NULL AS gpr_c_flow_id,
                    NULL AS gpr_c_step_id
                FROM request_register_vendor rr
                    JOIN request_approval_step ras
                        ON ras.request_id = rr.request_id
                        AND ras.step_status = 'in_progress'
                        AND ras.INUSE = 1
                    LEFT JOIN vendors v
                        ON v.vendor_id = rr.vendor_id
                    LEFT JOIN assignees_to a_main
                        ON a_main.INUSE = 1
                        AND a_main.empcode = CASE
                            WHEN LOWER(IFNULL(ras.actor_type, '')) = 'pic'
                                 OR LOWER(IFNULL(ras.step_code, '')) LIKE '%pic%'
                                 OR LOWER(IFNULL(ras.DESCRIPTION, '')) LIKE '%pic%'
                            THEN rr.assign_to
                            ELSE ras.approver_id
                        END
                        AND (
                            UPPER(TRIM(COALESCE(a_main.group_code, ''))) = UPPER(TRIM(COALESCE(ras.group_code, '')))
                            OR UPPER(TRIM(COALESCE(a_main.group_name, ''))) = UPPER(TRIM(COALESCE(ras.group_code, '')))
                        )
                WHERE rr.INUSE = 1

                UNION ALL

                /* ── GPR C Sub-Workflow: in-progress GPR C steps ── */
                SELECT
                    f.REQUEST_ID AS request_id,
                    rr2.request_number,
                    v2.company_name,
                    rr2.request_status,
                    v2.vendor_region,
                    rr2.CREATE_DATE,
                    'GPR C Sub-Workflow' AS workflow_type,
                    IFNULL(s.STEP_NAME, IFNULL(s.STEP_CODE, '-')) AS current_step_name,
                    UPPER(IFNULL(s.STEP_CODE, '')) AS current_step_code,
                    CASE
                        WHEN UPPER(IFNULL(s.STEP_CODE, '')) IN ('EMR_CHECKER', 'EMR_APPROVER', 'QMS_CHECKER', 'QMS_APPROVER')
                        THEN UPPER(s.STEP_CODE)
                        WHEN UPPER(IFNULL(s.STEP_CODE, '')) IN ('PM_MANAGER_CHECKER', 'PM_MANAGER_APPROVER')
                        THEN 'PO_MGR'
                        ELSE ''
                    END AS current_group_code,
                    CASE
                        WHEN UPPER(IFNULL(s.STEP_CODE, '')) IN ('EMR_CHECKER', 'EMR_APPROVER', 'QMS_CHECKER', 'QMS_APPROVER')
                        THEN UPPER(s.STEP_CODE)
                        WHEN UPPER(IFNULL(s.STEP_CODE, '')) IN ('PM_MANAGER_CHECKER', 'PM_MANAGER_APPROVER')
                        THEN 'PO_MGR'
                        ELSE 'Requester Approver'
                    END AS current_group_name,
                    IFNULL(s.APPROVER_EMPCODE, '-') AS current_owner_empcode,
                    'GPR_C_STEP' AS assignment_scope,
                    CASE
                        WHEN UPPER(IFNULL(s.STEP_CODE, '')) IN ('EMR_CHECKER', 'EMR_APPROVER', 'QMS_CHECKER', 'QMS_APPROVER', 'PM_MANAGER_CHECKER', 'PM_MANAGER_APPROVER')
                             AND a_gprc.Assignees_id IS NOT NULL
                        THEN 1
                        WHEN UPPER(IFNULL(s.STEP_CODE, '')) NOT IN ('EMR_CHECKER', 'EMR_APPROVER', 'QMS_CHECKER', 'QMS_APPROVER', 'PM_MANAGER_CHECKER', 'PM_MANAGER_APPROVER')
                        THEN 1
                        ELSE 0
                    END AS current_owner_active,
                    CASE
                        WHEN UPPER(IFNULL(s.STEP_CODE, '')) IN ('EMR_CHECKER', 'EMR_APPROVER', 'QMS_CHECKER', 'QMS_APPROVER', 'PM_MANAGER_CHECKER', 'PM_MANAGER_APPROVER')
                             AND s.APPROVER_EMPCODE IS NOT NULL AND s.APPROVER_EMPCODE != ''
                        THEN 1
                        ELSE 0
                    END AS reassign_enabled,
                    CASE
                        WHEN UPPER(IFNULL(s.STEP_CODE, '')) NOT IN ('EMR_CHECKER', 'EMR_APPROVER', 'QMS_CHECKER', 'QMS_APPROVER', 'PM_MANAGER_CHECKER', 'PM_MANAGER_APPROVER')
                        THEN 'Not Managed'
                        WHEN a_gprc.Assignees_id IS NOT NULL THEN 'Healthy'
                        ELSE 'Needs Reassign'
                    END AS assignment_health,
                    f.GPR_C_FLOW_ID AS gpr_c_flow_id,
                    s.GPR_C_STEP_ID AS gpr_c_step_id
                FROM REQUEST_VENDOR_GPR_C_FLOWS f
                    JOIN REQUEST_VENDOR_GPR_C_STEPS s
                        ON s.GPR_C_FLOW_ID = f.GPR_C_FLOW_ID
                        AND s.STEP_STATUS = 'IN_PROGRESS'
                        AND s.INUSE = 1
                    JOIN request_register_vendor rr2
                        ON rr2.request_id = f.REQUEST_ID
                        AND rr2.INUSE = 1
                    LEFT JOIN vendors v2
                        ON v2.vendor_id = rr2.vendor_id
                    LEFT JOIN assignees_to a_gprc
                        ON a_gprc.INUSE = 1
                        AND a_gprc.empcode = s.APPROVER_EMPCODE
                        AND (
                            UPPER(TRIM(COALESCE(a_gprc.group_code, ''))) = CASE
                                WHEN UPPER(IFNULL(s.STEP_CODE, '')) IN ('EMR_CHECKER', 'EMR_APPROVER', 'QMS_CHECKER', 'QMS_APPROVER')
                                THEN UPPER(s.STEP_CODE)
                                WHEN UPPER(IFNULL(s.STEP_CODE, '')) IN ('PM_MANAGER_CHECKER', 'PM_MANAGER_APPROVER')
                                THEN 'PO_MGR'
                                ELSE ''
                            END
                        )
                WHERE f.INUSE = 1
                  AND f.FLOW_STATUS = 'IN_PROGRESS'
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
    }
}
