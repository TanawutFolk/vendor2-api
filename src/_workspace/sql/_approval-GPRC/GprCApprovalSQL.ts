interface RegisterRequestDataItem {
  request_id?: number | string
  request_number?: string
  vendor_id?: number | string
  vendor_contact_id?: number | string
  Request_By_EmployeeCode?: string
  supportProduct_Process?: string
  purchase_frequency?: string
  request_status?: string
  requester_remark?: string
  assign_to?: string
  PIC_Email?: string
  CREATE_BY?: string
  UPDATE_BY?: string
  file_name?: string
  file_path?: string
  file_size?: number | string
  file_type?: string
  sqlWhere?: string
  sqlWhereColumnFilter?: string
  Order?: string
  Limit?: number | string
  Offset?: number | string
  approve_by?: string
  approve_date?: string
  approver_remark?: string
  step_id?: number | string
  step_order?: number | string
  approver_id?: string
  step_status?: string
  DESCRIPTION?: string
  step_code?: string
  actor_type?: string
  group_code?: string
  assignment_mode?: string
  action_by?: string
  action_type?: string
  remark?: string
  vendor_code?: string
  selection_id?: number | string
  business_category?: string
  start_year?: string
  authorized_capital?: string
  establish?: string
  number_of_employees?: string
  manufactured_country?: string
  vendor_original_country?: string
  sanctions?: string
  currency?: string
  suggestion?: string
  result?: string
  path?: string
  vendor_code_selector?: string
  completion_date?: string
  gpr_c_approver_name?: string
  gpr_c_approver_email?: string
  gpr_c_pc_pic_name?: string
  gpr_c_pc_pic_email?: string
  gpr_c_circular_json?: string
  action_required_json?: string
  completion_date_null?: string
  year?: string
  total_revenue?: number | string
  net_profit?: number | string
  no?: string | number
  criteria?: string
  uploaded_file?: string
  uploaded_name?: string
  path_null?: string
  name_null?: string
  vendor_region?: string
  group_name?: string
  scope?: string
  from_empcode?: string
  to_empcode?: string
  changed_by?: string
  reason?: string
  fft_status?: number | string
  empcode?: string
  target_group?: string
  target_compact?: string
  group_compact?: string
  is_oversea?: boolean | number | string
}

export interface GprCFlowDataItem {
  request_id?: number | string
  selection_id?: number | string
  gpr_c_flow_id?: number | string
  gpr_c_step_id?: number | string
  action_required_id?: number | string
  flow_status?: string
  current_step_code?: string
  requester_empcode?: string
  requester_submitted_at?: string
  gpr_c_approver_empcode?: string
  gpr_c_approver_name?: string
  gpr_c_approver_email?: string
  pc_pic_name?: string
  pc_pic_email?: string
  circular_json?: string
  completed_at?: string
  rejected_at?: string
  rejected_by?: string
  rejected_remark?: string
  step_order?: number | string
  step_code?: string
  step_name?: string
  approver_empcode?: string
  approver_name?: string
  approver_email?: string
  step_status?: string
  action_by?: string
  action_type?: string
  action_remark?: string
  stage_code?: string
  stage_name?: string
  pic_name?: string
  pic_email?: string
  required_detail?: string
  result_status?: string
  result_remark?: string
  result_by?: string
  sent_at?: string
  CREATE_BY?: string
  UPDATE_BY?: string
}

const esc = (value: any) => String(value ?? '').replace(/'/g, "\\'")
const num = (value: any) => Number(value) || 0
const nullableDate = (value: any) => (value === 'NOW()' ? 'NOW()' : 'NULL')

export const GprCApprovalSQL = {
  getSelectionIdByRequest: (dataItem: GprCFlowDataItem) => {
    return `
            SELECT SELECTION_ID
            FROM request_vendor_selections
            WHERE request_id = ${num(dataItem.request_id)}
              AND INUSE = 1
            ORDER BY selection_id DESC
            LIMIT 1
        `
  },

  getFlowByRequestId: (dataItem: GprCFlowDataItem) => {
    return `
            SELECT *
            FROM REQUEST_VENDOR_GPR_C_FLOWS
            WHERE REQUEST_ID = ${num(dataItem.request_id)}
              AND INUSE = 1
            ORDER BY GPR_C_FLOW_ID DESC
            LIMIT 1
        `
  },

  insertFlow: (dataItem: GprCFlowDataItem) => {
    return `
            INSERT INTO REQUEST_VENDOR_GPR_C_FLOWS (
                REQUEST_ID,
                SELECTION_ID,
                FLOW_STATUS,
                CURRENT_STEP_CODE,
                REQUESTER_EMPCODE,
                CREATE_BY,
                UPDATE_BY,
                INUSE
            ) VALUES (
                ${num(dataItem.request_id)},
                ${dataItem.selection_id ? num(dataItem.selection_id) : 'NULL'},
                '${esc(dataItem.flow_status || 'REQUESTER_SETUP')}',
                '${esc(dataItem.current_step_code || 'REQUESTER_SETUP')}',
                '${esc(dataItem.requester_empcode)}',
                '${esc(dataItem.CREATE_BY || 'SYSTEM')}',
                '${esc(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')}',
                1
            )
        `
  },

  updateFlowSetup: (dataItem: GprCFlowDataItem) => {
    return `
            UPDATE REQUEST_VENDOR_GPR_C_FLOWS SET
                SELECTION_ID = ${dataItem.selection_id ? num(dataItem.selection_id) : 'SELECTION_ID'},
                FLOW_STATUS = '${esc(dataItem.flow_status || 'IN_PROGRESS')}',
                CURRENT_STEP_CODE = '${esc(dataItem.current_step_code || 'REQUESTER_APPROVER')}',
                REQUESTER_EMPCODE = '${esc(dataItem.requester_empcode)}',
                REQUESTER_SUBMITTED_AT = NOW(),
                GPR_C_APPROVER_EMPCODE = '${esc(dataItem.gpr_c_approver_empcode)}',
                GPR_C_APPROVER_NAME = '${esc(dataItem.gpr_c_approver_name)}',
                GPR_C_APPROVER_EMAIL = '${esc(dataItem.gpr_c_approver_email)}',
                PC_PIC_NAME = '${esc(dataItem.pc_pic_name)}',
                PC_PIC_EMAIL = '${esc(dataItem.pc_pic_email)}',
                CIRCULAR_JSON = '${esc(dataItem.circular_json || '[]')}',
                UPDATE_BY = '${esc(dataItem.UPDATE_BY || 'SYSTEM')}',
                UPDATE_DATE = NOW()
            WHERE GPR_C_FLOW_ID = ${num(dataItem.gpr_c_flow_id)}
        `
  },

  updateFlowStatus: (dataItem: GprCFlowDataItem) => {
    return `
            UPDATE REQUEST_VENDOR_GPR_C_FLOWS SET
                FLOW_STATUS = '${esc(dataItem.flow_status)}',
                CURRENT_STEP_CODE = ${dataItem.current_step_code === null ? 'NULL' : `'${esc(dataItem.current_step_code)}'`},
                COMPLETED_AT = ${nullableDate(dataItem.completed_at)},
                REJECTED_AT = ${nullableDate(dataItem.rejected_at)},
                REJECTED_BY = '${esc(dataItem.rejected_by)}',
                REJECTED_REMARK = '${esc(dataItem.rejected_remark)}',
                UPDATE_BY = '${esc(dataItem.UPDATE_BY || 'SYSTEM')}',
                UPDATE_DATE = NOW()
            WHERE GPR_C_FLOW_ID = ${num(dataItem.gpr_c_flow_id)}
        `
  },

  deactivateStepsByFlow: (dataItem: GprCFlowDataItem) => {
    return `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                INUSE = 0,
                UPDATE_BY = '${esc(dataItem.UPDATE_BY || 'SYSTEM')}',
                UPDATE_DATE = NOW()
            WHERE GPR_C_FLOW_ID = ${num(dataItem.gpr_c_flow_id)}
              AND INUSE = 1
        `
  },

  insertStep: (dataItem: GprCFlowDataItem) => {
    return `
            INSERT INTO REQUEST_VENDOR_GPR_C_STEPS (
                GPR_C_FLOW_ID,
                REQUEST_ID,
                STEP_ORDER,
                STEP_CODE,
                STEP_NAME,
                APPROVER_EMPCODE,
                APPROVER_NAME,
                APPROVER_EMAIL,
                STEP_STATUS,
                CREATE_BY,
                UPDATE_BY,
                INUSE
            ) VALUES (
                ${num(dataItem.gpr_c_flow_id)},
                ${num(dataItem.request_id)},
                ${num(dataItem.step_order)},
                '${esc(dataItem.step_code)}',
                '${esc(dataItem.step_name)}',
                '${esc(dataItem.approver_empcode)}',
                '${esc(dataItem.approver_name)}',
                '${esc(dataItem.approver_email)}',
                '${esc(dataItem.step_status || 'PENDING')}',
                '${esc(dataItem.CREATE_BY || 'SYSTEM')}',
                '${esc(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')}',
                1
            )
        `
  },

  getStepsByFlow: (dataItem: GprCFlowDataItem) => {
    return `
            SELECT *
            FROM REQUEST_VENDOR_GPR_C_STEPS
            WHERE GPR_C_FLOW_ID = ${num(dataItem.gpr_c_flow_id)}
              AND INUSE = 1
            ORDER BY STEP_ORDER ASC
        `
  },

  getCurrentStepByFlow: (dataItem: GprCFlowDataItem) => {
    return `
            SELECT *
            FROM REQUEST_VENDOR_GPR_C_STEPS
            WHERE GPR_C_FLOW_ID = ${num(dataItem.gpr_c_flow_id)}
              AND STEP_STATUS = 'IN_PROGRESS'
              AND INUSE = 1
            ORDER BY STEP_ORDER ASC
            LIMIT 1
        `
  },

  updateStepAction: (dataItem: GprCFlowDataItem) => {
    return `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                STEP_STATUS = '${esc(dataItem.step_status)}',
                ACTION_BY = '${esc(dataItem.action_by)}',
                ACTION_TYPE = '${esc(dataItem.action_type)}',
                ACTION_REMARK = '${esc(dataItem.action_remark)}',
                ACTION_DATE = NOW(),
                UPDATE_BY = '${esc(dataItem.UPDATE_BY || dataItem.action_by || 'SYSTEM')}',
                UPDATE_DATE = NOW()
            WHERE GPR_C_STEP_ID = ${num(dataItem.gpr_c_step_id)}
        `
  },

  activateStep: (dataItem: GprCFlowDataItem) => {
    return `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                STEP_STATUS = 'IN_PROGRESS',
                UPDATE_BY = '${esc(dataItem.UPDATE_BY || 'SYSTEM')}',
                UPDATE_DATE = NOW()
            WHERE GPR_C_STEP_ID = ${num(dataItem.gpr_c_step_id)}
        `
  },

  skipPendingSteps: (dataItem: GprCFlowDataItem) => {
    return `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                STEP_STATUS = 'SKIPPED',
                UPDATE_BY = '${esc(dataItem.UPDATE_BY || 'SYSTEM')}',
                UPDATE_DATE = NOW()
            WHERE GPR_C_FLOW_ID = ${num(dataItem.gpr_c_flow_id)}
              AND STEP_STATUS = 'PENDING'
              AND INUSE = 1
        `
  },

  insertActionRequired: (dataItem: GprCFlowDataItem) => {
    return `
            INSERT INTO REQUEST_VENDOR_GPR_C_ACTION_REQUIRED (
                GPR_C_FLOW_ID,
                GPR_C_STEP_ID,
                REQUEST_ID,
                STAGE_CODE,
                STAGE_NAME,
                PIC_NAME,
                PIC_EMAIL,
                REQUIRED_DETAIL,
                RESULT_STATUS,
                SENT_AT,
                CREATE_BY,
                UPDATE_BY,
                INUSE
            ) VALUES (
                ${num(dataItem.gpr_c_flow_id)},
                ${num(dataItem.gpr_c_step_id)},
                ${num(dataItem.request_id)},
                '${esc(dataItem.stage_code)}',
                '${esc(dataItem.stage_name)}',
                '${esc(dataItem.pic_name)}',
                '${esc(dataItem.pic_email)}',
                '${esc(dataItem.required_detail)}',
                '${esc(dataItem.result_status || 'PENDING')}',
                NOW(),
                '${esc(dataItem.CREATE_BY || 'SYSTEM')}',
                '${esc(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM')}',
                1
            )
        `
  },

  updateActionRequiredResult: (dataItem: GprCFlowDataItem) => {
    return `
            UPDATE REQUEST_VENDOR_GPR_C_ACTION_REQUIRED SET
                RESULT_STATUS = '${esc(dataItem.result_status || 'COMPLETED')}',
                RESULT_REMARK = '${esc(dataItem.result_remark)}',
                RESULT_BY = '${esc(dataItem.result_by)}',
                RESULT_AT = NOW(),
                UPDATE_BY = '${esc(dataItem.UPDATE_BY || dataItem.result_by || 'SYSTEM')}',
                UPDATE_DATE = NOW()
            WHERE ACTION_REQUIRED_ID = ${num(dataItem.action_required_id)}
              AND INUSE = 1
        `
  },

  getActionRequiredById: (dataItem: GprCFlowDataItem) => {
    return `
            SELECT *
            FROM REQUEST_VENDOR_GPR_C_ACTION_REQUIRED
            WHERE ACTION_REQUIRED_ID = ${num(dataItem.action_required_id)}
              AND INUSE = 1
            LIMIT 1
        `
  },

  getActionRequiredQueueByPicEmail: (dataItem: GprCFlowDataItem) => {
    return `
            SELECT
                ar.*,
                f.FLOW_STATUS,
                f.CURRENT_STEP_CODE,
                s.STEP_NAME,
                rr.request_number,
                rr.request_status,
                v.company_name
            FROM REQUEST_VENDOR_GPR_C_ACTION_REQUIRED ar
                JOIN REQUEST_VENDOR_GPR_C_FLOWS f
                    ON f.GPR_C_FLOW_ID = ar.GPR_C_FLOW_ID
                    AND f.INUSE = 1
                LEFT JOIN REQUEST_VENDOR_GPR_C_STEPS s
                    ON s.GPR_C_STEP_ID = ar.GPR_C_STEP_ID
                JOIN request_register_vendor rr
                    ON rr.request_id = ar.REQUEST_ID
                LEFT JOIN vendors v
                    ON v.vendor_id = rr.vendor_id
            WHERE ar.INUSE = 1
              AND LOWER(ar.PIC_EMAIL) = LOWER('${esc(dataItem.pic_email)}')
              AND ar.RESULT_STATUS IN ('PENDING', 'INCOMPLETE')
            ORDER BY ar.SENT_AT DESC, ar.ACTION_REQUIRED_ID DESC
        `
  },

  getQueueByApprover: (dataItem: GprCFlowDataItem) => {
    return `
            SELECT
                f.*,
                s.GPR_C_STEP_ID,
                s.STEP_ORDER,
                s.STEP_CODE,
                s.STEP_NAME,
                s.APPROVER_EMPCODE,
                s.APPROVER_NAME,
                s.APPROVER_EMAIL,
                s.STEP_STATUS,
                rr.request_number,
                rr.request_status,
                rr.supportProduct_Process,
                rr.purchase_frequency,
                rr.Request_By_EmployeeCode,
                rr.CREATE_DATE AS REQUEST_CREATE_DATE,
                v.company_name,
                v.address,
                v.vendor_region,
                vc.contact_name,
                COALESCE(vc_sel.email, vc.email, v.emailmain) AS vendor_email,
                vc.tel_phone
            FROM REQUEST_VENDOR_GPR_C_FLOWS f
                JOIN REQUEST_VENDOR_GPR_C_STEPS s
                    ON s.GPR_C_FLOW_ID = f.GPR_C_FLOW_ID
                    AND s.STEP_STATUS = 'IN_PROGRESS'
                    AND s.INUSE = 1
                JOIN request_register_vendor rr
                    ON rr.request_id = f.REQUEST_ID
                LEFT JOIN vendors v
                    ON v.vendor_id = rr.vendor_id
                LEFT JOIN vendor_contacts vc
                    ON vc.vendor_id = v.vendor_id
                LEFT JOIN vendor_contacts vc_sel
                    ON vc_sel.vendor_contact_id = rr.vendor_contact_id
                    AND vc_sel.INUSE = 1
            WHERE f.INUSE = 1
              AND f.FLOW_STATUS = 'IN_PROGRESS'
              AND s.APPROVER_EMPCODE = '${esc(dataItem.approver_empcode)}'
            ORDER BY f.GPR_C_FLOW_ID DESC
        `
  },

  getTaskManagerQueue: () => {
    return `
            SELECT
                f.GPR_C_FLOW_ID,
                f.REQUEST_ID,
                f.FLOW_STATUS,
                f.CURRENT_STEP_CODE,
                s.GPR_C_STEP_ID,
                s.STEP_ORDER,
                s.STEP_CODE,
                s.STEP_NAME,
                s.APPROVER_EMPCODE,
                s.APPROVER_NAME,
                s.APPROVER_EMAIL,
                s.STEP_STATUS,
                rr.request_number,
                rr.request_status,
                rr.supportProduct_Process,
                rr.purchase_frequency,
                rr.Request_By_EmployeeCode,
                rr.CREATE_DATE AS REQUEST_CREATE_DATE,
                v.company_name,
                v.vendor_region
            FROM REQUEST_VENDOR_GPR_C_FLOWS f
                JOIN REQUEST_VENDOR_GPR_C_STEPS s
                    ON s.GPR_C_FLOW_ID = f.GPR_C_FLOW_ID
                    AND s.STEP_STATUS = 'IN_PROGRESS'
                    AND s.INUSE = 1
                JOIN request_register_vendor rr
                    ON rr.request_id = f.REQUEST_ID
                    AND rr.INUSE = 1
                LEFT JOIN vendors v
                    ON v.vendor_id = rr.vendor_id
            WHERE f.INUSE = 1
              AND f.FLOW_STATUS = 'IN_PROGRESS'
            ORDER BY f.GPR_C_FLOW_ID DESC
        `
  },

  getStepById: (dataItem: GprCFlowDataItem) => {
    return `
            SELECT *
            FROM REQUEST_VENDOR_GPR_C_STEPS
            WHERE GPR_C_STEP_ID = ${num(dataItem.gpr_c_step_id)}
              AND INUSE = 1
            LIMIT 1
        `
  },

  updateStepApprover: (dataItem: GprCFlowDataItem) => {
    return `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                APPROVER_EMPCODE = '${esc(dataItem.approver_empcode)}',
                APPROVER_NAME = '${esc(dataItem.approver_name)}',
                APPROVER_EMAIL = '${esc(dataItem.approver_email)}',
                UPDATE_BY = '${esc(dataItem.UPDATE_BY || 'SYSTEM')}',
                UPDATE_DATE = NOW()
            WHERE GPR_C_STEP_ID = ${num(dataItem.gpr_c_step_id)}
              AND INUSE = 1
        `
  },

  getRequestSummary: (dataItem: GprCFlowDataItem) => {
    return `
            SELECT
                rr.request_id,
                rr.request_number,
                rr.request_status,
                rr.assign_to,
                rr.Request_By_EmployeeCode,
                rr.supportProduct_Process,
                rr.purchase_frequency,
                rr.CREATE_DATE,
                v.vendor_id,
                v.company_name,
                v.address,
                v.vendor_region,
                v.emailmain,
                vc.contact_name,
                vc.email AS vendor_email,
                vc.tel_phone
            FROM request_register_vendor rr
                LEFT JOIN vendors v ON v.vendor_id = rr.vendor_id
                LEFT JOIN vendor_contacts vc ON vc.vendor_contact_id = rr.vendor_contact_id
            WHERE rr.request_id = ${num(dataItem.request_id)}
            LIMIT 1
        `
  },

  getMemberByEmpCode: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       empName
                                     , empSurname
                                     , empEmail
                            FROM
                                       Person.MEMBER_FED
                            WHERE
                                       empCode = 'dataItem.empcode'
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.empcode', dataItem['empcode'] || '')

    return sql
  },

  getAssigneeByEmpCodeContact: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       empName
                                     , empEmail
                            FROM
                                       assignees_to
                            WHERE
                                       empcode = 'dataItem.empcode'
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.empcode', dataItem['empcode'] || '')

    return sql
  },

  getPeerCcRowsByNormalizedGroup: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       empcode
                                     , empEmail
                                     , group_code
                                     , group_name
                            FROM
                                       assignees_to
                            WHERE
                                       (
                                           UPPER(TRIM(COALESCE(group_code, ''))) = 'dataItem.target_group'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_name, ''))), ' ', '_'), '(', ''), ')', ''), '-', '_') = 'dataItem.target_group'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_code, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = 'dataItem.target_compact'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_name, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = 'dataItem.target_compact'
                                       )
                                       AND INUSE = 1
                            ORDER BY
                                       Assignees_id ASC
        `

    sql = sql.replaceAll('dataItem.target_group', dataItem['target_group'] || '')
    sql = sql.replaceAll('dataItem.target_compact', dataItem['target_compact'] || '')

    return sql
  },

  getApprovalSteps: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT 
                                       ras.step_id
                                     , ras.request_id
                                     , ras.step_order
                                     , ras.approver_id
                                     , ras.step_status
                                     , ras.DESCRIPTION
                                     , ras.step_code
                                     , ras.actor_type
                                     , ras.group_code
                                     , ras.assignment_mode
                                     , ras.CREATE_BY
                                     , ras.CREATE_DATE
                                     , ras.UPDATE_BY
                                     , ras.UPDATE_DATE
                                     , CONCAT(m.empName, ' ', m.empSurname) AS approver_name
                            FROM
                                       request_approval_step ras
                                            LEFT JOIN
                                       Person.MEMBER_FED m ON m.empCode = ras.approver_id
                            WHERE
                                       ras.request_id = dataItem.request_id
                                       AND ras.INUSE = 1
                            ORDER BY
                                       ras.step_order ASC
        `

    sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())

    return sql
  },

  updateApprovalStep: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_approval_step SET
                                       step_status = 'dataItem.step_status'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       step_id = dataItem.step_id
        `

    sql = sql.replaceAll('dataItem.step_id', (dataItem['step_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.step_status', dataItem['step_status'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  createApprovalLog: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            INSERT INTO request_approval_log (
                                       request_id
                                     , step_id
                                     , action_by
                                     , action_type
                                     , remark
                                     , action_date
                            ) VALUES (
                                        dataItem.request_id
                                     ,  dataItem.step_id
                                     , 'dataItem.action_by'
                                     , 'dataItem.action_type'
                                     , 'dataItem.remark'
                                     ,  NOW()
                            )
        `

    sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.step_id', dataItem['step_id'] ? dataItem['step_id'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.action_by', dataItem['action_by'] || '')
    sql = sql.replaceAll('dataItem.action_type', dataItem['action_type'] || '')
    sql = sql.replaceAll('dataItem.remark', dataItem['remark'] || '')

    return sql
  },

  updateStatus: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       request_status = 'dataItem.request_status'
                                     , approve_by = 'dataItem.approve_by'
                                     , approve_date = 'dataItem.approve_date'
                                     , approver_remark = 'dataItem.approver_remark'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       request_id = dataItem.request_id
        `

    sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.request_status', dataItem['request_status'] || '')
    sql = sql.replaceAll('dataItem.approve_by', dataItem['approve_by'] || '')
    sql = sql.replaceAll("'dataItem.approve_date'", dataItem['approve_date'] === 'NOW()' ? 'NOW()' : 'approve_date')
    sql = sql.replaceAll('dataItem.approver_remark', dataItem['approver_remark'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  markRequestCompleted: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       request_status = 'Completed'
                                     , approve_date = NOW()
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       request_id = dataItem.request_id
        `

    sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  getRequestStatusContext: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       rr.vendor_id
                                     , rr.assign_to
                                     , rvs.vendor_code_selector
                                     , rvs.gpr_c_approver_name
                                     , rvs.gpr_c_approver_email
                                     , rvs.gpr_c_pc_pic_name
                                     , rvs.gpr_c_pc_pic_email
                                     , rvs.gpr_c_circular_json
                                     , rvs.action_required_json
                                     , v.vendor_region
                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       vendors v ON v.vendor_id = rr.vendor_id
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.request_id = rr.request_id AND rvs.INUSE = 1
                            WHERE
                                       rr.request_id = dataItem.request_id
                            ORDER BY
                                       rvs.selection_id DESC
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.request_id', (dataItem['request_id'] || 0).toString())

    return sql
  },

  updateVendorFftStatus: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE vendors SET
                                       fft_status = dataItem.fft_status
                            WHERE
                                       vendor_id = dataItem.vendor_id
        `

    sql = sql.replaceAll('dataItem.vendor_id', (dataItem['vendor_id'] || 0).toString())
    sql = sql.replaceAll('dataItem.fft_status', (dataItem['fft_status'] || 0).toString())

    return sql
  },

  getActiveAssigneeByEmpCodeAndGroupCode: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       Assignees_id
                                     , empcode
                                     , empName
                                     , empEmail
                                     , group_code
                                     , group_name
                                     , INUSE
                            FROM
                                       assignees_to
                            WHERE
                                       empcode = 'dataItem.empcode'
                                       AND (
                                           UPPER(TRIM(COALESCE(group_code, ''))) = 'dataItem.group_code'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_name, ''))), ' ', '_'), '(', ''), ')', ''), '-', '_') = 'dataItem.group_code'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_code, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = 'dataItem.group_compact'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(group_name, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '') = 'dataItem.group_compact'
                                       )
                                       AND INUSE = 1
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.empcode', dataItem['empcode'] || '')
    sql = sql.replaceAll('dataItem.group_code', dataItem['group_code'] || '')
    sql = sql.replaceAll('dataItem.group_compact', dataItem['group_compact'] || '')

    return sql
  },
}
