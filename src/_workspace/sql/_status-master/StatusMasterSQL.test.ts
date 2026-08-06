import { describe, expect, test } from 'bun:test'
import {
  APPROVAL_STEP_STATUS_ID_SQL,
  ApprovalMasterSqlSnippets,
  GprStatusSqlSnippets,
  normalizeApprovalStepStatusCode,
  REQUEST_STATE_ID_SQL,
  RequestStateSqlSnippets,
  StatusMasterSQL,
  VendorStatusSqlSnippets,
} from './StatusMasterSQL'

describe('StatusMasterSQL', () => {
  test('resolves runtime IDs by stable master code instead of numeric constants', () => {
    expect(APPROVAL_STEP_STATUS_ID_SQL.APPROVED).toContain("STATUS_CODE = 'APPROVED'")
    expect(REQUEST_STATE_ID_SQL.COMPLETED).toContain("STATE_CODE = 'COMPLETED'")
    expect(VendorStatusSqlSnippets.vendorStatusIdExpr('registered')).toContain("STATUS_CODE = 'REGISTERED'")
  })

  test('uses database terminal flags for generic terminal checks', () => {
    expect(ApprovalMasterSqlSnippets.terminalStepStatusIdsExpr()).toContain('IS_TERMINAL = 1')
    expect(RequestStateSqlSnippets.terminalRequestStateIdsExpr()).toContain('IS_TERMINAL = 1')
    expect(GprStatusSqlSnippets.nonTerminalActionResultStatusIdsExpr()).toContain('IS_TERMINAL = 0')
  })

  test('loads every active status master in database sort order', async () => {
    const sql = await StatusMasterSQL.getStatusMasters()

    expect(sql).toContain('FROM m_approval_step_status')
    expect(sql).toContain('FROM m_request_state')
    expect(sql).toContain('FROM m_gpr_c_flow_status')
    expect(sql).toContain('FROM m_action_result_status')
    expect(sql).toContain('FROM m_vendor_status')
    expect(sql).toContain('master_data.SORT_ORDER ASC')
    expect(sql).not.toContain('dataItem.')
  })

  test('filters the endpoint query by a validated master type', async () => {
    const sql = await StatusMasterSQL.getStatusMasters({ MASTER_TYPE: 'REQUEST_STATE' })

    expect(sql).toContain("WHERE master_data.MASTER_TYPE = 'REQUEST_STATE'")
    expect(sql).not.toContain('dataItem.')
    expect(() => StatusMasterSQL.getStatusMasters({ MASTER_TYPE: 'INVALID' as any })).toThrow(
      'Unknown status master type'
    )
  })

  test('replaces every company-pattern SQL placeholder before returning snippets', () => {
    const sqlSnippets = [
      ApprovalMasterSqlSnippets.stepStatusCodeExpr('task'),
      RequestStateSqlSnippets.requestStateCodeExpr('rr'),
      GprStatusSqlSnippets.flowStatusCodeExpr('flow'),
      VendorStatusSqlSnippets.statusCodeExpr('vendor', 'vendor_status'),
      VendorStatusSqlSnippets.statusLabelExpr('vendor', 'vendor_status'),
    ]

    for (const sql of sqlSnippets) {
      expect(sql).not.toContain('dataItem.')
    }
  })

  test('rejects unknown runtime status codes before building SQL', () => {
    expect(() => normalizeApprovalStepStatusCode('not-a-real-status')).toThrow('Unknown approval step status')
    expect(() => VendorStatusSqlSnippets.vendorStatusIdExpr('in_progress')).toThrow('Unknown stored vendor status')
  })
})
