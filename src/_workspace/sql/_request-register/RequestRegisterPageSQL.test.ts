import { describe, expect, test } from 'bun:test'
import { RequestRegisterPageSQL } from './RequestRegisterPageSQL'

describe('RequestRegisterPageSQL approval step identity', () => {
  test('stores workflow step id instead of duplicating master step fields', async () => {
    const sql = await RequestRegisterPageSQL.createApprovalStep({
      REQUEST_REGISTER_VENDOR_ID: 10,
      WORKFLOW_STEP_MASTER_ID: 15,
      M_REQUEST_STATUS_ID: 5,
      STEP_ORDER: 3,
      APPROVER_EMPCODE: 'S00001',
      STEP_STATUS: 'pending',
      DESCRIPTION: 'Document review',
      STEP_CODE: 'DOC_CHECK',
      ACTOR_TYPE: 'APPROVER',
      GROUP_CODE: 'PO_CHECKER_MAIN',
      ASSIGNMENT_MODE: 'AUTO',
      CREATE_BY: 'S00001',
    })

    expect(sql).toContain('WORKFLOW_STEP_MASTER_ID')
    expect(sql).toContain('15')
    expect(sql).toContain('PO_CHECKER_MAIN')
    expect(sql).not.toContain('M_REQUEST_STATUS_ID')
    expect(sql).not.toContain('STEP_CODE')
    expect(sql).not.toContain('ACTOR_TYPE')
    expect(sql).not.toContain('DESCRIPTION')
  })

  test('loads master identity by STEP_CODE', async () => {
    const sql = await RequestRegisterPageSQL.getStatusByStepCode({
      STEP_CODE: 'PO_MGR_APPROVAL',
    })

    expect(sql).toContain("STEP_CODE = 'PO_MGR_APPROVAL'")
    expect(sql).toContain('WORKFLOW_STEP_MASTER_ID')
    expect(sql).toContain('M_REQUEST_STATUS_ID')
    expect(sql).toContain('ORDER BY')
    expect(sql).toContain('VERSION_NO DESC')
  })

  test('loads status options from the latest active workflow version', async () => {
    const sql = await RequestRegisterPageSQL.getStatusOptions()

    expect(sql).toContain("WORKFLOW_CODE = 'VENDOR_REGISTRATION'")
    expect(sql).toContain('ORDER BY VERSION_NO DESC')
    expect(sql).toContain('LIMIT 1')
  })

  test('loads approval step identity from workflow master joins', async () => {
    const sql = await RequestRegisterPageSQL.getApprovalSteps({ REQUEST_REGISTER_VENDOR_ID: 10 })

    expect(sql).toContain('wsm.M_REQUEST_STATUS_ID AS M_REQUEST_STATUS_ID')
    expect(sql).toContain('mrs.STATUS_VALUE AS DESCRIPTION')
    expect(sql).toContain('wsm.STEP_CODE')
    expect(sql).toContain('wsm.ACTOR_TYPE')
    expect(sql).toContain('workflow_step_master wsm')
    expect(sql).toContain('m_request_status mrs')
    expect(sql).not.toContain('ras.M_REQUEST_STATUS_ID')
    expect(sql).not.toContain('ras.STEP_CODE')
    expect(sql).not.toContain('ras.ACTOR_TYPE')
  })

  test('loads assignee display fields for notification recipients', async () => {
    const sql = await RequestRegisterPageSQL.getPeerCcRowsByNormalizedGroup({
      TARGET_GROUP: 'PO_CHECKER_MAIN',
      TARGET_COMPACT: 'POCHECKERMAIN',
    })

    expect(sql).toContain('EMPNAME')
    expect(sql).toContain('EMPEMAIL')
    expect(sql).toContain('GROUP_CODE')
  })

  test('keeps GPR setup cache out of request_vendor_selections', () => {
    const sql = RequestRegisterPageSQL.insertSelection({
      REQUEST_REGISTER_VENDOR_ID: 10,
      GPR_C_APPROVER_EMPCODE: 'S00001',
      GPR_C_PC_PIC_EMPCODE: 'S00002',
      GPR_C_CIRCULAR_JSON: '[]',
      ACTION_REQUIRED_JSON: '{}',
      CREATE_BY: 'S00001',
      UPDATE_BY: 'S00001',
    })

    expect(sql).not.toContain('GPR_C_APPROVER_EMPCODE')
    expect(sql).not.toContain('GPR_C_PC_PIC_EMPCODE')
    expect(sql).not.toContain('GPR_C_CIRCULAR_JSON')
    expect(sql).not.toContain('ACTION_REQUIRED_JSON')
    expect(sql).toContain('DESCRIPTION')
    expect(sql).toContain('INUSE')
  })

  test('keeps normalized selection fields as the source of truth', () => {
    const insertSql = RequestRegisterPageSQL.insertSelection({
      REQUEST_REGISTER_VENDOR_ID: 10,
      BUSINESS_CATEGORY: 'Direct Material',
      CURRENCY: 'THB',
      VENDOR_CODE_SELECTOR: 'V00123',
      CREATE_BY: 'S00001',
      UPDATE_BY: 'S00001',
    })
    const updateSql = RequestRegisterPageSQL.updateSelection({
      REQUEST_VENDOR_SELECTIONS_ID: 20,
      BUSINESS_CATEGORY: 'Direct Material',
      CURRENCY: 'THB',
      VENDOR_CODE_SELECTOR: 'V00123',
      UPDATE_BY: 'S00001',
    })
    const getSql = RequestRegisterPageSQL.getSelection({ REQUEST_REGISTER_VENDOR_ID: 10 })

    expect(insertSql).not.toMatch(/\n\s*, BUSINESS_CATEGORY\s*\n/)
    expect(insertSql).not.toMatch(/\n\s*, CURRENCY\s*\n/)
    expect(insertSql).not.toMatch(/\n\s*, VENDOR_CODE_SELECTOR\s*\n/)
    expect(updateSql).not.toContain('BUSINESS_CATEGORY =')
    expect(updateSql).not.toContain('CURRENCY =')
    expect(updateSql).not.toContain('VENDOR_CODE_SELECTOR =')
    expect(getSql).toContain('bc.BUSINESS_CATEGORY_NAME AS BUSINESS_CATEGORY')
    expect(getSql).toContain('ic.CURRENCY_NAME AS CURRENCY')
    expect(getSql).toContain('rvs.PROPOSED_VENDOR_CODE AS VENDOR_CODE_SELECTOR')
  })

  test('uses request contact bridge instead of request_register_vendor.VENDOR_CONTACTS_ID', async () => {
    const createSql = await RequestRegisterPageSQL.createRequest({
      VENDORS_ID: 1,
      VENDOR_CONTACTS_ID: 10,
      REQUEST_BY_EMPLOYEECODE: 'S00001',
      CREATE_BY: 'S00001',
    })
    const updateSql = await RequestRegisterPageSQL.updateRequest({
      REQUEST_REGISTER_VENDOR_ID: 1,
      VENDOR_CONTACTS_ID: 10,
      UPDATE_BY: 'S00001',
    })
    const contextSql = await RequestRegisterPageSQL.getNotificationVendorContextByRequestId({ REQUEST_REGISTER_VENDOR_ID: 1 })

    expect(createSql).not.toMatch(/INSERT INTO request_register_vendor \([\s\S]*,\s*VENDOR_CONTACTS_ID\b/)
    expect(updateSql).not.toContain('VENDOR_CONTACTS_ID = CASE')
    expect(contextSql).not.toContain('rr.VENDOR_CONTACTS_ID')
    expect(contextSql).toContain('request_register_vendor_contacts rrvc')
    expect(contextSql).toContain('AS VENDOR_CONTACTS_ID')
  })

  test('uses CURRENT_M_REQUEST_STATUS_ID and REQUEST_STATE instead of request_register_vendor.REQUEST_STATUS', async () => {
    const createSql = await RequestRegisterPageSQL.createRequest({
      VENDORS_ID: 1,
      REQUEST_STATUS: 'Sent To PO & SCM (PIC)',
      REQUEST_BY_EMPLOYEECODE: 'S00001',
      CREATE_BY: 'S00001',
    })
    const statusSql = await RequestRegisterPageSQL.getRequestStatusAndAssign({ REQUEST_REGISTER_VENDOR_ID: 1 })

    expect(createSql).not.toMatch(/INSERT INTO request_register_vendor \([\s\S]*,\s*REQUEST_STATUS\b/)
    expect(createSql).toContain('CURRENT_M_REQUEST_STATUS_ID')
    expect(statusSql).not.toContain(' rr.REQUEST_STATUS')
    expect(statusSql).toContain('AS REQUEST_STATUS')
    expect(statusSql).toContain('CURRENT_M_REQUEST_STATUS_ID')
  })

  test('soft-deletes and reactivates normalized GPR child rows', () => {
    const deactivateSql = RequestRegisterPageSQL.deleteGprActionSetup({
      REQUEST_VENDOR_SELECTIONS_ID: 10,
      UPDATE_BY: 'S00001',
    })
    const upsertSql = RequestRegisterPageSQL.insertGprActionSetup({
      REQUEST_VENDOR_SELECTIONS_ID: 10,
      STAGE_CODE: 'engineer',
      RESULT_NOTE: 'checked',
      CREATE_BY: 'S00001',
      UPDATE_BY: 'S00001',
    })

    expect(deactivateSql).toContain('INUSE = 0')
    expect(deactivateSql).not.toContain('DELETE FROM')
    expect(upsertSql).toContain('ON DUPLICATE KEY UPDATE')
    expect(upsertSql).toContain('INUSE = 1')
    expect(upsertSql).not.toContain('undefined')
  })
  test('loads GPR criteria remarks from DESCRIPTION without reject reason column', () => {
    const sql = RequestRegisterPageSQL.getCriteria({ REQUEST_VENDOR_SELECTIONS_ID: 10 })

    expect(sql).toContain('DESCRIPTION AS REMARK')
    expect(sql).not.toContain('REJECT_REASON')
    expect(sql).not.toContain('reject_reason')
  })
})
