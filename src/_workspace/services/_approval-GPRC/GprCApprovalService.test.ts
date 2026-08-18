import { describe, expect, mock, test } from 'bun:test'
import { email_ToGprCApprover_FirstStep } from '@src/config/mailTemplate'
import { buildGprCBaseMailData } from './GprCApprovalMailData'

describe('GprCApprovalService mail data', () => {
  test('maps uppercase DB summary columns into GPR C approval email variables', () => {
    const mailData = buildGprCBaseMailData(
      {
        REQUEST_NUMBER: 'Selection-26-N151',
        CREATE_DATE: '2026-07-03T00:00:00.000Z',
        COMPANY_NAME: 'Vendor 134 Co., Ltd.',
        ADDRESS: '123 Test Road',
        CONTACT_NAME: 'Vendor Contact',
        vendor_email: 'sale134@vendor134.com',
        TEL_PHONE: '02-134-0000',
        SUPPORTPRODUCT_PROCESS: 'General Purchase',
        PURCHASE_FREQUENCY: '12',
      },
      151,
      'Requester Approver'
    )

    expect(mailData.requestNumber).toBe('Selection-26-N151')
    expect(mailData.recipientName).toBe('Requester Approver')
    expect(mailData.vendorName).toBe('Vendor 134 Co., Ltd.')
    expect(mailData.address).toBe('123 Test Road')
    expect(mailData.contactPic).toBe('Vendor Contact')
    expect(mailData.email).toBe('sale134@vendor134.com')
    expect(mailData.tel).toBe('02-134-0000')
    expect(mailData.supportProduct).toBe('General Purchase')
    expect(mailData.purchaseFrequency).toBe('12')
  })
  test('renders GPR C approval email with mapped vendor details', () => {
    const mailData = buildGprCBaseMailData(
      {
        REQUEST_NUMBER: 'Selection-26-N151',
        COMPANY_NAME: 'Vendor 134 Co., Ltd.',
        ADDRESS: '123 Test Road',
        CONTACT_NAME: 'Vendor Contact',
        vendor_email: 'sale134@vendor134.com',
        TEL_PHONE: '02-134-0000',
        SUPPORTPRODUCT_PROCESS: 'General Purchase',
        PURCHASE_FREQUENCY: '12',
      },
      151,
      'Requester Approver'
    )

    const html = email_ToGprCApprover_FirstStep({
      ...mailData,
      userName: 'Requester Approver',
      picName: 'PO PIC',
    })

    expect(html).toContain('Vendor 134 Co., Ltd.')
    expect(html).toContain('123 Test Road')
    expect(html).toContain('Vendor Contact')
    expect(html).toContain('02-134-0000')
    expect(html).toContain('General Purchase')
    expect(html).not.toContain('<td valign="top" style="border-bottom: 1px solid #c9c9c9; padding: 7px 0 7px 8px; color: #111111; font-size: 12px; line-height: 1.45;">N/A</td>')
  })
})
describe('GprCApprovalService approval flow transitions', () => {
  test('moves Issue GPR C to the configured next step when Document Checker is skipped', async () => {
    const executedSqlLists: string[][] = []
    let flowStatusId = 3
    let gprStepStatusId = 2
    let gprStepActionType = ''
    let gprStepCode = 'PM_MANAGER_APPROVER'
    mock.module('../_status-master/StatusIdentityService', () => {
      const identity = {
        workflowStep: {
          requestSubmitted: 297,
          picReview: 298,
          poPicInProgress: 299,
          vendorDisagreed: 300,
          issueGprB: 304,
          issueGprC: 301,
          docCheck: 302,
          poMgrApproval: 303,
          poGmApproval: 305,
          mdApproval: 306,
          accountRegistered: 307,
        },
        approvalStep: { pending: 1, inProgress: 2, approved: 3, rejected: 4, skipped: 5 },
        requestState: { inProgress: 1, completed: 2, rejected: 3, cancelled: 4 },
        requestStatus: { rejected: 99 },
        vendor: { notRegistered: 1, registered: 2, inProgress: 3, cannotRegister: 4 },
        gprCFlow: { draft: 1, requesterSetup: 2, inProgress: 3, approved: 4, rejected: 5, recheckRequired: 6 },
        actionResult: { pending: 1, incomplete: 2, completed: 3 },
      }

      return {
        getWorkflowStepIdentity: mock(async () => identity.workflowStep),
        getWorkflowStepTypeIdentity: mock(async () => identity.workflowStep),
        getApprovalStepStatusIdentity: mock(async () => identity.approvalStep),
        getRequestStateIdentity: mock(async () => identity.requestState),
        getRequestStatusIdentity: mock(async () => identity.requestStatus),
        getVendorStatusIdentity: mock(async () => identity.vendor),
        getGprCFlowStatusIdentity: mock(async () => identity.gprCFlow),
        getActionResultStatusIdentity: mock(async () => identity.actionResult),
      }
    })
    const search = mock(async (query: string) => {
      if (query.includes('FROM REQUEST_VENDOR_GPR_C_FLOWS')) {
        return [
          {
            REQUEST_VENDOR_GPR_C_FLOWS_ID: 11,
            REQUEST_REGISTER_VENDOR_ID: 101,
            M_GPR_C_FLOW_STATUS_ID: flowStatusId,
            CURRENT_STEP_CODE: gprStepCode,
          },
        ]
      }
      if (query.includes('FROM REQUEST_VENDOR_GPR_C_STEPS s') && query.includes("status_master.STATUS_CODE = 'IN_PROGRESS'")) {
        if (gprStepStatusId !== 2) return []
        return [
          {
            REQUEST_VENDOR_GPR_C_STEPS_ID: 66,
            REQUEST_VENDOR_GPR_C_FLOWS_ID: 11,
            STEP_ORDER: 6,
            STEP_CODE: gprStepCode,
            APPROVER_EMPCODE: 'S00001',
            APPROVER_NAME: 'PM Manager',
            APPROVER_EMAIL: 'pm.manager@example.com',
            M_APPROVAL_STEP_STATUS_ID: gprStepStatusId,
            ACTION_TYPE: gprStepActionType,
            STEP_STATUS: 'in_progress',
          },
        ]
      }
      if (query.includes('FROM REQUEST_VENDOR_GPR_C_STEPS s') && query.includes('ORDER BY s.STEP_ORDER ASC')) {
        return [
          {
            REQUEST_VENDOR_GPR_C_STEPS_ID: 66,
            REQUEST_VENDOR_GPR_C_FLOWS_ID: 11,
            STEP_ORDER: 6,
            STEP_CODE: gprStepCode,
            APPROVER_EMPCODE: 'S00001',
            APPROVER_NAME: 'PM Manager',
            APPROVER_EMAIL: 'pm.manager@example.com',
            M_APPROVAL_STEP_STATUS_ID: gprStepStatusId,
            ACTION_TYPE: gprStepActionType,
            STEP_STATUS: gprStepStatusId === 2 ? 'in_progress' : 'pending',
          },
        ]
      }
      if (query.includes('FROM') && query.includes('request_approval_step ras')) {
        return [
          {
            REQUEST_APPROVAL_STEP_ID: 200,
            REQUEST_REGISTER_VENDOR_ID: 101,
            WORKFLOW_STEP_MASTER_ID: 299,
            M_APPROVAL_STEP_STATUS_ID: 3,
            STEP_ORDER: 2,
            STEP_STATUS: 'approved',
            DESCRIPTION: 'PO PIC In Progress',
            STEP_CODE: 'PO_PIC_IN_PROGRESS',
            APPROVER_EMPCODE: 'S00007',
          },
          {
            REQUEST_APPROVAL_STEP_ID: 199,
            REQUEST_REGISTER_VENDOR_ID: 101,
            WORKFLOW_STEP_MASTER_ID: 304,
            M_APPROVAL_STEP_STATUS_ID: 3,
            STEP_ORDER: 3,
            STEP_STATUS: 'approved',
            DESCRIPTION: 'Issue GPR B',
            STEP_CODE: 'ISSUE_GPR_B',
            APPROVER_EMPCODE: 'S00007',
          },
          {
            REQUEST_APPROVAL_STEP_ID: 201,
            REQUEST_REGISTER_VENDOR_ID: 101,
            WORKFLOW_STEP_MASTER_ID: 301,
            M_APPROVAL_STEP_STATUS_ID: 2,
            STEP_ORDER: 4,
            STEP_STATUS: 'in_progress',
            DESCRIPTION: 'Issue GPR C',
            STEP_CODE: 'ISSUE_GPR_C',
            APPROVER_EMPCODE: 'S00001',
          },
          {
            REQUEST_APPROVAL_STEP_ID: 202,
            REQUEST_REGISTER_VENDOR_ID: 101,
            WORKFLOW_STEP_MASTER_ID: 302,
            M_APPROVAL_STEP_STATUS_ID: 1,
            STEP_ORDER: 5,
            STEP_STATUS: 'pending',
            DESCRIPTION: 'PO & SCM Check All Document',
            STEP_CODE: 'DOC_CHECK',
            APPROVER_EMPCODE: 'S00002',
          },
          {
            REQUEST_APPROVAL_STEP_ID: 203,
            REQUEST_REGISTER_VENDOR_ID: 101,
            WORKFLOW_STEP_MASTER_ID: 303,
            M_APPROVAL_STEP_STATUS_ID: 1,
            STEP_ORDER: 6,
            STEP_STATUS: 'pending',
            DESCRIPTION: 'PO MGR Approve',
            STEP_CODE: 'PO_MGR_APPROVAL',
            APPROVER_EMPCODE: 'S00003',
          },
        ]
      }
      if (query.includes('rr.CURRENT_REQUEST_APPROVAL_STEP_ID') && query.includes('rr.LOCK_VERSION')) {
        return [
          {
            VENDORS_ID: 55,
            M_REQUEST_STATE_ID: 1,
            WORKFLOW_DEFINITION_ID: 1,
            CURRENT_REQUEST_APPROVAL_STEP_ID: 201,
            LOCK_VERSION: 0,
            ASSIGN_TO: 'S00007',
          },
        ]
      }
      if (query.includes('workflow_transition wt')) {
        const isRecheck = query.includes("wt.ACTION_CODE = 'RECHECK'")
        return [
          {
            WORKFLOW_TRANSITION_ID: isRecheck ? 2 : 1,
            ACTION_CODE: isRecheck ? 'RECHECK' : 'APPROVE',
            TO_WORKFLOW_STEP_MASTER_ID: isRecheck ? 299 : 303,
            TERMINAL_REQUEST_STATE_ID: null,
            TERMINAL_STATE: null,
            CONDITION_KEY: isRecheck ? 'RECHECK_TO_PIC' : null,
            NEXT_REQUEST_APPROVAL_STEP_ID: isRecheck ? 200 : 203,
            NEXT_STEP_ORDER: isRecheck ? 2 : 6,
            NEXT_APPROVER_EMPCODE: isRecheck ? 'S00007' : 'S00003',
            NEXT_STEP_STATUS: isRecheck ? 'approved' : 'pending',
            NEXT_STEP_STATUS_ID: isRecheck ? 3 : 1,
            NEXT_STEP_CODE: isRecheck ? 'PO_PIC_IN_PROGRESS' : 'PO_MGR_APPROVAL',
            NEXT_ACTOR_TYPE: isRecheck ? 'PIC' : 'APPROVER',
            NEXT_STATUS_VALUE: isRecheck ? 'PO PIC In Progress' : 'PO MGR Approve',
          },
        ]
      }
      return []
    }) as any

    const executeList = mock(async (sqlList: string[]) => {
      executedSqlLists.push(sqlList)
      const sql = sqlList.join('\n')
      if (sql.includes('M_GPR_C_FLOW_STATUS_ID = 3')) flowStatusId = 3
      if (sql.includes('M_APPROVAL_STEP_STATUS_ID = 2')) gprStepStatusId = 2
      return []
    })
    const executeGuardedList = mock(async (_guardSql: string, sqlList: string[]) => {
      executedSqlLists.push(sqlList)
      const sql = sqlList.join('\n')
      if (sql.includes("ACTION_TYPE = 'RECHECK'")) {
        flowStatusId = 6
        gprStepStatusId = 1
        gprStepActionType = 'RECHECK'
      }
      return []
    })

    mock.module('@businessData/dbExecute', () => ({
      MySQLExecute: {
        search,
        executeList,
        executeGuardedList,
        execute: mock(async () => ({ insertId: 1 })),
        searchList: mock(async () => []),
      },
    }))
    mock.module('../_request-register/RegisterRequestNotificationHelper', () => ({
      sendMail_ToApprover_NextStep: mock(async () => undefined),
      sendMail_ToPic_RequestRejected: mock(async () => undefined),
      sendMail_ToPic_RecheckByApprover: mock(async () => undefined),
      sendMail_ToPic_RecheckByPoMgr: mock(async () => undefined),
      // Full superset so this mock never breaks ApprovalQueueService's import under bun's shared
      // global mock.module registry when the whole suite runs together.
      sendMail_ToUser_ActionRequired: mock(async () => undefined),
      sendMail_ToRequester_GprCApproved: mock(async () => undefined),
      sendMail_ToRequester_RegistrationCompleted: mock(async () => undefined),
      sendMail_ToRequester_RegistrationIncomplete: mock(async () => undefined),
      sendMail_NegotiationStageDispatch: mock(async () => undefined),
    }))
    mock.module('@src/config/sendEmail', () => ({
      default: mock(async () => ({ messageId: 'test-message' })),
    }))

    const { GprCApprovalService } = await import('./GprCApprovalService')
    const result = await GprCApprovalService.approveStep({
      REQUEST_REGISTER_VENDOR_ID: 101,
      ACTION_BY: 'S00001',
      UPDATE_BY: 'S00001',
    })

    expect(result.Status).toBe(true)
    expect(executedSqlLists.length).toBeGreaterThanOrEqual(2)
    const mainWorkflowSql = executedSqlLists[1].join('\n')

    expect(mainWorkflowSql).toContain('REQUEST_APPROVAL_STEP_ID = 201')
    expect(mainWorkflowSql).toContain('M_APPROVAL_STEP_STATUS_ID = 3')
    expect(mainWorkflowSql).not.toContain("STEP_STATUS = LOWER('approved')")
    expect(mainWorkflowSql).toContain('REQUEST_APPROVAL_STEP_ID = 203')
    expect(mainWorkflowSql).toContain('M_APPROVAL_STEP_STATUS_ID = 2')
    expect(mainWorkflowSql).not.toContain("STEP_STATUS = LOWER('in_progress')")
    expect(mainWorkflowSql).not.toContain('REQUEST_APPROVAL_STEP_ID = 202')
    expect(mainWorkflowSql).not.toContain("request_state_master.STATE_CODE = 'COMPLETED'")

    executedSqlLists.length = 0
    const deniedRecheckResult = await GprCApprovalService.recheckStep({
      REQUEST_REGISTER_VENDOR_ID: 101,
      ACTION_BY: 'S00001',
      UPDATE_BY: 'S00001',
      REMARK: 'This step must not return to PO PIC',
    })

    expect(deniedRecheckResult.Status).toBe(false)
    expect(deniedRecheckResult.Message).toBe('Re-check with PO PIC is available only for Requester Approver')
    expect(executedSqlLists).toHaveLength(0)

    gprStepCode = 'REQUESTER_APPROVER'
    const recheckResult = await GprCApprovalService.recheckStep({
      REQUEST_REGISTER_VENDOR_ID: 101,
      ACTION_BY: 'S00001',
      UPDATE_BY: 'S00001',
      REMARK: 'Please revise GPR B and send it back to me',
    })

    expect(recheckResult.Status).toBe(true)
    expect(executedSqlLists).toHaveLength(1)
    const recheckSql = executedSqlLists[0].join('\n')
    expect(recheckSql).toContain('REQUEST_VENDOR_GPR_C_STEPS_ID = 66')
    expect(recheckSql).toContain("ACTION_TYPE = 'RECHECK'")
    expect(recheckSql).toContain('M_GPR_C_FLOW_STATUS_ID = 6')
    expect(recheckSql).toContain('REQUEST_APPROVAL_STEP_ID = 199')
    expect(recheckSql).toContain('REQUEST_APPROVAL_STEP_ID = 201')
    expect(recheckSql).toMatch(/,\s*'recheck'\s*,\s*'RECHECK'/)
    expect(recheckSql).toContain('RECHECK_REASON')
    expect(recheckSql).toContain('REQUEST_APPROVAL_STEP_ID = 200')
    expect(recheckSql).toContain('M_APPROVAL_STEP_STATUS_ID = 2')
    expect(flowStatusId).toBe(6)
    expect(gprStepStatusId).toBe(1)

    executedSqlLists.length = 0
    const resumeResult = await GprCApprovalService.createOrGetFlow({
      REQUEST_REGISTER_VENDOR_ID: 101,
      UPDATE_BY: 'S00007',
    })

    expect(resumeResult.Status).toBe(true)
    expect(flowStatusId).toBe(3)
    expect(gprStepStatusId).toBe(2)
    const resumeSql = executedSqlLists[0].join('\n')
    expect(resumeSql).toContain('REQUEST_VENDOR_GPR_C_STEPS_ID = 66')
    expect(resumeSql).toContain('M_GPR_C_FLOW_STATUS_ID = 3')
  })
})
