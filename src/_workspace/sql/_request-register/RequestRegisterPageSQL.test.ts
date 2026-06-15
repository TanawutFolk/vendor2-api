import { describe, expect, test } from 'bun:test'
import { RequestRegisterPageSQL } from './RequestRegisterPageSQL'

describe('RequestRegisterPageSQL approval step identity', () => {
  test('inserts STATUS_ID together with the canonical STEP_CODE', async () => {
    const sql = await RequestRegisterPageSQL.createApprovalStep({
      REQUEST_ID: 10,
      WORKFLOW_STEP_ID: 15,
      STATUS_ID: 5,
      STEP_ORDER: 3,
      APPROVER_ID: 'S00001',
      STEP_STATUS: 'pending',
      DESCRIPTION: 'Document review',
      STEP_CODE: 'DOC_CHECK',
      ACTOR_TYPE: 'APPROVER',
      GROUP_CODE: 'PO_CHECKER_MAIN',
      ASSIGNMENT_MODE: 'AUTO',
      CREATE_BY: 'S00001',
    })

    expect(sql).toContain('STATUS_ID')
    expect(sql).toContain('WORKFLOW_STEP_ID')
    expect(sql).toContain('15')
    expect(sql).toContain('DOC_CHECK')
    expect(sql).toContain('PO_CHECKER_MAIN')
  })

  test('loads master identity by STEP_CODE', async () => {
    const sql = await RequestRegisterPageSQL.getStatusByStepCode({
      STEP_CODE: 'PO_MGR_APPROVAL',
    })

    expect(sql).toContain("STEP_CODE = 'PO_MGR_APPROVAL'")
    expect(sql).toContain('WORKFLOW_STEP_ID')
    expect(sql).toContain('STATUS_ID')
    expect(sql).toContain('ORDER BY')
    expect(sql).toContain('VERSION_NO DESC')
  })

  test('loads status options from the latest active workflow version', async () => {
    const sql = await RequestRegisterPageSQL.getStatusOptions()

    expect(sql).toContain("WORKFLOW_CODE = 'VENDOR_REGISTRATION'")
    expect(sql).toContain('ORDER BY VERSION_NO DESC')
    expect(sql).toContain('LIMIT 1')
  })

  test('writes normalized GPR setup identities with the compatibility cache', () => {
    const sql = RequestRegisterPageSQL.insertSelection({
      REQUEST_ID: 10,
      GPR_C_APPROVER_EMPCODE: 'S00001',
      GPR_C_PC_PIC_EMPCODE: 'S00002',
      GPR_C_CIRCULAR_JSON: '[]',
      ACTION_REQUIRED_JSON: '{}',
      CREATE_BY: 'S00001',
      UPDATE_BY: 'S00001',
    })

    expect(sql).toContain('GPR_C_APPROVER_EMPCODE')
    expect(sql).toContain('GPR_C_PC_PIC_EMPCODE')
    expect(sql).toContain('S00001')
    expect(sql).toContain('S00002')
    expect(sql).toContain('DESCRIPTION')
    expect(sql).toContain('INUSE')
  })

  test('soft-deletes and reactivates normalized GPR child rows', () => {
    const deactivateSql = RequestRegisterPageSQL.deleteGprActionSetup({
      SELECTION_ID: 10,
      UPDATE_BY: 'S00001',
    })
    const upsertSql = RequestRegisterPageSQL.insertGprActionSetup({
      SELECTION_ID: 10,
      STAGE_CODE: 'engineer',
      RESULT_NOTE: 'checked',
      CREATE_BY: 'S00001',
      UPDATE_BY: 'S00001',
    })

    expect(deactivateSql).toContain('INUSE = 0')
    expect(deactivateSql).not.toContain('DELETE FROM')
    expect(upsertSql).toContain('ON DUPLICATE KEY UPDATE')
    expect(upsertSql).toContain('INUSE = 1')
  })
})
