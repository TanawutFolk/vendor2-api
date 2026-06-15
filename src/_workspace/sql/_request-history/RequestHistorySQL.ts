export interface RegisterRequestDataItem {
  [key: string]: any
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

export const RequestHistorySQL = {
  getById: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       rr.REQUEST_ID
                                                                         , rr.REQUEST_NUMBER
                                     , rr.VENDOR_ID
                                     , rr.REQUEST_STATUS
                                     , rr.REQUEST_STATE
                                     , rr.CURRENT_STATUS_ID
                                     , rr.CURRENT_STEP_ID
                                     , rr.SUPPORTPRODUCT_PROCESS
                                     , rr.PURCHASE_FREQUENCY
                                     , rr.REQUESTER_REMARK
                                     , rr.APPROVER_REMARK
                                     , rr.APPROVE_BY
                                     , rr.APPROVE_DATE
                                     , COALESCE(rr.APPROVED_VENDOR_CODE, rr.VENDOR_CODE) AS VENDOR_CODE
                                     , rr.ASSIGN_TO
                                     , rr.PIC_EMAIL
                                     , rr.VENDOR_CONTACT_ID
                                     , rr.REQUEST_BY_EMPLOYEECODE AS EMPLOYEE_CODE
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS FULL_NAME
                                     , m.EMPDEPT AS EMPLOYEE_DEPT
                                     , rr.CREATE_DATE
                                     , rvs.GPR_C_APPROVER_NAME
                                     , rvs.GPR_C_APPROVER_EMAIL
                                     , rvs.GPR_C_PC_PIC_NAME
                                     , rvs.GPR_C_PC_PIC_EMAIL
                                     , rvs.GPR_C_CIRCULAR_JSON
                                     , rvs.ACTION_REQUIRED_JSON
                                     , rvs.GPR_43_ACCEPTANCE_STATUS

                                     -- Vendor Info
                                     , v.COMPANY_NAME
                                     , v.FFT_VENDOR_CODE
                                     , v.FFT_STATUS
                                     , v.VENDOR_REGION
                                     , v.PROVINCE
                                     , v.POSTAL_CODE
                                     , v.ADDRESS
                                     , v.TEL_CENTER
                                     , v.WEBSITE
                                     , v.EMAILMAIN
                                     , vt.NAME AS vendor_type_name

                                     -- Contacts (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'contact_name', vc.CONTACT_NAME,
                                                                               'tel_phone', vc.TEL_PHONE,
                                                                               'email', vc.EMAIL,
                                                                               'position', vc.POSITION
                                                                           )
                                                                      )
                                                           FROM
                                                                      vendor_contacts vc
                                                           WHERE
                                                                      vc.VENDOR_ID = v.VENDOR_ID AND vc.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS contacts

                                     -- Products (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'product_group', mpg.GROUP_NAME,
                                                                               'maker_name', vp.MAKER_NAME,
                                                                               'product_name', vp.PRODUCT_NAME,
                                                                               'model_list', vp.MODEL_LIST
                                                                           )
                                                                      )
                                                           FROM
                                                                      vendor_products vp
                                                                           LEFT JOIN
                                                                      master_product_groups mpg ON mpg.PRODUCT_GROUP_ID = vp.PRODUCT_GROUP_ID
                                                           WHERE
                                                                      vp.VENDOR_ID = v.VENDOR_ID AND vp.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS products

                                     -- Documents (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                JSON_OBJECT(
                                                  'document_id', rrf.REQUEST_FILE_ID,
                                                  'file_name', rrf.FILE_NAME,
                                                  'file_path', rrf.FILE_PATH,
                                                  'file_size', rrf.FILE_SIZE,
                                                  'file_type', rrf.FILE_TYPE
                                                )
                                                                      )
                                                           FROM
                                                                      request_register_file rrf
                                                           WHERE
                                                                      rrf.REQUEST_ID = rr.REQUEST_ID AND rrf.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS documents

                                     -- Approval Steps (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'step_id', ras.STEP_ID,
                                                                               'status_id', ras.STATUS_ID,
                                                                               'step_order', ras.STEP_ORDER,
                                                                               'approver_id', ras.APPROVER_ID,
                                                                               'approver_name', (SELECT CONCAT(pm.EMPNAME, ' ', pm.EMPSURNAME) FROM Person.MEMBER_FED pm WHERE pm.EMPCODE = ras.APPROVER_ID LIMIT 1),
                                                                               'step_status', ras.STEP_STATUS,
                                                                               'DESCRIPTION', ras.DESCRIPTION,
                                                                               'step_code', ras.STEP_CODE,
                                                                               'actor_type', ras.ACTOR_TYPE,
                                                                               'group_code', ras.GROUP_CODE,
                                                                               'assignment_mode', ras.ASSIGNMENT_MODE,
                                                                               'master_status_value', mrs.STATUS_VALUE,
                                                                               'master_status_label', mrs.STATUS_LABEL,
                                                                               'CREATE_DATE', ras.CREATE_DATE,
                                                                               'UPDATE_BY', ras.UPDATE_BY,
                                                                               'UPDATE_DATE', ras.UPDATE_DATE
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_approval_step ras
                                                                           INNER JOIN
                                                                      m_request_status mrs ON mrs.STATUS_ID = ras.STATUS_ID
                                                           WHERE
                                                                      ras.REQUEST_ID = rr.REQUEST_ID AND ras.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS approval_steps

                                     -- Approval Logs (as JSON array)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'log_id', ral.LOG_ID,
                                                                               'step_id', ral.STEP_ID,
                                                                               'action_by', ral.ACTION_BY,
                                                                               'action_by_name', COALESCE(NULLIF(ral.ACTION_BY_NAME, ''), (SELECT CONCAT(pm.EMPNAME, ' ', pm.EMPSURNAME) FROM Person.MEMBER_FED pm WHERE pm.EMPCODE = ral.ACTION_BY LIMIT 1)),
                                                                               'action_type', ral.ACTION_TYPE,
                                                                               'remark', ral.REMARK,
                                                                               'action_date', ral.ACTION_DATE,
                                                                               'DESCRIPTION', ral.DESCRIPTION,
                                                                               'CREATE_BY', ral.CREATE_BY,
                                                                               'UPDATE_BY', ral.UPDATE_BY,
                                                                               'CREATE_DATE', ral.CREATE_DATE,
                                                                               'UPDATE_DATE', ral.UPDATE_DATE,
                                                                               'INUSE', ral.INUSE
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_approval_log ral
                                                           WHERE
                                                                      ral.REQUEST_ID = rr.REQUEST_ID
                                                                      AND ral.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS approval_logs

                                     -- GPR Criteria (inline JSON for pass/fail evaluation)
                                     , IFNULL(
                                                (
                                                           SELECT
                                                                      JSON_ARRAYAGG(
                                                                           JSON_OBJECT(
                                                                               'no', vsc.CRITERIA_NO,
                                                                               'criteria', vsc.CRITERIA_VALUE,
                                                                               'uploaded_file', vsc.UPLOADED_FILE_PATH,
                                                                               'uploaded_name', vsc.UPLOADED_FILE_NAME
                                                                           )
                                                                      )
                                                           FROM
                                                                      request_vendor_selections rvs2
                                                                           JOIN
                                                                      vendor_selection_criteria vsc ON vsc.SELECTION_ID = rvs2.SELECTION_ID
                                                           WHERE
                                                                      rvs2.REQUEST_ID = rr.REQUEST_ID
                                                                      AND rvs2.INUSE = 1
                                                                      AND vsc.INUSE = 1
                                                ),
                                                JSON_ARRAY()
                                       ) AS gpr_criteria

                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.REQUEST_ID = rr.REQUEST_ID AND rvs.INUSE = 1
                                            LEFT JOIN
                                       vendors v ON v.VENDOR_ID = rr.VENDOR_ID
                                            LEFT JOIN
                                       master_vendor_types vt ON vt.VENDOR_TYPE_ID = v.VENDOR_TYPE_ID
                                            LEFT JOIN
                                       Person.MEMBER_FED m ON m.EMPCODE = rr.REQUEST_BY_EMPLOYEECODE
                            WHERE
                                       rr.REQUEST_ID = dataItem.REQUEST_ID
                                       AND rr.INUSE = 1
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())

    return sql
  },

  getApprovalSteps: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT 
                                       ras.STEP_ID
                                     , ras.REQUEST_ID
                                     , ras.WORKFLOW_STEP_ID
                                     , ras.STATUS_ID
                                     , ras.STEP_ORDER
                                     , ras.APPROVER_ID
                                     , ras.STEP_STATUS
                                     , ras.DESCRIPTION
                                     , ras.STEP_CODE
                                     , ras.ACTOR_TYPE
                                     , ras.GROUP_CODE
                                     , ras.ASSIGNMENT_MODE
                                     , ras.CREATE_BY
                                     , ras.CREATE_DATE
                                     , ras.UPDATE_BY
                                     , ras.UPDATE_DATE
                                     , ras.INUSE
                                     , mrs.STATUS_VALUE AS master_status_value
                                     , mrs.STATUS_LABEL AS master_status_label
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS approver_name
                            FROM
                                       request_approval_step ras
                                            INNER JOIN
                                       m_request_status mrs ON mrs.STATUS_ID = ras.STATUS_ID
                                            LEFT JOIN
                                       Person.MEMBER_FED m ON m.EMPCODE = ras.APPROVER_ID
                            WHERE
                                       ras.REQUEST_ID = dataItem.REQUEST_ID
                                       AND ras.INUSE = 1
                            ORDER BY
                                       ras.STEP_ORDER ASC
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())

    return sql
  },

  getApprovalLogs: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT 
                                       ral.LOG_ID
                                     , ral.REQUEST_ID
                                     , ral.STEP_ID
                                     , ral.ACTION_BY
                                     , ral.ACTION_TYPE
                                     , ral.REMARK
                                     , ral.ACTION_DATE
                                     , ral.DESCRIPTION
                                     , ral.CREATE_BY
                                     , ral.UPDATE_BY
                                     , ral.CREATE_DATE
                                     , ral.UPDATE_DATE
                                     , ral.INUSE
                                     , COALESCE(NULLIF(ral.ACTION_BY_NAME, ''), CONCAT(m.EMPNAME, ' ', m.EMPSURNAME)) AS action_by_name
                            FROM
                                       request_approval_log ral
                                            LEFT JOIN
                                       Person.MEMBER_FED m ON m.EMPCODE = ral.ACTION_BY
                            WHERE
                                       ral.REQUEST_ID = dataItem.REQUEST_ID
                                       AND ral.INUSE = 1
                            ORDER BY
                                       ral.ACTION_DATE ASC
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())

    return sql
  },

  getSelection: (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT * FROM
                                       request_vendor_selections
                            WHERE
                                       REQUEST_ID = 'dataItem.REQUEST_ID' AND INUSE = 1
                            ORDER BY
                                       SELECTION_ID DESC
                            LIMIT
                                       1
        `
    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    return sql
  },
}
