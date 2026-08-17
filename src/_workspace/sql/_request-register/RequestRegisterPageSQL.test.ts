import { describe, expect, test } from 'bun:test'
import { RequestRegisterPageSQL } from './RequestRegisterPageSQL'

describe('RequestRegisterPageSQL approval step identity', () => {
  test('stores workflow step id instead of duplicating master step fields', async () => {
    const sql = await RequestRegisterPageSQL.createApprovalStep({
      REQUEST_REGISTER_VENDOR_ID: 10,
      WORKFLOW_STEP_MASTER_ID: 15,
      M_REQUEST_STATUS_ID: 4,
      STEP_ORDER: 3,
      APPROVER_EMPCODE: 'S00001',
      M_APPROVAL_STEP_STATUS_ID: 1,
      M_APPROVAL_STEP_PENDING_STATUS_ID: 1,
      M_APPROVAL_STEP_TERMINAL_STATUS_IDS: [3, 4, 5],
      DESCRIPTION: 'Document review',
      STEP_CODE: 'DOC_CHECK',
      ACTOR_TYPE: 'APPROVER',
      GROUP_CODE: 'PO_CHECKER_MAIN',
      ASSIGNMENT_MODE: 'AUTO',
      CREATE_BY: 'S00001',
    })

    expect(sql).toContain('WORKFLOW_STEP_MASTER_ID')
    expect(sql).toContain('M_APPROVAL_STEP_STATUS_ID')
    expect(sql).toContain('APPROVAL_GROUP_ID')
    expect(sql).toContain('APPROVAL_GROUP_MEMBER_ID')
    expect(sql).toContain('15')
    expect(sql).toContain('PO_CHECKER_MAIN')
    expect(sql).not.toContain('M_REQUEST_STATUS_ID')
    expect(sql).not.toContain('STEP_CODE')
    expect(sql).not.toContain('ACTOR_TYPE')
    expect(sql).not.toContain('DESCRIPTION')
    expect(sql).not.toMatch(/,\s*STEP_STATUS\s*\n/)
    expect(sql).not.toMatch(/,\s*GROUP_CODE\s*\n/)
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
    expect(sql).toContain('m_approval_step_status task_status')
    expect(sql).toContain('approval_group task_group')
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

  test('resolves and stores the requester section snapshot', async () => {
    const memberSql = await RequestRegisterPageSQL.getMemberByEmpCode({ EMPCODE: 'S00001' })
    const createSql = await RequestRegisterPageSQL.createRequest({
      VENDORS_ID: 1,
      REQUEST_BY_EMPLOYEECODE: 'S00001',
      REQUESTER_SECTION: 'SOFTWARE',
      M_REQUEST_IN_PROGRESS_STATE_ID: 1,
      CREATE_BY: 'S00001',
    })

    expect(memberSql).toContain('TRIM(m.EMPSECTION) AS REQUESTER_SECTION')
    expect(createSql).toContain('REQUESTER_SECTION')
    expect(createSql).toContain("'SOFTWARE'")
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

  test('updates only Account vendor fields behind the current assigned Account step guard', () => {
    const sql = RequestRegisterPageSQL.updateAccountVendorCode({
      REQUEST_REGISTER_VENDOR_ID: 10,
      WORKFLOW_STEP_MASTER_ID: 12,
      M_APPROVAL_STEP_STATUS_ID: 2,
      VENDOR_CODE: '20031ABC01',
      UPDATE_BY: 'S00823',
    })

    expect(sql).toContain('ras.WORKFLOW_STEP_MASTER_ID = 12')
    expect(sql).toContain('ras.M_APPROVAL_STEP_STATUS_ID = 2')
    expect(sql).toContain('S00823')
    expect(sql).toContain('20031ABC01')
    expect(sql).toContain('rvs.COMPLETION_DATE = CURDATE()')
    expect(sql).not.toContain('BUSINESS_CATEGORY_ID =')
    expect(sql).not.toContain('GPR_43_ACCEPTANCE_STATUS =')
  })

  test('uses request contact bridge instead of request_register_vendor.VENDOR_CONTACTS_ID', async () => {
    const createSql = await RequestRegisterPageSQL.createRequest({
      VENDORS_ID: 1,
      VENDOR_CONTACTS_ID: 10,
      REQUEST_BY_EMPLOYEECODE: 'S00001',
      M_REQUEST_IN_PROGRESS_STATE_ID: 1,
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

  test('uses request status and lifecycle master IDs instead of text columns', async () => {
    const createSql = await RequestRegisterPageSQL.createRequest({
      VENDORS_ID: 1,
      REQUEST_STATUS: 'Sent To PO & SCM (PIC)',
      REQUEST_BY_EMPLOYEECODE: 'S00001',
      M_REQUEST_IN_PROGRESS_STATE_ID: 1,
      CREATE_BY: 'S00001',
    })
    const statusSql = await RequestRegisterPageSQL.getRequestStatusAndAssign({ REQUEST_REGISTER_VENDOR_ID: 1 })

    expect(createSql).not.toMatch(/INSERT INTO request_register_vendor \([\s\S]*,\s*REQUEST_STATUS\b/)
    expect(createSql).toContain('CURRENT_M_REQUEST_STATUS_ID')
    expect(createSql).toContain('M_REQUEST_STATE_ID')
    expect(statusSql).not.toContain(' rr.REQUEST_STATUS')
    expect(statusSql).toContain('AS REQUEST_STATUS')
    expect(statusSql).toContain('CURRENT_M_REQUEST_STATUS_ID')
    expect(statusSql).toContain('M_REQUEST_STATE_ID')
  })

  test('counts only older active requests as requests ahead', async () => {
    const sql = await RequestRegisterPageSQL.getRequestsAheadCount({
      REQUEST_REGISTER_VENDOR_ID: 25,
      M_REQUEST_IN_PROGRESS_STATE_ID: 1,
    })

    expect(sql).toContain('COUNT(*) AS REQUESTS_AHEAD')
    expect(sql).toContain('rr.REQUEST_REGISTER_VENDOR_ID < 25')
    expect(sql).toContain('rr.INUSE = 1')
    expect(sql).toContain('rr.M_REQUEST_STATE_ID = 1')
    expect(sql).not.toContain('rr.REQUEST_STATE')
  })

  test('checks Selection Sheet edit access by current workflow IDs', async () => {
    const sql = await RequestRegisterPageSQL.getSelectionSheetEditAccess({
      REQUEST_REGISTER_VENDOR_ID: 10,
      EDITABLE_WORKFLOW_STEP_MASTER_IDS: [3, 5],
      M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID: 2,
    })

    expect(sql).toContain('current_selection_step.REQUEST_APPROVAL_STEP_ID = rr.CURRENT_REQUEST_APPROVAL_STEP_ID')
    expect(sql).toContain('current_selection_step.WORKFLOW_STEP_MASTER_ID IN')
    expect(sql).toContain('3, 5')
    expect(sql).toContain('current_selection_step.M_APPROVAL_STEP_STATUS_ID = 2')
    expect(sql).toContain('IS_SELECTION_SHEET_EDITABLE')
    expect(sql).not.toContain('dataItem.')
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

  test('stores Product Checkers as normalized selection child rows', () => {
    const readSql = RequestRegisterPageSQL.getGprProductCheckers({ REQUEST_VENDOR_SELECTIONS_ID: 10 })
    const sectionLookupSql = RequestRegisterPageSQL.getSectionByName({ SECTION_NAME: "QA's Section" })
    const deactivateSql = RequestRegisterPageSQL.deactivateGprProductCheckers({
      REQUEST_VENDOR_SELECTIONS_ID: 10,
      UPDATE_BY: 'S00001',
    })
    const insertSql = RequestRegisterPageSQL.insertGprProductChecker({
      REQUEST_VENDOR_SELECTIONS_ID: 10,
      ITEM_ORDER: 1,
      PRODUCT_MAIN_ID: 3,
      PRODUCT_MAIN_NAME: "Engineer's Parts (EP)",
      CHECKER_EMPCODE: 'S00002',
      CHECKER_NAME: "O'Brien",
      CHECKER_EMAIL: 'checker@example.com',
      CREATE_BY: 'S00001',
      UPDATE_BY: 'S00001',
    })
    const sectionInsertSql = RequestRegisterPageSQL.insertGprProductChecker({
      REQUEST_VENDOR_SELECTIONS_ID: 10,
      ITEM_ORDER: 2,
      PRODUCT_MAIN_ID: null,
      PRODUCT_MAIN_NAME: '',
      SECTION_NAME: "QA's Section",
      CHECKER_EMPCODE: 'S00003',
      CHECKER_NAME: 'Section Checker',
      CHECKER_EMAIL: 'section.checker@example.com',
      CREATE_BY: 'S00001',
      UPDATE_BY: 'S00001',
    })

    expect(readSql).toContain('request_vendor_gpr_c_product_group_checkers')
    expect(readSql).toContain('PRODUCT_MAIN_ID')
    expect(readSql).toContain('SECTION_NAME')
    expect(readSql).not.toContain('master_product_groups')
    expect(readSql).toContain('pgc.INUSE = 1')
    expect(deactivateSql).toContain('INUSE = 0')
    expect(deactivateSql).not.toContain('DELETE FROM')
    expect(insertSql).toContain('PRODUCT_MAIN_ID')
    expect(insertSql).toContain("Engineer''s Parts (EP)")
    expect(insertSql).toContain("O''Brien")
    expect(sectionLookupSql).toContain('set_section_fed')
    expect(sectionLookupSql).toContain("QA''s Section")
    expect(sectionInsertSql).toContain("QA''s Section")
    expect(sectionInsertSql).toContain('NULL')
    expect(sectionInsertSql).toContain('GPR C checker assignment by Product Main or Section')
    expect(insertSql).not.toContain('FOREIGN KEY')
  })

  test('loads GPR criteria remarks from DESCRIPTION without reject reason column', () => {
    const sql = RequestRegisterPageSQL.getCriteria({ REQUEST_VENDOR_SELECTIONS_ID: 10 })

    expect(sql).toContain('DESCRIPTION AS REMARK')
    expect(sql).toContain('vendor_selection_criteria_files')
    expect(sql).toContain('CRITERIA_FILE_ID')
    expect(sql).toContain('FILE_ORDER')
    expect(sql).not.toContain('REJECT_REASON')
    expect(sql).not.toContain('reject_reason')
  })

  test('keeps criteria attachment metadata out of the criteria row', () => {
    const sql = RequestRegisterPageSQL.insertCriteria({
      REQUEST_VENDOR_SELECTIONS_ID: 10,
      NO: '4.1',
      CRITERIA: 'Need',
      REMARK: 'checked',
      CREATE_BY: 'S00001',
      UPDATE_BY: 'S00001',
    })

    expect(sql).not.toContain('UPLOADED_FILE_PATH')
    expect(sql).not.toContain('UPLOADED_FILE_NAME')
    expect(sql).not.toContain('undefined')
  })
})
