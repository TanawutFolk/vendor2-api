import {
  ACTION_RESULT_STATUS_CODE,
  APPROVAL_STEP_STATUS_CODE,
  GPR_C_FLOW_STATUS_CODE,
  normalizeApprovalStepStatusCode,
  normalizeRequestStateCode,
  normalizeStatusMasterType,
  REQUEST_STATE_CODE,
  STATUS_MASTER_TYPE,
  VENDOR_STATUS_CODE,
  type ActionResultStatusCode,
  type GprCFlowStatusCode,
  type StatusMasterSearchData,
} from '../../types/StatusMaster'

export {
  ACTION_RESULT_STATUS_CODE,
  APPROVAL_STEP_STATUS_CODE,
  GPR_C_FLOW_STATUS_CODE,
  normalizeApprovalStepStatusCode,
  normalizeRequestStateCode,
  normalizeStatusMasterType,
  normalizeVendorStatusCode,
  REQUEST_STATE_CODE,
  STATUS_MASTER_TYPE,
  VENDOR_STATUS_CODE,
} from '../../types/StatusMaster'
export type {
  ActionResultStatusCode,
  ApprovalStepStatusCode,
  GprCFlowStatusCode,
  RequestStateCode,
  StatusMasterSearchData,
  StatusMasterType,
} from '../../types/StatusMaster'

const stepStatusIdExpr = (value: unknown) => {
  const statusCode = normalizeApprovalStepStatusCode(value)
  let sql = `(SELECT status_master.M_APPROVAL_STEP_STATUS_ID
    FROM m_approval_step_status status_master
    WHERE status_master.STATUS_CODE = 'dataItem.STATUS_CODE'
      AND status_master.INUSE = 1
    LIMIT 1)`

  sql = sql.replaceAll('dataItem.STATUS_CODE', statusCode)

  return sql
}

const stepStatusIdsExpr = (values: unknown[]) => {
  const statusCodes = values.map(normalizeApprovalStepStatusCode)
  const codeList = [...new Set(statusCodes)].map((code) => "'" + code + "'").join(', ')

  let sql = `SELECT status_master.M_APPROVAL_STEP_STATUS_ID
    FROM m_approval_step_status status_master
    WHERE status_master.STATUS_CODE IN (dataItem.STATUS_CODES)
      AND status_master.INUSE = 1`

  sql = sql.replaceAll('dataItem.STATUS_CODES', codeList)

  return sql
}

const terminalStepStatusIdsExpr = () => `SELECT status_master.M_APPROVAL_STEP_STATUS_ID
    FROM m_approval_step_status status_master
    WHERE status_master.IS_TERMINAL = 1
      AND status_master.INUSE = 1`

export const APPROVAL_STEP_STATUS_ID_SQL = {
  PENDING: stepStatusIdExpr(APPROVAL_STEP_STATUS_CODE.PENDING),
  IN_PROGRESS: stepStatusIdExpr(APPROVAL_STEP_STATUS_CODE.IN_PROGRESS),
  APPROVED: stepStatusIdExpr(APPROVAL_STEP_STATUS_CODE.APPROVED),
  REJECTED: stepStatusIdExpr(APPROVAL_STEP_STATUS_CODE.REJECTED),
  SKIPPED: stepStatusIdExpr(APPROVAL_STEP_STATUS_CODE.SKIPPED),
} as const

export const ApprovalMasterSqlSnippets = {
  stepStatusIdExpr,
  stepStatusIdsExpr,
  terminalStepStatusIdsExpr,

  stepStatusCodeExpr: (taskAlias: string) => {
    let sql = `(
      SELECT LOWER(status_master.STATUS_CODE)
      FROM m_approval_step_status status_master
      WHERE status_master.M_APPROVAL_STEP_STATUS_ID = dataItem.TASK_ALIAS.M_APPROVAL_STEP_STATUS_ID
      LIMIT 1
    )`

    sql = sql.replaceAll('dataItem.TASK_ALIAS', taskAlias)

    return sql
  },

  stepStatusIsTerminalExpr: (taskAlias: string) => {
    let sql = `COALESCE((
      SELECT status_master.IS_TERMINAL
      FROM m_approval_step_status status_master
      WHERE status_master.M_APPROVAL_STEP_STATUS_ID = dataItem.TASK_ALIAS.M_APPROVAL_STEP_STATUS_ID
      LIMIT 1
    ), 0)`

    sql = sql.replaceAll('dataItem.TASK_ALIAS', taskAlias)

    return sql
  },

  groupCodeExpr: (taskAlias: string) => {
    let sql = `(
      SELECT approval_group_master.GROUP_CODE
      FROM approval_group approval_group_master
      WHERE approval_group_master.APPROVAL_GROUP_ID = dataItem.TASK_ALIAS.APPROVAL_GROUP_ID
      LIMIT 1
    )`

    sql = sql.replaceAll('dataItem.TASK_ALIAS', taskAlias)

    return sql
  },

  groupNameExpr: (taskAlias: string) => {
    let sql = `(
      SELECT approval_group_master.GROUP_NAME
      FROM approval_group approval_group_master
      WHERE approval_group_master.APPROVAL_GROUP_ID = dataItem.TASK_ALIAS.APPROVAL_GROUP_ID
      LIMIT 1
    )`

    sql = sql.replaceAll('dataItem.TASK_ALIAS', taskAlias)

    return sql
  },
}

const requestStateIdExpr = (value: unknown) => {
  const stateCode = normalizeRequestStateCode(value)
  let sql = `(SELECT request_state_master.M_REQUEST_STATE_ID
    FROM m_request_state request_state_master
    WHERE request_state_master.STATE_CODE = 'dataItem.STATE_CODE'
      AND request_state_master.INUSE = 1
    LIMIT 1)`

  sql = sql.replaceAll('dataItem.STATE_CODE', stateCode)

  return sql
}

const requestStateCodeByIdExpr = (idExpression: string) => {
  let sql = `COALESCE((
    SELECT LOWER(request_state_master.STATE_CODE)
    FROM m_request_state request_state_master
    WHERE request_state_master.M_REQUEST_STATE_ID = dataItem.ID_EXPRESSION
    LIMIT 1
  ), '')`

  sql = sql.replaceAll('dataItem.ID_EXPRESSION', idExpression)

  return sql
}

const requestStateIsTerminalByIdExpr = (idExpression: string) => {
  let sql = `COALESCE((
    SELECT request_state_master.IS_TERMINAL
    FROM m_request_state request_state_master
    WHERE request_state_master.M_REQUEST_STATE_ID = dataItem.ID_EXPRESSION
    LIMIT 1
  ), 0)`

  sql = sql.replaceAll('dataItem.ID_EXPRESSION', idExpression)

  return sql
}

export const REQUEST_STATE_ID_SQL = {
  IN_PROGRESS: requestStateIdExpr(REQUEST_STATE_CODE.IN_PROGRESS),
  COMPLETED: requestStateIdExpr(REQUEST_STATE_CODE.COMPLETED),
  REJECTED: requestStateIdExpr(REQUEST_STATE_CODE.REJECTED),
  CANCELLED: requestStateIdExpr(REQUEST_STATE_CODE.CANCELLED),
} as const

export const RequestStateSqlSnippets = {
  requestStateIdExpr,
  requestStateCodeByIdExpr,
  requestStateIsTerminalByIdExpr,
  requestStateCodeExpr: (requestAlias = 'rr') => {
    let idExpression = 'dataItem.REQUEST_ALIAS.M_REQUEST_STATE_ID'
    idExpression = idExpression.replaceAll('dataItem.REQUEST_ALIAS', requestAlias)
    return requestStateCodeByIdExpr(idExpression)
  },
  requestStateIsTerminalExpr: (requestAlias = 'rr') => {
    let idExpression = 'dataItem.REQUEST_ALIAS.M_REQUEST_STATE_ID'
    idExpression = idExpression.replaceAll('dataItem.REQUEST_ALIAS', requestAlias)
    return requestStateIsTerminalByIdExpr(idExpression)
  },
  terminalRequestStateIdsExpr: () => `SELECT request_state_master.M_REQUEST_STATE_ID
    FROM m_request_state request_state_master
    WHERE request_state_master.IS_TERMINAL = 1
      AND request_state_master.INUSE = 1`,
}

const normalizeStatusCode = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')

const normalizeGprCFlowStatusCode = (value: unknown): GprCFlowStatusCode => {
  const normalized = normalizeStatusCode(value || 'REQUESTER_SETUP')
  if (normalized in GPR_C_FLOW_STATUS_CODE) {
    return normalized as GprCFlowStatusCode
  }
  throw new Error('Unknown GPR C flow status: ' + String(value ?? ''))
}

const normalizeActionResultStatusCode = (value: unknown): ActionResultStatusCode => {
  const normalized = normalizeStatusCode(value || 'PENDING')
  if (normalized in ACTION_RESULT_STATUS_CODE) {
    return normalized as ActionResultStatusCode
  }
  throw new Error('Unknown action result status: ' + String(value ?? ''))
}

const flowStatusIdExpr = (value: unknown) => {
  const statusCode = normalizeGprCFlowStatusCode(value)
  let sql = `(SELECT flow_status_master.M_GPR_C_FLOW_STATUS_ID
    FROM m_gpr_c_flow_status flow_status_master
    WHERE flow_status_master.STATUS_CODE = 'dataItem.STATUS_CODE'
      AND flow_status_master.INUSE = 1
    LIMIT 1)`

  sql = sql.replaceAll('dataItem.STATUS_CODE', statusCode)

  return sql
}

const actionResultStatusIdExpr = (value: unknown) => {
  const statusCode = normalizeActionResultStatusCode(value)
  let sql = `(SELECT action_status_master.M_ACTION_RESULT_STATUS_ID
    FROM m_action_result_status action_status_master
    WHERE action_status_master.STATUS_CODE = 'dataItem.STATUS_CODE'
      AND action_status_master.INUSE = 1
    LIMIT 1)`

  sql = sql.replaceAll('dataItem.STATUS_CODE', statusCode)

  return sql
}

export const GPR_C_FLOW_STATUS_ID_SQL = {
  DRAFT: flowStatusIdExpr(GPR_C_FLOW_STATUS_CODE.DRAFT),
  REQUESTER_SETUP: flowStatusIdExpr(GPR_C_FLOW_STATUS_CODE.REQUESTER_SETUP),
  IN_PROGRESS: flowStatusIdExpr(GPR_C_FLOW_STATUS_CODE.IN_PROGRESS),
  RECHECK_REQUIRED: flowStatusIdExpr(GPR_C_FLOW_STATUS_CODE.RECHECK_REQUIRED),
  APPROVED: flowStatusIdExpr(GPR_C_FLOW_STATUS_CODE.APPROVED),
  REJECTED: flowStatusIdExpr(GPR_C_FLOW_STATUS_CODE.REJECTED),
} as const

export const ACTION_RESULT_STATUS_ID_SQL = {
  PENDING: actionResultStatusIdExpr(ACTION_RESULT_STATUS_CODE.PENDING),
  INCOMPLETE: actionResultStatusIdExpr(ACTION_RESULT_STATUS_CODE.INCOMPLETE),
  COMPLETED: actionResultStatusIdExpr(ACTION_RESULT_STATUS_CODE.COMPLETED),
} as const

export const GprStatusSqlSnippets = {
  flowStatusIdExpr,
  actionResultStatusIdExpr,

  flowStatusCodeExpr: (flowAlias = 'f') => {
    let sql = `(
      SELECT LOWER(flow_status_master.STATUS_CODE)
      FROM m_gpr_c_flow_status flow_status_master
      WHERE flow_status_master.M_GPR_C_FLOW_STATUS_ID = dataItem.FLOW_ALIAS.M_GPR_C_FLOW_STATUS_ID
      LIMIT 1
    )`

    sql = sql.replaceAll('dataItem.FLOW_ALIAS', flowAlias)

    return sql
  },

  flowStatusIsTerminalExpr: (flowAlias = 'f') => {
    let sql = `COALESCE((
      SELECT flow_status_master.IS_TERMINAL
      FROM m_gpr_c_flow_status flow_status_master
      WHERE flow_status_master.M_GPR_C_FLOW_STATUS_ID = dataItem.FLOW_ALIAS.M_GPR_C_FLOW_STATUS_ID
      LIMIT 1
    ), 0)`

    sql = sql.replaceAll('dataItem.FLOW_ALIAS', flowAlias)

    return sql
  },

  actionResultStatusCodeExpr: (actionAlias = 'ar') => {
    let sql = `(
      SELECT LOWER(action_status_master.STATUS_CODE)
      FROM m_action_result_status action_status_master
      WHERE action_status_master.M_ACTION_RESULT_STATUS_ID = dataItem.ACTION_ALIAS.M_ACTION_RESULT_STATUS_ID
      LIMIT 1
    )`

    sql = sql.replaceAll('dataItem.ACTION_ALIAS', actionAlias)

    return sql
  },

  nonTerminalActionResultStatusIdsExpr: () => `SELECT action_status_master.M_ACTION_RESULT_STATUS_ID
    FROM m_action_result_status action_status_master
    WHERE action_status_master.IS_TERMINAL = 0
      AND action_status_master.INUSE = 1`,
}

type StoredVendorStatusCode = Exclude<keyof typeof VENDOR_STATUS_CODE, 'IN_PROGRESS'>

const normalizeStoredVendorStatusCode = (value: unknown): StoredVendorStatusCode => {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_')

  if (normalized === VENDOR_STATUS_CODE.NOT_REGISTERED || normalized === '0') return 'NOT_REGISTERED'
  if (normalized === VENDOR_STATUS_CODE.REGISTERED || normalized === '1') return 'REGISTERED'
  if (normalized === VENDOR_STATUS_CODE.CANNOT_REGISTER || normalized === '2') return 'CANNOT_REGISTER'

  throw new Error('Unknown stored vendor status: ' + String(value ?? ''))
}

const vendorStatusIdExpr = (value: unknown) => {
  const statusCode = normalizeStoredVendorStatusCode(value)
  let sql = `(SELECT vendor_status_master.M_VENDOR_STATUS_ID
    FROM m_vendor_status vendor_status_master
    WHERE vendor_status_master.STATUS_CODE = 'dataItem.STATUS_CODE'
      AND vendor_status_master.INUSE = 1
    LIMIT 1)`

  sql = sql.replaceAll('dataItem.STATUS_CODE', statusCode)

  return sql
}

export const VENDOR_STATUS_ID_SQL = {
  NOT_REGISTERED: vendorStatusIdExpr(VENDOR_STATUS_CODE.NOT_REGISTERED),
  REGISTERED: vendorStatusIdExpr(VENDOR_STATUS_CODE.REGISTERED),
  CANNOT_REGISTER: vendorStatusIdExpr(VENDOR_STATUS_CODE.CANNOT_REGISTER),
} as const

const effectiveVendorStatusIdExpr = (vendorAlias = 'v') => {
  let sql = `
    CASE
      WHEN dataItem.VENDOR_ALIAS.FFT_STATUS = dataItem.CANNOT_REGISTER_STATUS_ID_SQL
        THEN dataItem.CANNOT_REGISTER_STATUS_ID_SQL
      WHEN dataItem.ACTIVE_REQUEST_EXISTS_SQL
        THEN (
          SELECT in_progress_status.M_VENDOR_STATUS_ID
          FROM m_vendor_status in_progress_status
          WHERE in_progress_status.STATUS_CODE = 'dataItem.IN_PROGRESS_STATUS_CODE'
            AND in_progress_status.INUSE = 1
          LIMIT 1
        )
      ELSE COALESCE(dataItem.VENDOR_ALIAS.FFT_STATUS, dataItem.NOT_REGISTERED_STATUS_ID_SQL)
    END
  `

  sql = sql.replaceAll('dataItem.VENDOR_ALIAS', vendorAlias)
  sql = sql.replaceAll('dataItem.CANNOT_REGISTER_STATUS_ID_SQL', VENDOR_STATUS_ID_SQL.CANNOT_REGISTER)
  sql = sql.replaceAll('dataItem.ACTIVE_REQUEST_EXISTS_SQL', activeRequestExistsExpr(vendorAlias))
  sql = sql.replaceAll('dataItem.IN_PROGRESS_STATUS_CODE', VENDOR_STATUS_CODE.IN_PROGRESS)
  sql = sql.replaceAll('dataItem.NOT_REGISTERED_STATUS_ID_SQL', VENDOR_STATUS_ID_SQL.NOT_REGISTERED)

  return sql
}

const activeRequestExistsExpr = (vendorAlias: string) => {
  let sql = `
    EXISTS (
      SELECT 1
      FROM request_register_vendor active_vendor_request
      WHERE active_vendor_request.VENDORS_ID = dataItem.VENDOR_ALIAS.VENDORS_ID
        AND active_vendor_request.INUSE = 1
        AND active_vendor_request.M_REQUEST_STATE_ID = dataItem.IN_PROGRESS_STATUS_ID_SQL
    )
  `

  sql = sql.replaceAll('dataItem.VENDOR_ALIAS', vendorAlias)
  sql = sql.replaceAll('dataItem.IN_PROGRESS_STATUS_ID_SQL', REQUEST_STATE_ID_SQL.IN_PROGRESS)

  return sql
}

export const VendorStatusSqlSnippets = {
  vendorStatusIdExpr,

  effectiveStatusIdExpr: effectiveVendorStatusIdExpr,

  statusCodeExpr: (vendorAlias = 'v', statusAlias = 'mvs') => {
    let sql = `
      COALESCE((
        SELECT effective_status.STATUS_CODE
        FROM m_vendor_status effective_status
        WHERE effective_status.M_VENDOR_STATUS_ID = dataItem.EFFECTIVE_STATUS_ID_SQL
          AND effective_status.INUSE = 1
        LIMIT 1
      ), dataItem.STATUS_ALIAS.STATUS_CODE)
    `

    sql = sql.replaceAll('dataItem.STATUS_ALIAS', statusAlias)
    sql = sql.replaceAll('dataItem.EFFECTIVE_STATUS_ID_SQL', effectiveVendorStatusIdExpr(vendorAlias))

    return sql
  },

  statusLabelExpr: (vendorAlias = 'v', statusAlias = 'mvs') => {
    let sql = `
      COALESCE((
        SELECT effective_status.STATUS_LABEL_EN
        FROM m_vendor_status effective_status
        WHERE effective_status.M_VENDOR_STATUS_ID = dataItem.EFFECTIVE_STATUS_ID_SQL
          AND effective_status.INUSE = 1
        LIMIT 1
      ), dataItem.STATUS_ALIAS.STATUS_LABEL_EN)
    `

    sql = sql.replaceAll('dataItem.STATUS_ALIAS', statusAlias)
    sql = sql.replaceAll('dataItem.EFFECTIVE_STATUS_ID_SQL', effectiveVendorStatusIdExpr(vendorAlias))

    return sql
  },
}

export const StatusMasterSQL = {
  getStatusMasters: async (dataItem: StatusMasterSearchData = {}) => {
    const masterType = normalizeStatusMasterType(dataItem.MASTER_TYPE)
    let masterTypeWhere = masterType ? "WHERE master_data.MASTER_TYPE = 'dataItem.MASTER_TYPE'" : ''
    masterTypeWhere = masterTypeWhere.replaceAll('dataItem.MASTER_TYPE', masterType)

    let sql = `
      SELECT
          master_data.MASTER_TYPE
        , master_data.STATUS_ID
        , master_data.STATUS_CODE
        , master_data.STATUS_LABEL_EN
        , master_data.STATUS_LABEL_TH
        , master_data.IS_TERMINAL
        , master_data.SORT_ORDER
        , master_data.DESCRIPTION
      FROM (
        SELECT
            1 AS MASTER_TYPE_SORT_ORDER
          , 'dataItem.APPROVAL_STEP_MASTER_TYPE' AS MASTER_TYPE
          , M_APPROVAL_STEP_STATUS_ID AS STATUS_ID
          , STATUS_CODE
          , STATUS_LABEL_EN
          , STATUS_LABEL_TH
          , IS_TERMINAL
          , SORT_ORDER
          , DESCRIPTION
        FROM m_approval_step_status
        WHERE INUSE = 1

        UNION ALL

        SELECT
            2 AS MASTER_TYPE_SORT_ORDER
          , 'dataItem.REQUEST_STATE_MASTER_TYPE' AS MASTER_TYPE
          , M_REQUEST_STATE_ID AS STATUS_ID
          , STATE_CODE AS STATUS_CODE
          , STATE_LABEL_EN AS STATUS_LABEL_EN
          , STATE_LABEL_TH AS STATUS_LABEL_TH
          , IS_TERMINAL
          , SORT_ORDER
          , DESCRIPTION
        FROM m_request_state
        WHERE INUSE = 1

        UNION ALL

        SELECT
            3 AS MASTER_TYPE_SORT_ORDER
          , 'dataItem.GPR_C_FLOW_MASTER_TYPE' AS MASTER_TYPE
          , M_GPR_C_FLOW_STATUS_ID AS STATUS_ID
          , STATUS_CODE
          , STATUS_LABEL_EN
          , STATUS_LABEL_TH
          , IS_TERMINAL
          , SORT_ORDER
          , DESCRIPTION
        FROM m_gpr_c_flow_status
        WHERE INUSE = 1

        UNION ALL

        SELECT
            4 AS MASTER_TYPE_SORT_ORDER
          , 'dataItem.ACTION_RESULT_MASTER_TYPE' AS MASTER_TYPE
          , M_ACTION_RESULT_STATUS_ID AS STATUS_ID
          , STATUS_CODE
          , STATUS_LABEL_EN
          , STATUS_LABEL_TH
          , IS_TERMINAL
          , SORT_ORDER
          , DESCRIPTION
        FROM m_action_result_status
        WHERE INUSE = 1

        UNION ALL

        SELECT
            5 AS MASTER_TYPE_SORT_ORDER
          , 'dataItem.VENDOR_MASTER_TYPE' AS MASTER_TYPE
          , M_VENDOR_STATUS_ID AS STATUS_ID
          , STATUS_CODE
          , STATUS_LABEL_EN
          , STATUS_LABEL_TH
          , NULL AS IS_TERMINAL
          , SORT_ORDER
          , DESCRIPTION
        FROM m_vendor_status
        WHERE INUSE = 1
      ) master_data
      dataItem.MASTER_TYPE_WHERE
      ORDER BY
          master_data.MASTER_TYPE_SORT_ORDER ASC
        , master_data.SORT_ORDER ASC
        , master_data.STATUS_ID ASC
    `

    sql = sql.replaceAll('dataItem.APPROVAL_STEP_MASTER_TYPE', STATUS_MASTER_TYPE.APPROVAL_STEP)
    sql = sql.replaceAll('dataItem.REQUEST_STATE_MASTER_TYPE', STATUS_MASTER_TYPE.REQUEST_STATE)
    sql = sql.replaceAll('dataItem.GPR_C_FLOW_MASTER_TYPE', STATUS_MASTER_TYPE.GPR_C_FLOW)
    sql = sql.replaceAll('dataItem.ACTION_RESULT_MASTER_TYPE', STATUS_MASTER_TYPE.ACTION_RESULT)
    sql = sql.replaceAll('dataItem.VENDOR_MASTER_TYPE', STATUS_MASTER_TYPE.VENDOR)
    sql = sql.replaceAll('dataItem.MASTER_TYPE_WHERE', masterTypeWhere)

    return sql
  },

  getActiveWorkflowStepMasters: async (dataItem: any = {}) => {
    const workflowDefinitionId = Number(dataItem.WORKFLOW_DEFINITION_ID)
    let workflowDefinitionCondition = workflowDefinitionId > 0
      ? 'wsm.WORKFLOW_DEFINITION_ID = dataItem.WORKFLOW_DEFINITION_ID'
      : `wd.INUSE = 1
        AND wd.DEFINITION_STATUS = 'PUBLISHED'
        AND wd.VERSION_NO = (
          SELECT MAX(active_wd.VERSION_NO)
          FROM workflow_definition active_wd
          WHERE active_wd.WORKFLOW_CODE = wd.WORKFLOW_CODE
            AND active_wd.DEFINITION_STATUS = 'PUBLISHED'
            AND active_wd.INUSE = 1
        )`
    let sql = `
      SELECT
          wsm.WORKFLOW_STEP_MASTER_ID
        , wsm.STEP_CODE
        , wsm.WORKFLOW_STEP_TYPE_ID
      FROM workflow_step_master wsm
      INNER JOIN workflow_definition wd
        ON wd.WORKFLOW_DEFINITION_ID = wsm.WORKFLOW_DEFINITION_ID
      WHERE wd.WORKFLOW_CODE = 'dataItem.WORKFLOW_CODE'
        AND dataItem.WORKFLOW_DEFINITION_CONDITION
        AND wsm.INUSE = 1
      ORDER BY wsm.DEFAULT_STEP_ORDER, wsm.WORKFLOW_STEP_MASTER_ID
    `
    sql = sql.replaceAll('dataItem.WORKFLOW_CODE', 'VENDOR_REGISTRATION')
    workflowDefinitionCondition = workflowDefinitionCondition.replaceAll(
      'dataItem.WORKFLOW_DEFINITION_ID',
      workflowDefinitionId.toString()
    )
    sql = sql.replaceAll('dataItem.WORKFLOW_DEFINITION_CONDITION', workflowDefinitionCondition)
    return sql
  },

  getActiveRequestStatusMasters: async () => {
    return `
      SELECT
          request_status_master.M_REQUEST_STATUS_ID
        , request_status_master.STATUS_CODE
      FROM m_request_status request_status_master
      WHERE request_status_master.INUSE = 1
      ORDER BY request_status_master.M_REQUEST_STATUS_ID
    `
  },

  getWorkflowStepTypes: async () => {
    return `
      SELECT
          WORKFLOW_STEP_TYPE_ID
        , STEP_CODE
      FROM m_workflow_step_type
      WHERE INUSE = 1
      ORDER BY SORT_ORDER, WORKFLOW_STEP_TYPE_ID
    `
  },
}
