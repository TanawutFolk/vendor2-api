import { RequestStatusSqlSnippets } from '../common/RequestStatusSqlSnippets'
import {
  APPROVAL_STEP_STATUS_ID_SQL,
  ApprovalMasterSqlSnippets,
  GPR_C_FLOW_STATUS_ID_SQL,
  GprStatusSqlSnippets,
} from '../_status-master/StatusMasterSQL'

export const TaskManagerRequestSQL = {
  getTaskManagerQueue: () => {
    let sql = `
            SELECT
                f.REQUEST_VENDOR_GPR_C_FLOWS_ID,
                f.REQUEST_REGISTER_VENDOR_ID,
                f.M_GPR_C_FLOW_STATUS_ID,
                dataItem.GPR_C_FLOW_STATUS_SQL AS FLOW_STATUS,
                f.CURRENT_STEP_CODE,
                s.REQUEST_VENDOR_GPR_C_STEPS_ID,
                s.STEP_ORDER,
                s.STEP_CODE,
                s.STEP_NAME,
                s.APPROVER_EMPCODE,
                s.APPROVER_NAME,
                s.APPROVER_EMAIL,
                s.M_APPROVAL_STEP_STATUS_ID,
                dataItem.APPROVAL_STEP_STATUS_SQL AS STEP_STATUS,
                rr.REQUEST_NUMBER,
                dataItem.REQUEST_STATUS_SQL AS REQUEST_STATUS,
                rr.SUPPORTPRODUCT_PROCESS,
                rr.PURCHASE_FREQUENCY,
                rr.REQUEST_BY_EMPLOYEECODE,
                rr.CREATE_DATE AS REQUEST_CREATE_DATE,
                v.COMPANY_NAME,
                v.VENDOR_REGION
            FROM REQUEST_VENDOR_GPR_C_FLOWS f
                JOIN REQUEST_VENDOR_GPR_C_STEPS s
                    ON s.REQUEST_VENDOR_GPR_C_FLOWS_ID = f.REQUEST_VENDOR_GPR_C_FLOWS_ID
                    AND s.M_APPROVAL_STEP_STATUS_ID = dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID
                    AND s.INUSE = 1
                JOIN request_register_vendor rr
                    ON rr.REQUEST_REGISTER_VENDOR_ID = f.REQUEST_REGISTER_VENDOR_ID
                    AND rr.INUSE = 1
                LEFT JOIN vendors v
                    ON v.VENDORS_ID = rr.VENDORS_ID
            WHERE f.INUSE = 1
              AND f.M_GPR_C_FLOW_STATUS_ID = dataItem.GPR_C_FLOW_IN_PROGRESS_STATUS_ID
            ORDER BY f.REQUEST_VENDOR_GPR_C_FLOWS_ID DESC
        `
    sql = sql.replaceAll('dataItem.GPR_C_FLOW_STATUS_SQL', String(GprStatusSqlSnippets.flowStatusCodeExpr('f')))
    sql = sql.replaceAll('dataItem.APPROVAL_STEP_STATUS_SQL', String(ApprovalMasterSqlSnippets.stepStatusCodeExpr('s')))
    sql = sql.replaceAll('dataItem.REQUEST_STATUS_SQL', String(RequestStatusSqlSnippets.requestStatusExpr('rr')))
    sql = sql.replaceAll('dataItem.APPROVAL_STEP_IN_PROGRESS_STATUS_ID', String(APPROVAL_STEP_STATUS_ID_SQL.IN_PROGRESS))
    sql = sql.replaceAll('dataItem.GPR_C_FLOW_IN_PROGRESS_STATUS_ID', String(GPR_C_FLOW_STATUS_ID_SQL.IN_PROGRESS))
    return sql
  },
}
