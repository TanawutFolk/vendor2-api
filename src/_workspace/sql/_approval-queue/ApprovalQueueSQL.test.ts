import { describe, expect, test } from 'bun:test'
import { ApprovalQueueSQL } from './ApprovalQueueSQL'

describe('ApprovalQueueSQL reassignment statements', () => {
  test('uses assignment history values directly', async () => {
    const sql = await ApprovalQueueSQL.insertAssignmentHistory({
      REQUEST_REGISTER_VENDOR_ID: 10,
      REQUEST_APPROVAL_STEP_ID: 20,
      SCOPE: 'REQUEST_PIC',
      STEP_CODE: 'PIC_REVIEW',
      GROUP_CODE: 'LOCAL_PO_PIC',
      FROM_EMPCODE: 'OLD',
      TO_EMPCODE: 'NEW',
      REASON: "PIC's folder \\ handover",
      DESCRIPTION: "PIC's folder \\ handover",
      CHANGED_BY: "USER'01",
      CREATE_BY: "USER'01",
      UPDATE_BY: "USER'01",
    })

    expect(sql).toContain("PIC's folder \\ handover")
    expect(sql).toContain("USER'01")
  })

  test('uses approval log values directly', async () => {
    const sql = await ApprovalQueueSQL.createApprovalLog({
      REQUEST_REGISTER_VENDOR_ID: 10,
      REQUEST_APPROVAL_STEP_ID: 20,
      ACTION_BY: "USER'01",
      ACTION_TYPE: 'reassigned_pic',
      REMARK: "PIC's responsibility changed",
    })

    expect(sql).toContain("USER'01")
    expect(sql).toContain("PIC's responsibility changed")
    expect(sql).toContain('DESCRIPTION')
    expect(sql).toContain('REJECT_REASON')
    expect(sql).toContain('CREATE_BY')
    expect(sql).toContain('UPDATE_BY')
    expect(sql).toContain('INUSE')
  })

  test('completes a request using normalized state and canonical vendor code', async () => {
    const sql = await ApprovalQueueSQL.completeRegistration({
      REQUEST_REGISTER_VENDOR_ID: 10,
      VENDOR_CODE: 'V00010',
      UPDATE_BY: 'S00001',
    })

    expect(sql).toContain("APPROVED_VENDOR_CODE = 'V00010'")
    expect(sql).not.toContain('REQUEST_STATUS =')
    expect(sql).toContain("REQUEST_STATE = 'completed'")
    expect(sql).toContain('CURRENT_M_REQUEST_STATUS_ID')
    expect(sql).toContain('CURRENT_REQUEST_APPROVAL_STEP_ID = NULL')
  })

  test('loads status options from the latest active workflow version', async () => {
    const sql = await ApprovalQueueSQL.getStatusOptions()

    expect(sql).toContain("WORKFLOW_CODE = 'VENDOR_REGISTRATION'")
    expect(sql).toContain('ORDER BY VERSION_NO DESC')
    expect(sql).toContain('LIMIT 1')
  })
  test('keeps approval queue list query lightweight', async () => {
    const [, dataSql] = await ApprovalQueueSQL.getAllRequests({
      APPROVER_EMPCODE: 'S00001',
      QUEUE_STEP_CODE: 'DOC_CHECK',
      LIMIT: 25,
      OFFSET: 0,
    })

    expect(dataSql).toContain('DOCUMENTS_COUNT')
    expect(dataSql).toContain('MY_APPROVAL_STATUS')
    expect(dataSql).toContain('GPR_C_SETUP_COMPLETED')
    expect(dataSql).not.toContain('AS contacts')
    expect(dataSql).not.toContain('AS products')
    expect(dataSql).not.toContain('AS documents')
    expect(dataSql).not.toContain('AS approval_steps')
    expect(dataSql).not.toContain('AS approval_logs')
    expect(dataSql).not.toContain('AS gpr_criteria')
  })
})
