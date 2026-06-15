import { describe, expect, test } from 'bun:test'
import { ApprovalQueueSQL } from './ApprovalQueueSQL'

describe('ApprovalQueueSQL reassignment statements', () => {
  test('escapes apostrophes and backslashes in assignment history', async () => {
    const sql = await ApprovalQueueSQL.insertAssignmentHistory({
      REQUEST_ID: 10,
      STEP_ID: 20,
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

    expect(sql).toContain("PIC\\'s folder \\\\ handover")
    expect(sql).toContain("USER\\'01")
  })

  test('escapes approval log fields', async () => {
    const sql = await ApprovalQueueSQL.createApprovalLog({
      REQUEST_ID: 10,
      STEP_ID: 20,
      ACTION_BY: "USER'01",
      ACTION_TYPE: 'reassigned_pic',
      REMARK: "PIC's responsibility changed",
    })

    expect(sql).toContain("USER\\'01")
    expect(sql).toContain("PIC\\'s responsibility changed")
    expect(sql).toContain('DESCRIPTION')
    expect(sql).toContain('CREATE_BY')
    expect(sql).toContain('UPDATE_BY')
    expect(sql).toContain('INUSE')
  })

  test('completes a request using normalized state and canonical vendor code', async () => {
    const sql = await ApprovalQueueSQL.completeRegistration({
      REQUEST_ID: 10,
      VENDOR_CODE: 'V00010',
      UPDATE_BY: 'S00001',
    })

    expect(sql).toContain("APPROVED_VENDOR_CODE = 'V00010'")
    expect(sql).toContain("REQUEST_STATE = 'completed'")
    expect(sql).toContain('CURRENT_STATUS_ID')
    expect(sql).toContain('CURRENT_STEP_ID = NULL')
  })

  test('loads status options from the latest active workflow version', async () => {
    const sql = await ApprovalQueueSQL.getStatusOptions()

    expect(sql).toContain("WORKFLOW_CODE = 'VENDOR_REGISTRATION'")
    expect(sql).toContain('ORDER BY VERSION_NO DESC')
    expect(sql).toContain('LIMIT 1')
  })
})
