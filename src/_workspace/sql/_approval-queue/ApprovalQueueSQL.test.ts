import { describe, expect, test } from 'bun:test'
import { buildRequestStatusFilterClauses, partitionRequestStatusFilters } from '../../services/_approval-queue/ApprovalQueueSearchData'
import { ApprovalQueueSQL } from './ApprovalQueueSQL'

describe('Approval queue request-status filters', () => {
  test('filters master status selections by ID', () => {
    const partitioned = partitionRequestStatusFilters([
      { id: 'CURRENT_M_REQUEST_STATUS_ID', value: 4 },
      { id: 'COMPANY_NAME', value: 'ACME' },
    ])

    expect(partitioned.remaining).toEqual([{ id: 'COMPANY_NAME', value: 'ACME' }])
    expect(partitioned.statusIds).toEqual([4])

    const clauses = buildRequestStatusFilterClauses(partitioned.statusIds)
    expect(clauses[0]).toBe('rr.CURRENT_M_REQUEST_STATUS_ID IN (4)')
  })

  test('rejects legacy text status filters', () => {
    expect(() => partitionRequestStatusFilters([{ id: 'request_status', value: 'Legacy Status' }])).toThrow('Request status filter must use CURRENT_M_REQUEST_STATUS_ID')
  })
})

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

  test('stores the reason when document checker returns a request to PO PIC', async () => {
    const sql = await ApprovalQueueSQL.createApprovalLog({
      REQUEST_REGISTER_VENDOR_ID: 1,
      REQUEST_APPROVAL_STEP_ID: 2,
      ACTION_BY: 'S00001',
      ACTION_TYPE: 'returned_to_pic',
      ACTION_CODE: 'REJECT',
      REMARK: 'Missing document',
    })

    expect(sql).toContain("'returned_to_pic'")
    expect(sql).toContain("'returned_doc_check'")
    expect(sql).toContain("'Missing document'")
  })

  test('guards actions with request, current task, and lock version', async () => {
    const sql = await ApprovalQueueSQL.acquireWorkflowLock({
      REQUEST_REGISTER_VENDOR_ID: 10,
      CURRENT_TASK_ID: 20,
      LOCK_VERSION: 3,
      M_REQUEST_IN_PROGRESS_STATE_ID: 1,
      UPDATE_BY: 'S00001',
    })

    expect(sql).toContain('REQUEST_REGISTER_VENDOR_ID = 10')
    expect(sql).toContain('CURRENT_REQUEST_APPROVAL_STEP_ID = 20')
    expect(sql).toContain('LOCK_VERSION = 3')
    expect(sql).toContain('LOCK_VERSION = LOCK_VERSION + 1')
  })

  test('updates runtime task status by master ID only', async () => {
    const sql = await ApprovalQueueSQL.updateApprovalStep({
      REQUEST_APPROVAL_STEP_ID: 20,
      M_APPROVAL_STEP_STATUS_ID: 3,
      M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID: 2,
      M_APPROVAL_STEP_REJECTED_STATUS_ID: 4,
      M_REQUEST_REJECTED_STATE_ID: 3,
      M_REQUEST_IN_PROGRESS_STATE_ID: 1,
      M_REQUEST_REJECTED_STATUS_ID: 99,
      UPDATE_BY: 'S00001',
    })

    expect(sql).toContain('M_APPROVAL_STEP_STATUS_ID = 3')
    expect(sql).toContain('THEN 99')
    expect(sql).not.toContain('rejected_status.STATUS_CODE')
    expect(sql).toContain('status_master.IS_TERMINAL = 1')
    expect(sql).not.toContain("STATUS_CODE = 'APPROVED'")
    expect(sql).not.toContain('STEP_STATUS = LOWER')
  })

  test('updates the vendor registration status by vendor ID', async () => {
    const sql = await ApprovalQueueSQL.updateVendorFftStatus({
      VENDORS_ID: 166,
      M_VENDOR_STATUS_ID: 2,
    })

    expect(sql).toContain('FFT_STATUS = 2')
    expect(sql).not.toContain("STATUS_CODE = 'REGISTERED'")
    expect(sql).toContain('VENDORS_ID = 166')
  })

  test('accepts zero as the Not Registered vendor status ID', async () => {
    const sql = await ApprovalQueueSQL.updateVendorFftStatus({
      VENDORS_ID: 166,
      M_VENDOR_STATUS_ID: 0,
    })

    expect(sql).toContain('FFT_STATUS = 0')
    expect(sql).toContain('VENDORS_ID = 166')
  })

  test('resolves the next task from the selected workflow transition ID', async () => {
    const sql = await ApprovalQueueSQL.getWorkflowTransitions({
      REQUEST_REGISTER_VENDOR_ID: 10,
      CURRENT_WORKFLOW_STEP_MASTER_ID: 30,
      WORKFLOW_TRANSITION_ID: 77,
      M_REQUEST_IN_PROGRESS_STATE_ID: 1,
    })

    expect(sql).toContain('workflow_transition wt')
    expect(sql).toContain('wt.FROM_WORKFLOW_STEP_MASTER_ID = 30')
    expect(sql).toContain('wt.WORKFLOW_TRANSITION_ID = 77')
    expect(sql).toContain('NEXT_REQUEST_APPROVAL_STEP_ID')
    expect(sql).toContain('wt.M_REQUEST_STATE_ID AS TERMINAL_REQUEST_STATE_ID')
    expect(sql).toContain('AS TERMINAL_IS_TERMINAL')
    expect(sql).not.toContain('wt.TERMINAL_STATE')
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
      QUEUE_WORKFLOW_STEP_MASTER_ID: 30,
      LIMIT: 25,
      OFFSET: 0,
    })

    expect(dataSql).toContain('DOCUMENTS_COUNT')
    expect(dataSql).toContain('MY_APPROVAL_STATUS')
    expect(dataSql).toContain('GPR_C_SETUP_COMPLETED')
    expect(dataSql).toContain('rr.REQUESTER_SECTION')
    expect(dataSql).toContain('YEAR(rr.CREATE_DATE) AS REQUEST_YEAR')
    expect(dataSql).toContain('request_vendor_gpr_c_product_group_checkers')
    expect(dataSql).not.toContain('FROM request_vendor_gpr_c_circular_members cm')
    expect(dataSql).not.toContain('AS contacts')
    expect(dataSql).not.toContain('AS products')
    expect(dataSql).not.toContain('AS documents')
    expect(dataSql).not.toContain('AS approval_steps')
    expect(dataSql).not.toContain('AS approval_logs')
    expect(dataSql).not.toContain('AS gpr_criteria')
  })

  test('resolves semantic selection aliases in request details', async () => {
    const sql = await ApprovalQueueSQL.getById({
      REQUEST_REGISTER_VENDOR_ID: 10,
      EDITABLE_WORKFLOW_STEP_MASTER_IDS: [3, 5],
      M_APPROVAL_STEP_IN_PROGRESS_STATUS_ID: 2,
    })

    expect(sql).toContain('rvs.GPR_B_FILE_PATH AS GPR_B_FILE_PATH')
    expect(sql).toContain('rvs.GPR_B_FILE_NAME AS GPR_B_FILE_NAME')
    expect(sql).toContain('AS IS_SELECTION_SHEET_EDITABLE')
    expect(sql).toContain('current_selection_step.WORKFLOW_STEP_MASTER_ID IN')
    expect(sql).toContain('3, 5')
    expect(sql).toContain('current_selection_step.M_APPROVAL_STEP_STATUS_ID = 2')
    expect(sql).not.toContain('rr0.')
    expect(sql).not.toContain('dataItem.')
  })
})
