import { describe, expect, test } from 'bun:test'
import { GprCApprovalSQL } from './GprCApprovalSQL'

describe('GprCApprovalSQL normalized circular members', () => {
  test('stores a main GPR C rejection in REJECT_REASON without using DESCRIPTION', async () => {
    const sql = await GprCApprovalSQL.createApprovalLog({
      REQUEST_REGISTER_VENDOR_ID: 1,
      REQUEST_APPROVAL_STEP_ID: 2,
      ACTION_BY: 'S00001',
      ACTION_TYPE: 'rejected',
      ACTION_CODE: 'REJECT',
      REMARK: '',
      REJECT_REASON: 'GPR C reject verification',
    })

    expect(sql).toMatch(/,\s*'rejected'\s*,\s*'REJECT'/)
    expect(sql).toContain('REJECT_REASON')
    expect(sql).toContain("'GPR C reject verification'")
    expect(sql).toContain("LEFT('', 100)")
  })

  test('keeps CIRCULAR_JSON out of request_vendor_gpr_c_flows', () => {
    const sql = GprCApprovalSQL.updateFlowSetup({
      REQUEST_VENDOR_GPR_C_FLOWS_ID: 1,
      REQUEST_REGISTER_VENDOR_ID: 10,
      REQUEST_VENDOR_SELECTIONS_ID: 20,
      M_GPR_C_FLOW_STATUS_ID: 3,
      CURRENT_STEP_CODE: 'REQUESTER_APPROVER',
      REQUESTER_EMPCODE: 'S00001',
      GPR_C_APPROVER_EMPCODE: 'S00002',
      GPR_C_APPROVER_NAME: 'Approver',
      GPR_C_APPROVER_EMAIL: 'approver@example.com',
      PC_PIC_EMPCODE: 'S00004',
      PC_PIC_NAME: 'PIC',
      PC_PIC_EMAIL: 'pic@example.com',
      CIRCULAR_JSON: '[{"empcode":"S00003"}]',
      UPDATE_BY: 'S00001',
    })

    expect(sql).not.toContain('CIRCULAR_JSON')
    expect(sql).toContain('GPR_C_APPROVER_EMPCODE')
    expect(sql).toContain('PC_PIC_EMPCODE')
    expect(sql).toContain('PC_PIC_EMAIL')
  })
  test('escapes a Product Group name when creating a dynamic checker step', () => {
    const sql = GprCApprovalSQL.insertStep({
      REQUEST_VENDOR_GPR_C_FLOWS_ID: 1,
      STEP_ORDER: 1,
      STEP_CODE: 'PRODUCT_GROUP_CHECKER',
      STEP_NAME: "Engineer's Parts Checker",
      APPROVER_EMPCODE: 'S00002',
      APPROVER_NAME: "O'Brien",
      APPROVER_EMAIL: 'checker@example.com',
      M_APPROVAL_STEP_STATUS_ID: 2,
      CREATE_BY: 'S00001',
      UPDATE_BY: 'S00001',
    })

    expect(sql).toContain("Engineer''s Parts Checker")
    expect(sql).toContain("O''Brien")
    expect(sql).toContain("'PRODUCT_GROUP_CHECKER'")
  })
  test('keeps request id on the flow and derives it for GPR C child rows', () => {
    const stepInsertSql = GprCApprovalSQL.insertStep({
      REQUEST_VENDOR_GPR_C_FLOWS_ID: 1,
      REQUEST_REGISTER_VENDOR_ID: 10,
      STEP_ORDER: 1,
      STEP_CODE: 'REQUESTER_APPROVER',
      STEP_NAME: 'Requester Approver',
      APPROVER_EMPCODE: 'S00002',
      APPROVER_NAME: 'Approver',
      APPROVER_EMAIL: 'approver@example.com',
      M_APPROVAL_STEP_STATUS_ID: 1,
      CREATE_BY: 'S00001',
      UPDATE_BY: 'S00001',
    })
    const actionRequiredInsertSql = GprCApprovalSQL.insertActionRequired({
      REQUEST_VENDOR_GPR_C_FLOWS_ID: 1,
      REQUEST_VENDOR_GPR_C_STEPS_ID: 2,
      REQUEST_REGISTER_VENDOR_ID: 10,
      STAGE_CODE: 'EMR',
      STAGE_NAME: 'EMR',
      PIC_NAME: 'PIC',
      PIC_EMAIL: 'pic@example.com',
      REQUIRED_DETAIL: 'Need document',
      M_ACTION_RESULT_STATUS_ID: 1,
      CREATE_BY: 'S00001',
      UPDATE_BY: 'S00001',
    })
    const stepReadSql = GprCApprovalSQL.getStepById({ REQUEST_VENDOR_GPR_C_STEPS_ID: 2 })
    const actionReadSql = GprCApprovalSQL.getActionRequiredById({ REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID: 3 })

    expect(stepInsertSql).not.toContain('REQUEST_REGISTER_VENDOR_ID')
    expect(actionRequiredInsertSql).not.toContain('REQUEST_REGISTER_VENDOR_ID')
    expect(stepReadSql).toContain('f.REQUEST_REGISTER_VENDOR_ID')
    expect(actionReadSql).toContain('f.REQUEST_REGISTER_VENDOR_ID')
  })
  test('keeps the GPR C approval queue to one contact row per request', () => {
    const queueSql = GprCApprovalSQL.getQueueByApprover({ APPROVER_EMPCODE: 'S00001' })
    const [, pagedQueueSql] = GprCApprovalSQL.getQueueByApproverPaginated({
      APPROVER_EMPCODE: 'S00001',
      START: 0,
      LIMIT: 20,
      ORDER: [{ id: 'REQUEST_VENDOR_GPR_C_FLOWS_ID', desc: true }],
    })

    for (const sql of [queueSql, pagedQueueSql]) {
      expect(sql).not.toContain('ON vc.VENDORS_ID = v.VENDORS_ID')
      expect(sql).toContain('vc_fallback.VENDOR_CONTACTS_ID')
      expect(sql).toContain('SELECT vc_any.VENDOR_CONTACTS_ID')
      expect(sql).toContain('COALESCE(vc_sel.CONTACT_NAME, vc_fallback.CONTACT_NAME) AS CONTACT_NAME')
      expect(sql).toContain('COALESCE(vc_sel.EMAIL, vc_fallback.EMAIL, v.EMAILMAIN) AS VENDOR_EMAIL')
    }
  })
  test('marks terminal flow current step as Finished for the DB constraint', () => {
    const sql = GprCApprovalSQL.updateFlowStatus({
      REQUEST_VENDOR_GPR_C_FLOWS_ID: 1,
      M_GPR_C_FLOW_STATUS_ID: 4,
      CURRENT_STEP_CODE: null,
      COMPLETED_AT: 'NOW()',
      UPDATE_BY: 'S00001',
    })

    expect(sql).toContain('CURRENT_STEP_CODE = \'Finished\'')
    expect(sql).not.toContain('CURRENT_STEP_CODE = NULL')
  })

  test('stores and filters GPR C statuses by master ID', () => {
    const flowSql = GprCApprovalSQL.updateFlowStatus({
      REQUEST_VENDOR_GPR_C_FLOWS_ID: 1,
      M_GPR_C_FLOW_STATUS_ID: 4,
      CURRENT_STEP_CODE: 'Finished',
      UPDATE_BY: 'S00001',
    })
    const stepSql = GprCApprovalSQL.updateStepAction({
      REQUEST_VENDOR_GPR_C_STEPS_ID: 2,
      M_APPROVAL_STEP_STATUS_ID: 4,
      ACTION_BY: 'S00001',
      ACTION_TYPE: 'REJECTED',
      UPDATE_BY: 'S00001',
    })
    const actionSql = GprCApprovalSQL.updateActionRequiredResult({
      REQUEST_VENDOR_GPR_C_ACTION_REQUIRED_ID: 3,
      M_ACTION_RESULT_STATUS_ID: 37,
      RESULT_BY: 'S00001',
      UPDATE_BY: 'S00001',
    })
    const queueSql = GprCApprovalSQL.getTaskManagerQueue()

    expect(flowSql).toContain('M_GPR_C_FLOW_STATUS_ID = 4')
    expect(stepSql).toContain('M_APPROVAL_STEP_STATUS_ID = 4')
    expect(flowSql).not.toContain("STATUS_CODE = 'APPROVED'")
    expect(stepSql).not.toContain("STATUS_CODE = 'REJECTED'")
    expect(actionSql).toContain('M_ACTION_RESULT_STATUS_ID = 37')
    expect(actionSql).toContain('status_master.M_ACTION_RESULT_STATUS_ID = 37')
    expect(queueSql).toContain("status_master.STATUS_CODE = 'IN_PROGRESS'")
    expect(queueSql).toContain("flow_status_master.STATUS_CODE = 'IN_PROGRESS'")
  })

  test('resolves the GPR C re-check transition by action and target master IDs', async () => {
    const transitionSql = await GprCApprovalSQL.getMainWorkflowTransition({
      REQUEST_REGISTER_VENDOR_ID: 101,
      CURRENT_WORKFLOW_STEP_MASTER_ID: 10,
      ACTION_CODE: 'RECHECK',
      TARGET_WORKFLOW_STEP_MASTER_ID: 3,
      TERMINAL_REQUEST_STATE_ID: null,
      M_REQUEST_IN_PROGRESS_STATE_ID: 1,
    })
    const approverSql = await GprCApprovalSQL.updateMainApprovalStepApprover({
      REQUEST_APPROVAL_STEP_ID: 200,
      APPROVER_EMPCODE: 'S00007',
      UPDATE_BY: 'S00001',
    })

    expect(transitionSql).toContain("wt.ACTION_CODE = 'RECHECK'")
    expect(transitionSql).toContain('wt.TO_WORKFLOW_STEP_MASTER_ID = 3')
    expect(transitionSql).not.toContain('dataItem.')
    expect(approverSql).toContain('REQUEST_APPROVAL_STEP_ID = 200')
    expect(approverSql).toContain("APPROVER_EMPCODE = 'S00007'")
  })
})
