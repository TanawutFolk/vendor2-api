import { describe, expect, test } from 'bun:test'
import { GprCApprovalSQL } from './GprCApprovalSQL'

describe('GprCApprovalSQL normalized circular members', () => {
  test('keeps CIRCULAR_JSON out of request_vendor_gpr_c_flows', () => {
    const sql = GprCApprovalSQL.updateFlowSetup({
      REQUEST_VENDOR_GPR_C_FLOWS_ID: 1,
      REQUEST_REGISTER_VENDOR_ID: 10,
      REQUEST_VENDOR_SELECTIONS_ID: 20,
      FLOW_STATUS: 'in_progress',
      CURRENT_STEP_CODE: 'REQUESTER_APPROVER',
      REQUESTER_EMPCODE: 'S00001',
      GPR_C_APPROVER_EMPCODE: 'S00002',
      GPR_C_APPROVER_NAME: 'Approver',
      GPR_C_APPROVER_EMAIL: 'approver@example.com',
      PC_PIC_NAME: 'PIC',
      PC_PIC_EMAIL: 'pic@example.com',
      CIRCULAR_JSON: '[{"empcode":"S00003"}]',
      UPDATE_BY: 'S00001',
    })

    expect(sql).not.toContain('CIRCULAR_JSON')
    expect(sql).toContain('GPR_C_APPROVER_EMPCODE')
    expect(sql).toContain('PC_PIC_EMAIL')
  })
})
