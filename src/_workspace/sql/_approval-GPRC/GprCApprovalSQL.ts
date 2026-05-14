interface RegisterRequestDataItem {
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

export interface GprCFlowDataItem {
  [key: string]: any
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
  SearchFilters?: Array<{ id: string; value: any }>
  ColumnFilters?: Array<{ id: string; columnFns?: string; value: any }>
  Order?: Array<{ id: string; desc?: boolean }>
  Start?: number | string
  Limit?: number | string
}

const esc = (value: any) => String(value ?? '').replace(/'/g, "\\'")
const num = (value: any) => Number(value) || 0
const nullableDate = (value: any) => (value === 'NOW()' ? 'NOW()' : 'NULL')
const escLike = (value: any) => `%${esc(String(value ?? '').trim())}%`

const buildLikeCondition = (column: string, rawValue: any) => {
  const value = String(rawValue ?? '').trim()
  if (!value) return ''
  let condition = column + ` LIKE 'dataItem.LIKE_VALUE'`
  condition = condition.replaceAll('dataItem.LIKE_VALUE', escLike(value))
  return condition
}

const buildKeywordConditions = (dataItem: GprCFlowDataItem, mapping: Record<string, string[]>) => {
  const conditions: string[] = []

  for (const filter of Array.isArray(dataItem.SEARCHFILTERS) ? dataItem.SEARCHFILTERS : []) {
    const columns = mapping[filter?.id || '']
    const value = String(filter?.value ?? '').trim()
    if (!columns?.length || !value) continue

    const clause = columns
      .map(column => buildLikeCondition(column, value))
      .filter(Boolean)
      .join(' OR ')

    if (clause) {
      conditions.push(`(${clause})`)
    }
  }

  return conditions
}

const buildColumnFilterConditions = (dataItem: GprCFlowDataItem, mapping: Record<string, string>) => {
  const conditions: string[] = []

  for (const filter of Array.isArray(dataItem.COLUMNFILTERS) ? dataItem.COLUMNFILTERS : []) {
    const column = mapping[filter?.id || '']
    const value = filter?.value
    const fn = String(filter?.columnFns || 'contains').trim()

    if (!column || value === null || value === undefined || value === '') continue

    if (Array.isArray(value)) {
      const values = value
        .map((item, index) => {
          let valueSql = `'dataItem.FILTER_VALUE_${index}'`
          valueSql = valueSql.replaceAll(`dataItem.FILTER_VALUE_${index}`, esc(item))
          return valueSql
        })
        .filter(Boolean)
      if (values.length > 0) {
        let condition = column + ` IN (dataItem.FILTER_VALUES)`
        condition = condition.replaceAll('dataItem.FILTER_VALUES', values.join(', '))
        conditions.push(condition)
      }
      continue
    }

    const safeValue = esc(value)

    switch (fn) {
      case 'equals':
        {
          let condition = column + ` = 'dataItem.FILTER_VALUE'`
          condition = condition.replaceAll('dataItem.FILTER_VALUE', safeValue)
          conditions.push(condition)
        }
        break
      case 'notEqual':
        {
          let condition = column + ` <> 'dataItem.FILTER_VALUE'`
          condition = condition.replaceAll('dataItem.FILTER_VALUE', safeValue)
          conditions.push(condition)
        }
        break
      case 'startsWith':
        {
          let condition = column + ` LIKE 'dataItem.FILTER_VALUE%'`
          condition = condition.replaceAll('dataItem.FILTER_VALUE', safeValue)
          conditions.push(condition)
        }
        break
      case 'endsWith':
        {
          let condition = column + ` LIKE '%dataItem.FILTER_VALUE'`
          condition = condition.replaceAll('dataItem.FILTER_VALUE', safeValue)
          conditions.push(condition)
        }
        break
      default:
        {
          let condition = column + ` LIKE '%dataItem.FILTER_VALUE%'`
          condition = condition.replaceAll('dataItem.FILTER_VALUE', safeValue)
          conditions.push(condition)
        }
        break
    }
  }

  return conditions
}

const buildOrderClause = (dataItem: GprCFlowDataItem, mapping: Record<string, string>, fallback: string) => {
  const orderItems = (Array.isArray(dataItem.ORDER) ? dataItem.ORDER : [])
    .map(item => {
      const column = mapping[item?.id || '']
      if (!column) return null
      return `${column} ${item?.desc ? 'DESC' : 'ASC'}`
    })
    .filter(Boolean)

  return orderItems.length > 0 ? orderItems.join(', ') : fallback
}

export const GprCApprovalSQL = {
  getSelectionIdByRequest: (dataItem: GprCFlowDataItem) => {
    let sql = `
            SELECT SELECTION_ID
            FROM request_vendor_selections
            WHERE REQUEST_ID = dataItem.REQUEST_ID
              AND INUSE = 1
            ORDER BY SELECTION_ID DESC
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_ID', num(dataItem.REQUEST_ID).toString())
    return sql
  },

  getFlowByRequestId: (dataItem: GprCFlowDataItem) => {
    let sql = `
            SELECT *
            FROM REQUEST_VENDOR_GPR_C_FLOWS
            WHERE REQUEST_ID = dataItem.REQUEST_ID
              AND INUSE = 1
            ORDER BY GPR_C_FLOW_ID DESC
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_ID', num(dataItem.REQUEST_ID).toString())
    return sql
  },

  insertFlow: (dataItem: GprCFlowDataItem) => {
    let sql = `
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
                dataItem.REQUEST_ID,
                dataItem.SELECTION_ID,
                'dataItem.FLOW_STATUS',
                'dataItem.CURRENT_STEP_CODE',
                'dataItem.REQUESTER_EMPCODE',
                'dataItem.CREATE_BY',
                'dataItem.UPDATE_BY',
                1
            )
        `
    sql = sql.replaceAll('dataItem.REQUEST_ID', num(dataItem.REQUEST_ID).toString())
    sql = sql.replaceAll('dataItem.SELECTION_ID', dataItem.SELECTION_ID ? num(dataItem.SELECTION_ID).toString() : 'NULL')
    sql = sql.replaceAll('dataItem.FLOW_STATUS', esc(dataItem.FLOW_STATUS || 'REQUESTER_SETUP'))
    sql = sql.replaceAll('dataItem.CURRENT_STEP_CODE', esc(dataItem.CURRENT_STEP_CODE || 'REQUESTER_SETUP'))
    sql = sql.replaceAll('dataItem.REQUESTER_EMPCODE', esc(dataItem.REQUESTER_EMPCODE))
    sql = sql.replaceAll('dataItem.CREATE_BY', esc(dataItem.CREATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM'))
    return sql
  },

  updateFlowSetup: (dataItem: GprCFlowDataItem) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_FLOWS SET
                SELECTION_ID = dataItem.SELECTION_ID,
                FLOW_STATUS = 'dataItem.FLOW_STATUS',
                CURRENT_STEP_CODE = 'dataItem.CURRENT_STEP_CODE',
                REQUESTER_EMPCODE = 'dataItem.REQUESTER_EMPCODE',
                REQUESTER_SUBMITTED_AT = NOW(),
                GPR_C_APPROVER_EMPCODE = 'dataItem.GPR_C_APPROVER_EMPCODE',
                GPR_C_APPROVER_NAME = 'dataItem.GPR_C_APPROVER_NAME',
                GPR_C_APPROVER_EMAIL = 'dataItem.GPR_C_APPROVER_EMAIL',
                PC_PIC_NAME = 'dataItem.PC_PIC_NAME',
                PC_PIC_EMAIL = 'dataItem.PC_PIC_EMAIL',
                CIRCULAR_JSON = 'dataItem.CIRCULAR_JSON',
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE GPR_C_FLOW_ID = dataItem.GPR_C_FLOW_ID
        `
    sql = sql.replaceAll('dataItem.SELECTION_ID', dataItem.SELECTION_ID ? num(dataItem.SELECTION_ID).toString() : 'SELECTION_ID')
    sql = sql.replaceAll('dataItem.FLOW_STATUS', esc(dataItem.FLOW_STATUS || 'IN_PROGRESS'))
    sql = sql.replaceAll('dataItem.CURRENT_STEP_CODE', esc(dataItem.CURRENT_STEP_CODE || 'REQUESTER_APPROVER'))
    sql = sql.replaceAll('dataItem.REQUESTER_EMPCODE', esc(dataItem.REQUESTER_EMPCODE))
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_EMPCODE', esc(dataItem.GPR_C_APPROVER_EMPCODE))
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_NAME', esc(dataItem.GPR_C_APPROVER_NAME))
    sql = sql.replaceAll('dataItem.GPR_C_APPROVER_EMAIL', esc(dataItem.GPR_C_APPROVER_EMAIL))
    sql = sql.replaceAll('dataItem.PC_PIC_NAME', esc(dataItem.PC_PIC_NAME))
    sql = sql.replaceAll('dataItem.PC_PIC_EMAIL', esc(dataItem.PC_PIC_EMAIL))
    sql = sql.replaceAll('dataItem.CIRCULAR_JSON', esc(dataItem.CIRCULAR_JSON || '[]'))
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(dataItem.UPDATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.GPR_C_FLOW_ID', num(dataItem.GPR_C_FLOW_ID).toString())
    return sql
  },

  updateFlowStatus: (dataItem: GprCFlowDataItem) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_FLOWS SET
                FLOW_STATUS = 'dataItem.FLOW_STATUS',
                CURRENT_STEP_CODE = dataItem.CURRENT_STEP_CODE,
                COMPLETED_AT = dataItem.COMPLETED_AT,
                REJECTED_AT = dataItem.REJECTED_AT,
                REJECTED_BY = 'dataItem.REJECTED_BY',
                REJECTED_REMARK = 'dataItem.REJECTED_REMARK',
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE GPR_C_FLOW_ID = dataItem.GPR_C_FLOW_ID
        `
    sql = sql.replaceAll('dataItem.FLOW_STATUS', esc(dataItem.FLOW_STATUS))
    sql = sql.replaceAll('dataItem.CURRENT_STEP_CODE', dataItem.CURRENT_STEP_CODE === null ? 'NULL' : `'${esc(dataItem.CURRENT_STEP_CODE)}'`)
    sql = sql.replaceAll('dataItem.COMPLETED_AT', nullableDate(dataItem.COMPLETED_AT))
    sql = sql.replaceAll('dataItem.REJECTED_AT', nullableDate(dataItem.REJECTED_AT))
    sql = sql.replaceAll('dataItem.REJECTED_BY', esc(dataItem.REJECTED_BY))
    sql = sql.replaceAll('dataItem.REJECTED_REMARK', esc(dataItem.REJECTED_REMARK))
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(dataItem.UPDATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.GPR_C_FLOW_ID', num(dataItem.GPR_C_FLOW_ID).toString())
    return sql
  },

  deactivateStepsByFlow: (dataItem: GprCFlowDataItem) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                INUSE = 0,
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE GPR_C_FLOW_ID = dataItem.GPR_C_FLOW_ID
              AND INUSE = 1
        `
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(dataItem.UPDATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.GPR_C_FLOW_ID', num(dataItem.GPR_C_FLOW_ID).toString())
    return sql
  },

  insertStep: (dataItem: GprCFlowDataItem) => {
    let sql = `
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
                dataItem.GPR_C_FLOW_ID,
                dataItem.REQUEST_ID,
                dataItem.STEP_ORDER,
                'dataItem.STEP_CODE',
                'dataItem.STEP_NAME',
                'dataItem.APPROVER_EMPCODE',
                'dataItem.APPROVER_NAME',
                'dataItem.APPROVER_EMAIL',
                'dataItem.STEP_STATUS',
                'dataItem.CREATE_BY',
                'dataItem.UPDATE_BY',
                1
            )
        `
    sql = sql.replaceAll('dataItem.GPR_C_FLOW_ID', num(dataItem.GPR_C_FLOW_ID).toString())
    sql = sql.replaceAll('dataItem.REQUEST_ID', num(dataItem.REQUEST_ID).toString())
    sql = sql.replaceAll('dataItem.STEP_ORDER', num(dataItem.STEP_ORDER).toString())
    sql = sql.replaceAll('dataItem.STEP_CODE', esc(dataItem.STEP_CODE))
    sql = sql.replaceAll('dataItem.STEP_NAME', esc(dataItem.STEP_NAME))
    sql = sql.replaceAll('dataItem.APPROVER_EMPCODE', esc(dataItem.APPROVER_EMPCODE))
    sql = sql.replaceAll('dataItem.APPROVER_NAME', esc(dataItem.APPROVER_NAME))
    sql = sql.replaceAll('dataItem.APPROVER_EMAIL', esc(dataItem.APPROVER_EMAIL))
    sql = sql.replaceAll('dataItem.STEP_STATUS', esc(dataItem.STEP_STATUS || 'PENDING'))
    sql = sql.replaceAll('dataItem.CREATE_BY', esc(dataItem.CREATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM'))
    return sql
  },

  getStepsByFlow: (dataItem: GprCFlowDataItem) => {
    let sql = `
            SELECT *
            FROM REQUEST_VENDOR_GPR_C_STEPS
            WHERE GPR_C_FLOW_ID = dataItem.GPR_C_FLOW_ID
              AND INUSE = 1
            ORDER BY STEP_ORDER ASC
        `
    sql = sql.replaceAll('dataItem.GPR_C_FLOW_ID', num(dataItem.GPR_C_FLOW_ID).toString())
    return sql
  },

  getCurrentStepByFlow: (dataItem: GprCFlowDataItem) => {
    let sql = `
            SELECT *
            FROM REQUEST_VENDOR_GPR_C_STEPS
            WHERE GPR_C_FLOW_ID = dataItem.GPR_C_FLOW_ID
              AND STEP_STATUS = 'IN_PROGRESS'
              AND INUSE = 1
            ORDER BY STEP_ORDER ASC
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.GPR_C_FLOW_ID', num(dataItem.GPR_C_FLOW_ID).toString())
    return sql
  },

  updateStepAction: (dataItem: GprCFlowDataItem) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                STEP_STATUS = 'dataItem.STEP_STATUS',
                ACTION_BY = 'dataItem.ACTION_BY',
                ACTION_TYPE = 'dataItem.ACTION_TYPE',
                ACTION_REMARK = 'dataItem.ACTION_REMARK',
                ACTION_DATE = NOW(),
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE GPR_C_STEP_ID = dataItem.GPR_C_STEP_ID
        `
    sql = sql.replaceAll('dataItem.STEP_STATUS', esc(dataItem.STEP_STATUS))
    sql = sql.replaceAll('dataItem.ACTION_BY', esc(dataItem.ACTION_BY))
    sql = sql.replaceAll('dataItem.ACTION_TYPE', esc(dataItem.ACTION_TYPE))
    sql = sql.replaceAll('dataItem.ACTION_REMARK', esc(dataItem.ACTION_REMARK))
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(dataItem.UPDATE_BY || dataItem.ACTION_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.GPR_C_STEP_ID', num(dataItem.GPR_C_STEP_ID).toString())
    return sql
  },

  activateStep: (dataItem: GprCFlowDataItem) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                STEP_STATUS = 'IN_PROGRESS',
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE GPR_C_STEP_ID = dataItem.GPR_C_STEP_ID
        `
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(dataItem.UPDATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.GPR_C_STEP_ID', num(dataItem.GPR_C_STEP_ID).toString())
    return sql
  },

  skipPendingSteps: (dataItem: GprCFlowDataItem) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                STEP_STATUS = 'SKIPPED',
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE GPR_C_FLOW_ID = dataItem.GPR_C_FLOW_ID
              AND STEP_STATUS = 'PENDING'
              AND INUSE = 1
        `
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(dataItem.UPDATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.GPR_C_FLOW_ID', num(dataItem.GPR_C_FLOW_ID).toString())
    return sql
  },

  insertActionRequired: (dataItem: GprCFlowDataItem) => {
    let sql = `
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
                dataItem.GPR_C_FLOW_ID,
                dataItem.GPR_C_STEP_ID,
                dataItem.REQUEST_ID,
                'dataItem.STAGE_CODE',
                'dataItem.STAGE_NAME',
                'dataItem.PIC_NAME',
                'dataItem.PIC_EMAIL',
                'dataItem.REQUIRED_DETAIL',
                'dataItem.RESULT_STATUS',
                NOW(),
                'dataItem.CREATE_BY',
                'dataItem.UPDATE_BY',
                1
            )
        `
    sql = sql.replaceAll('dataItem.GPR_C_FLOW_ID', num(dataItem.GPR_C_FLOW_ID).toString())
    sql = sql.replaceAll('dataItem.GPR_C_STEP_ID', num(dataItem.GPR_C_STEP_ID).toString())
    sql = sql.replaceAll('dataItem.REQUEST_ID', num(dataItem.REQUEST_ID).toString())
    sql = sql.replaceAll('dataItem.STAGE_CODE', esc(dataItem.STAGE_CODE))
    sql = sql.replaceAll('dataItem.STAGE_NAME', esc(dataItem.STAGE_NAME))
    sql = sql.replaceAll('dataItem.PIC_NAME', esc(dataItem.PIC_NAME))
    sql = sql.replaceAll('dataItem.PIC_EMAIL', esc(dataItem.PIC_EMAIL))
    sql = sql.replaceAll('dataItem.REQUIRED_DETAIL', esc(dataItem.REQUIRED_DETAIL))
    sql = sql.replaceAll('dataItem.RESULT_STATUS', esc(dataItem.RESULT_STATUS || 'PENDING'))
    sql = sql.replaceAll('dataItem.CREATE_BY', esc(dataItem.CREATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(dataItem.UPDATE_BY || dataItem.CREATE_BY || 'SYSTEM'))
    return sql
  },

  updateActionRequiredResult: (dataItem: GprCFlowDataItem) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_ACTION_REQUIRED SET
                RESULT_STATUS = 'dataItem.RESULT_STATUS',
                RESULT_REMARK = 'dataItem.RESULT_REMARK',
                RESULT_BY = 'dataItem.RESULT_BY',
                RESULT_AT = NOW(),
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE ACTION_REQUIRED_ID = dataItem.ACTION_REQUIRED_ID
              AND INUSE = 1
        `
    sql = sql.replaceAll('dataItem.RESULT_STATUS', esc(dataItem.RESULT_STATUS || 'COMPLETED'))
    sql = sql.replaceAll('dataItem.RESULT_REMARK', esc(dataItem.RESULT_REMARK))
    sql = sql.replaceAll('dataItem.RESULT_BY', esc(dataItem.RESULT_BY))
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(dataItem.UPDATE_BY || dataItem.RESULT_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.ACTION_REQUIRED_ID', num(dataItem.ACTION_REQUIRED_ID).toString())
    return sql
  },

  getActionRequiredById: (dataItem: GprCFlowDataItem) => {
    let sql = `
            SELECT *
            FROM REQUEST_VENDOR_GPR_C_ACTION_REQUIRED
            WHERE ACTION_REQUIRED_ID = dataItem.ACTION_REQUIRED_ID
              AND INUSE = 1
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.ACTION_REQUIRED_ID', num(dataItem.ACTION_REQUIRED_ID).toString())
    return sql
  },

  getActionRequiredQueueByPicEmail: (dataItem: GprCFlowDataItem) => {
    let sql = `
            SELECT
                ar.*,
                f.FLOW_STATUS,
                f.CURRENT_STEP_CODE,
                s.STEP_NAME,
                rr.REQUEST_NUMBER,
                rr.REQUEST_STATUS,
                v.COMPANY_NAME
            FROM REQUEST_VENDOR_GPR_C_ACTION_REQUIRED ar
                JOIN REQUEST_VENDOR_GPR_C_FLOWS f
                    ON f.GPR_C_FLOW_ID = ar.GPR_C_FLOW_ID
                    AND f.INUSE = 1
                LEFT JOIN REQUEST_VENDOR_GPR_C_STEPS s
                    ON s.GPR_C_STEP_ID = ar.GPR_C_STEP_ID
                JOIN request_register_vendor rr
                    ON rr.REQUEST_ID = ar.REQUEST_ID
                LEFT JOIN vendors v
                    ON v.VENDOR_ID = rr.VENDOR_ID
            WHERE ar.INUSE = 1
              AND LOWER(ar.PIC_EMAIL) = LOWER('dataItem.PIC_EMAIL')
              AND ar.RESULT_STATUS IN ('PENDING', 'INCOMPLETE')
            ORDER BY ar.SENT_AT DESC, ar.ACTION_REQUIRED_ID DESC
        `
    sql = sql.replaceAll('dataItem.PIC_EMAIL', esc(dataItem.PIC_EMAIL))
    return sql
  },

  getActionRequiredQueueByPicEmailPaginated: (dataItem: GprCFlowDataItem) => {
    const conditions = [
      `t.PIC_EMAIL_NORMALIZED = LOWER('dataItem.PIC_EMAIL')`,
      't.RESULT_STATUS IN (\'PENDING\', \'INCOMPLETE\')',
      ...buildKeywordConditions(dataItem, {
        request_number: ['t.REQUEST_NUMBER', 'CAST(t.REQUEST_ID AS CHAR)'],
        vendor_name: ['t.COMPANY_NAME'],
        step_keyword: ['t.STAGE_NAME', 't.STAGE_CODE'],
        status_keyword: ['t.RESULT_STATUS', 't.REQUEST_STATUS'],
      }),
      ...buildColumnFilterConditions(dataItem, {
        request_number: 't.REQUEST_NUMBER',
        company_name: 't.COMPANY_NAME',
        STAGE_NAME: 't.STAGE_NAME',
        STAGE_CODE: 't.STAGE_CODE',
        REQUIRED_DETAIL: 't.REQUIRED_DETAIL',
        RESULT_STATUS: 't.RESULT_STATUS',
      }),
    ]

    let whereClause = ''
    if (conditions.length > 0) {
      whereClause = 'WHERE dataItem.CONDITIONS'
      whereClause = whereClause.replaceAll('dataItem.CONDITIONS', conditions.join('\n              AND '))
    }
    const orderClause = buildOrderClause(
      dataItem,
      {
        ACTION_REQUIRED_ID: 't.ACTION_REQUIRED_ID',
        request_number: 't.REQUEST_NUMBER',
        company_name: 't.COMPANY_NAME',
        STAGE_NAME: 't.STAGE_NAME',
        STAGE_CODE: 't.STAGE_CODE',
        REQUIRED_DETAIL: 't.REQUIRED_DETAIL',
        RESULT_STATUS: 't.RESULT_STATUS',
        SENT_AT: 't.SENT_AT',
      },
      't.SENT_AT DESC, t.ACTION_REQUIRED_ID DESC'
    )
    const offset = num(dataItem.START)
    const limit = num(dataItem.LIMIT) || 20
    const innerQuery = `
            (
                SELECT
                    ar.*,
                    LOWER(ar.PIC_EMAIL) AS PIC_EMAIL_NORMALIZED,
                    f.FLOW_STATUS,
                    f.CURRENT_STEP_CODE,
                    s.STEP_NAME,
                    rr.REQUEST_NUMBER,
                    rr.REQUEST_STATUS,
                    v.COMPANY_NAME
                FROM REQUEST_VENDOR_GPR_C_ACTION_REQUIRED ar
                    JOIN REQUEST_VENDOR_GPR_C_FLOWS f
                        ON f.GPR_C_FLOW_ID = ar.GPR_C_FLOW_ID
                        AND f.INUSE = 1
                    LEFT JOIN REQUEST_VENDOR_GPR_C_STEPS s
                        ON s.GPR_C_STEP_ID = ar.GPR_C_STEP_ID
                    JOIN request_register_vendor rr
                        ON rr.REQUEST_ID = ar.REQUEST_ID
                    LEFT JOIN vendors v
                        ON v.VENDOR_ID = rr.VENDOR_ID
                WHERE ar.INUSE = 1
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
            ORDER BY dataItem.ORDERCLAUSE
            LIMIT dataItem.LIMIT OFFSET dataItem.OFFSET
        `
    countSql = countSql.replaceAll('dataItem.INNERQUERY', innerQuery)
    countSql = countSql.replaceAll('dataItem.WHERECLAUSE', whereClause)
    countSql = countSql.replaceAll('dataItem.PIC_EMAIL', esc(dataItem.PIC_EMAIL))
    dataSql = dataSql.replaceAll('dataItem.INNERQUERY', innerQuery)
    dataSql = dataSql.replaceAll('dataItem.WHERECLAUSE', whereClause)
    dataSql = dataSql.replaceAll('dataItem.ORDERCLAUSE', orderClause)
    dataSql = dataSql.replaceAll('dataItem.LIMIT', limit.toString())
    dataSql = dataSql.replaceAll('dataItem.OFFSET', offset.toString())
    dataSql = dataSql.replaceAll('dataItem.PIC_EMAIL', esc(dataItem.PIC_EMAIL))

    return [countSql, dataSql]
  },

  getQueueByApprover: (dataItem: GprCFlowDataItem) => {
    let sql = `
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
                rr.REQUEST_NUMBER,
                rr.REQUEST_STATUS,
                rr.SUPPORTPRODUCT_PROCESS,
                rr.PURCHASE_FREQUENCY,
                rr.REQUEST_BY_EMPLOYEECODE,
                rr.CREATE_DATE AS REQUEST_CREATE_DATE,
                v.COMPANY_NAME,
                v.ADDRESS,
                v.VENDOR_REGION,
                vc.CONTACT_NAME,
                COALESCE(vc_sel.EMAIL, vc.EMAIL, v.EMAILMAIN) AS vendor_email,
                vc.TEL_PHONE
            FROM REQUEST_VENDOR_GPR_C_FLOWS f
                JOIN REQUEST_VENDOR_GPR_C_STEPS s
                    ON s.GPR_C_FLOW_ID = f.GPR_C_FLOW_ID
                    AND s.STEP_STATUS = 'IN_PROGRESS'
                    AND s.INUSE = 1
                JOIN request_register_vendor rr
                    ON rr.REQUEST_ID = f.REQUEST_ID
                LEFT JOIN vendors v
                    ON v.VENDOR_ID = rr.VENDOR_ID
                LEFT JOIN vendor_contacts vc
                    ON vc.VENDOR_ID = v.VENDOR_ID
                LEFT JOIN vendor_contacts vc_sel
                    ON vc_sel.VENDOR_CONTACT_ID = rr.VENDOR_CONTACT_ID
                    AND vc_sel.INUSE = 1
            WHERE f.INUSE = 1
              AND f.FLOW_STATUS = 'IN_PROGRESS'
              AND s.APPROVER_EMPCODE = 'dataItem.APPROVER_EMPCODE'
            ORDER BY f.GPR_C_FLOW_ID DESC
        `
    sql = sql.replaceAll('dataItem.APPROVER_EMPCODE', esc(dataItem.APPROVER_EMPCODE))
    return sql
  },

  getQueueByApproverPaginated: (dataItem: GprCFlowDataItem) => {
    const conditions = [
      `t.APPROVER_EMPCODE = 'dataItem.APPROVER_EMPCODE'`,
      ...buildKeywordConditions(dataItem, {
        request_number: ['t.REQUEST_NUMBER', 'CAST(t.REQUEST_ID AS CHAR)'],
        vendor_name: ['t.COMPANY_NAME'],
        step_keyword: ['t.STEP_NAME', 't.STEP_CODE'],
        status_keyword: ['t.REQUEST_STATUS'],
      }),
      ...buildColumnFilterConditions(dataItem, {
        request_number: 't.REQUEST_NUMBER',
        company_name: 't.COMPANY_NAME',
        STEP_NAME: 't.STEP_NAME',
        STEP_CODE: 't.STEP_CODE',
        request_status: 't.REQUEST_STATUS',
      }),
    ]

    let whereClause = ''
    if (conditions.length > 0) {
      whereClause = 'WHERE dataItem.CONDITIONS'
      whereClause = whereClause.replaceAll('dataItem.CONDITIONS', conditions.join('\n              AND '))
    }
    const orderClause = buildOrderClause(
      dataItem,
      {
        GPR_C_FLOW_ID: 't.GPR_C_FLOW_ID',
        request_number: 't.REQUEST_NUMBER',
        company_name: 't.COMPANY_NAME',
        STEP_NAME: 't.STEP_NAME',
        STEP_CODE: 't.STEP_CODE',
        request_status: 't.REQUEST_STATUS',
        REQUEST_CREATE_DATE: 't.REQUEST_CREATE_DATE',
      },
      't.GPR_C_FLOW_ID DESC'
    )
    const offset = num(dataItem.START)
    const limit = num(dataItem.LIMIT) || 20
    const innerQuery = `
            (
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
                    rr.REQUEST_NUMBER,
                    rr.REQUEST_STATUS,
                    rr.SUPPORTPRODUCT_PROCESS,
                    rr.PURCHASE_FREQUENCY,
                    rr.REQUEST_BY_EMPLOYEECODE,
                    rr.CREATE_DATE AS REQUEST_CREATE_DATE,
                    v.COMPANY_NAME,
                    v.ADDRESS,
                    v.VENDOR_REGION,
                    vc.CONTACT_NAME,
                    COALESCE(vc_sel.EMAIL, vc.EMAIL, v.EMAILMAIN) AS vendor_email,
                    vc.TEL_PHONE
                FROM REQUEST_VENDOR_GPR_C_FLOWS f
                    JOIN REQUEST_VENDOR_GPR_C_STEPS s
                        ON s.GPR_C_FLOW_ID = f.GPR_C_FLOW_ID
                        AND s.STEP_STATUS = 'IN_PROGRESS'
                        AND s.INUSE = 1
                    JOIN request_register_vendor rr
                        ON rr.REQUEST_ID = f.REQUEST_ID
                    LEFT JOIN vendors v
                        ON v.VENDOR_ID = rr.VENDOR_ID
                    LEFT JOIN vendor_contacts vc
                        ON vc.VENDOR_ID = v.VENDOR_ID
                    LEFT JOIN vendor_contacts vc_sel
                        ON vc_sel.VENDOR_CONTACT_ID = rr.VENDOR_CONTACT_ID
                        AND vc_sel.INUSE = 1
                WHERE f.INUSE = 1
                  AND f.FLOW_STATUS = 'IN_PROGRESS'
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
            ORDER BY dataItem.ORDERCLAUSE
            LIMIT dataItem.LIMIT OFFSET dataItem.OFFSET
        `
    countSql = countSql.replaceAll('dataItem.INNERQUERY', innerQuery)
    countSql = countSql.replaceAll('dataItem.WHERECLAUSE', whereClause)
    countSql = countSql.replaceAll('dataItem.APPROVER_EMPCODE', esc(dataItem.APPROVER_EMPCODE))
    dataSql = dataSql.replaceAll('dataItem.INNERQUERY', innerQuery)
    dataSql = dataSql.replaceAll('dataItem.WHERECLAUSE', whereClause)
    dataSql = dataSql.replaceAll('dataItem.ORDERCLAUSE', orderClause)
    dataSql = dataSql.replaceAll('dataItem.LIMIT', limit.toString())
    dataSql = dataSql.replaceAll('dataItem.OFFSET', offset.toString())
    dataSql = dataSql.replaceAll('dataItem.APPROVER_EMPCODE', esc(dataItem.APPROVER_EMPCODE))

    return [countSql, dataSql]
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
                rr.REQUEST_NUMBER,
                rr.REQUEST_STATUS,
                rr.SUPPORTPRODUCT_PROCESS,
                rr.PURCHASE_FREQUENCY,
                rr.REQUEST_BY_EMPLOYEECODE,
                rr.CREATE_DATE AS REQUEST_CREATE_DATE,
                v.COMPANY_NAME,
                v.VENDOR_REGION
            FROM REQUEST_VENDOR_GPR_C_FLOWS f
                JOIN REQUEST_VENDOR_GPR_C_STEPS s
                    ON s.GPR_C_FLOW_ID = f.GPR_C_FLOW_ID
                    AND s.STEP_STATUS = 'IN_PROGRESS'
                    AND s.INUSE = 1
                JOIN request_register_vendor rr
                    ON rr.REQUEST_ID = f.REQUEST_ID
                    AND rr.INUSE = 1
                LEFT JOIN vendors v
                    ON v.VENDOR_ID = rr.VENDOR_ID
            WHERE f.INUSE = 1
              AND f.FLOW_STATUS = 'IN_PROGRESS'
            ORDER BY f.GPR_C_FLOW_ID DESC
        `
  },

  getStepById: (dataItem: GprCFlowDataItem) => {
    let sql = `
            SELECT *
            FROM REQUEST_VENDOR_GPR_C_STEPS
            WHERE GPR_C_STEP_ID = dataItem.GPR_C_STEP_ID
              AND INUSE = 1
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.GPR_C_STEP_ID', num(dataItem.GPR_C_STEP_ID).toString())
    return sql
  },

  updateStepApprover: (dataItem: GprCFlowDataItem) => {
    let sql = `
            UPDATE REQUEST_VENDOR_GPR_C_STEPS SET
                APPROVER_EMPCODE = 'dataItem.APPROVER_EMPCODE',
                APPROVER_NAME = 'dataItem.APPROVER_NAME',
                APPROVER_EMAIL = 'dataItem.APPROVER_EMAIL',
                UPDATE_BY = 'dataItem.UPDATE_BY',
                UPDATE_DATE = NOW()
            WHERE GPR_C_STEP_ID = dataItem.GPR_C_STEP_ID
              AND INUSE = 1
        `
    sql = sql.replaceAll('dataItem.APPROVER_EMPCODE', esc(dataItem.APPROVER_EMPCODE))
    sql = sql.replaceAll('dataItem.APPROVER_NAME', esc(dataItem.APPROVER_NAME))
    sql = sql.replaceAll('dataItem.APPROVER_EMAIL', esc(dataItem.APPROVER_EMAIL))
    sql = sql.replaceAll('dataItem.UPDATE_BY', esc(dataItem.UPDATE_BY || 'SYSTEM'))
    sql = sql.replaceAll('dataItem.GPR_C_STEP_ID', num(dataItem.GPR_C_STEP_ID).toString())
    return sql
  },

  getRequestSummary: (dataItem: GprCFlowDataItem) => {
    let sql = `
            SELECT
                rr.REQUEST_ID,
                rr.REQUEST_NUMBER,
                rr.REQUEST_STATUS,
                rr.ASSIGN_TO,
                rr.REQUEST_BY_EMPLOYEECODE,
                rr.SUPPORTPRODUCT_PROCESS,
                rr.PURCHASE_FREQUENCY,
                rr.CREATE_DATE,
                v.VENDOR_ID,
                v.COMPANY_NAME,
                v.ADDRESS,
                v.VENDOR_REGION,
                v.EMAILMAIN,
                vc.CONTACT_NAME,
                vc.EMAIL AS vendor_email,
                vc.TEL_PHONE
            FROM request_register_vendor rr
                LEFT JOIN vendors v ON v.VENDOR_ID = rr.VENDOR_ID
                LEFT JOIN vendor_contacts vc ON vc.VENDOR_CONTACT_ID = rr.VENDOR_CONTACT_ID
            WHERE rr.REQUEST_ID = dataItem.REQUEST_ID
            LIMIT 1
        `
    sql = sql.replaceAll('dataItem.REQUEST_ID', num(dataItem.REQUEST_ID).toString())
    return sql
  },

  getMemberByEmpCode: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       EMPNAME
                                     , EMPSURNAME
                                     , EMPEMAIL
                            FROM
                                       Person.MEMBER_FED
                            WHERE
                                       EMPCODE = 'dataItem.EMPCODE'
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'] || '')

    return sql
  },

  getAssigneeByEmpCodeContact: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       EMPNAME
                                     , EMPEMAIL
                            FROM
                                       assignees_to
                            WHERE
                                       EMPCODE = 'dataItem.EMPCODE'
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'] || '')

    return sql
  },

  getPeerCcRowsByNormalizedGroup: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       EMPCODE
                                     , EMPEMAIL
                                     , GROUP_CODE
                                     , GROUP_NAME
                            FROM
                                       assignees_to
                            WHERE
                                       (
                                           UPPER(TRIM(COALESCE(GROUP_CODE, ''))) = 'dataItem.TARGET_GROUP'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(GROUP_NAME, ''))), ' ', '_'), '(', ''), ')', ''), '-', '_')
                                               = 'dataItem.TARGET_GROUP'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                                               UPPER(TRIM(COALESCE(GROUP_CODE, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '')
                                               = 'dataItem.TARGET_COMPACT'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                                               UPPER(TRIM(COALESCE(GROUP_NAME, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '')
                                               = 'dataItem.TARGET_COMPACT'
                                       )
                                       AND INUSE = 1
                            ORDER BY
                                       ASSIGNEES_ID ASC
        `

    sql = sql.replaceAll('dataItem.TARGET_GROUP', dataItem['TARGET_GROUP'] || '')
    sql = sql.replaceAll('dataItem.TARGET_COMPACT', dataItem['TARGET_COMPACT'] || '')

    return sql
  },

  getApprovalSteps: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT 
                                       ras.STEP_ID
                                     , ras.REQUEST_ID
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
                                     , CONCAT(m.EMPNAME, ' ', m.EMPSURNAME) AS approver_name
                            FROM
                                       request_approval_step ras
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

  updateApprovalStep: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_approval_step SET
                                       STEP_STATUS = 'dataItem.STEP_STATUS'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       STEP_ID = dataItem.STEP_ID
        `

    sql = sql.replaceAll('dataItem.STEP_ID', (dataItem['STEP_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.STEP_STATUS', dataItem['STEP_STATUS'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  createApprovalLog: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            INSERT INTO request_approval_log (
                                       REQUEST_ID
                                     , STEP_ID
                                     , ACTION_BY
                                     , ACTION_TYPE
                                     , REMARK
                                     , ACTION_DATE
                            ) VALUES (
                                        dataItem.REQUEST_ID
                                     ,  dataItem.STEP_ID
                                     , 'dataItem.ACTION_BY'
                                     , 'dataItem.ACTION_TYPE'
                                     , 'dataItem.REMARK'
                                     ,  NOW()
                            )
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.STEP_ID', dataItem['STEP_ID'] ? dataItem['STEP_ID'].toString() : 'NULL')
    sql = sql.replaceAll('dataItem.ACTION_BY', dataItem['ACTION_BY'] || '')
    sql = sql.replaceAll('dataItem.ACTION_TYPE', dataItem['ACTION_TYPE'] || '')
    sql = sql.replaceAll('dataItem.REMARK', dataItem['REMARK'] || '')

    return sql
  },

  updateStatus: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       REQUEST_STATUS = 'dataItem.REQUEST_STATUS'
                                     , APPROVE_BY = 'dataItem.APPROVE_BY'
                                     , APPROVE_DATE = dataItem.APPROVE_DATE
                                     , APPROVER_REMARK = 'dataItem.APPROVER_REMARK'
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_ID = dataItem.REQUEST_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.REQUEST_STATUS', dataItem['REQUEST_STATUS'] || '')
    sql = sql.replaceAll('dataItem.APPROVE_BY', dataItem['APPROVE_BY'] || '')
    sql = sql.replaceAll('dataItem.APPROVE_DATE', dataItem['APPROVE_DATE'] === 'NOW()' ? 'NOW()' : 'APPROVE_DATE')
    sql = sql.replaceAll('dataItem.APPROVER_REMARK', dataItem['APPROVER_REMARK'] || '')
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || '')

    return sql
  },

  markRequestCompleted: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE request_register_vendor SET
                                       REQUEST_STATUS = 'Completed'
                                     , APPROVE_DATE = NOW()
                                     , UPDATE_BY = 'dataItem.UPDATE_BY'
                                     , UPDATE_DATE = NOW()
                            WHERE
                                       REQUEST_ID = dataItem.REQUEST_ID
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.UPDATE_BY', dataItem['UPDATE_BY'] || 'SYSTEM')

    return sql
  },

  getRequestStatusContext: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       rr.VENDOR_ID
                                     , rr.ASSIGN_TO
                                     , rvs.VENDOR_CODE_SELECTOR
                                     , rvs.GPR_C_APPROVER_NAME
                                     , rvs.GPR_C_APPROVER_EMAIL
                                     , rvs.GPR_C_PC_PIC_NAME
                                      , rvs.GPR_C_PC_PIC_EMAIL
                                      , rvs.GPR_C_CIRCULAR_JSON
                                      , rvs.ACTION_REQUIRED_JSON
                                      , rvs.GPR_43_ACCEPTANCE_STATUS
                                      , v.VENDOR_REGION
                            FROM
                                       request_register_vendor rr
                                            LEFT JOIN
                                       vendors v ON v.VENDOR_ID = rr.VENDOR_ID
                                            LEFT JOIN
                                       request_vendor_selections rvs ON rvs.REQUEST_ID = rr.REQUEST_ID AND rvs.INUSE = 1
                            WHERE
                                       rr.REQUEST_ID = dataItem.REQUEST_ID
                            ORDER BY
                                       rvs.SELECTION_ID DESC
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.REQUEST_ID', (dataItem['REQUEST_ID'] || 0).toString())

    return sql
  },

  updateVendorFftStatus: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            UPDATE vendors SET
                                       FFT_STATUS = dataItem.FFT_STATUS
                            WHERE
                                       VENDOR_ID = dataItem.VENDOR_ID
        `

    sql = sql.replaceAll('dataItem.VENDOR_ID', (dataItem['VENDOR_ID'] || 0).toString())
    sql = sql.replaceAll('dataItem.FFT_STATUS', (dataItem['FFT_STATUS'] || 0).toString())

    return sql
  },

  getActiveAssigneeByEmpCodeAndGroupCode: async (dataItem: RegisterRequestDataItem) => {
    let sql = `
                            SELECT
                                       ASSIGNEES_ID
                                     , EMPCODE
                                     , EMPNAME
                                     , EMPEMAIL
                                     , GROUP_CODE
                                     , GROUP_NAME
                                     , INUSE
                            FROM
                                       assignees_to
                            WHERE
                                       EMPCODE = 'dataItem.EMPCODE'
                                       AND (
                                           UPPER(TRIM(COALESCE(GROUP_CODE, ''))) = 'dataItem.GROUP_CODE'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(UPPER(TRIM(COALESCE(GROUP_NAME, ''))), ' ', '_'), '(', ''), ')', ''), '-', '_')
                                               = 'dataItem.GROUP_CODE'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                                               UPPER(TRIM(COALESCE(GROUP_CODE, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '')
                                               = 'dataItem.GROUP_COMPACT'
                                           OR REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                                               UPPER(TRIM(COALESCE(GROUP_NAME, ''))), ' ', ''), '_', ''), '-', ''), '(', ''), ')', ''), '.', '')
                                               = 'dataItem.GROUP_COMPACT'
                                       )
                                       AND INUSE = 1
                            LIMIT
                                       1
        `

    sql = sql.replaceAll('dataItem.EMPCODE', dataItem['EMPCODE'] || '')
    sql = sql.replaceAll('dataItem.GROUP_CODE', dataItem['GROUP_CODE'] || '')
    sql = sql.replaceAll('dataItem.GROUP_COMPACT', dataItem['GROUP_COMPACT'] || '')

    return sql
  },
}
