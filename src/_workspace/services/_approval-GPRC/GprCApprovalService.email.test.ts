import { describe, expect, mock, test } from 'bun:test'

// Verifies the GPR C sub-flow queues a notification on Approve (hand-back to the main workflow's next
// approver) and on Reject (rejection email to the PIC). DB + mail transport are mocked — nothing real
// is queried or sent. Mocks + import are per-test so bun's global mock.module can't leak across files.

const flushPostCommit = () => new Promise((resolve) => setTimeout(resolve, 30))

async function setup() {
  const spies = {
    nextStep: mock(async () => undefined),
    rejected: mock(async () => undefined),
  }

  const search = mock(async (query: string) => {
    if (query.includes('FROM REQUEST_VENDOR_GPR_C_FLOWS')) {
      return [{ REQUEST_VENDOR_GPR_C_FLOWS_ID: 11, REQUEST_REGISTER_VENDOR_ID: 101 }]
    }
    // Current in-progress GPR C step (the last one, so approving finishes the sub-flow).
    if (query.includes('REQUEST_VENDOR_GPR_C_STEPS s') && query.includes("status_master.STATUS_CODE = 'IN_PROGRESS'")) {
      return [
        {
          REQUEST_VENDOR_GPR_C_STEPS_ID: 66,
          REQUEST_VENDOR_GPR_C_FLOWS_ID: 11,
          STEP_ORDER: 6,
          STEP_CODE: 'PM_MANAGER_APPROVER',
          APPROVER_EMPCODE: 'S00001',
          M_APPROVAL_STEP_STATUS_ID: 2,
          STEP_STATUS: 'in_progress',
        },
      ]
    }
    if (query.includes('REQUEST_VENDOR_GPR_C_STEPS s') && query.includes('ORDER BY s.STEP_ORDER ASC')) {
      return [
        {
          REQUEST_VENDOR_GPR_C_STEPS_ID: 66,
          REQUEST_VENDOR_GPR_C_FLOWS_ID: 11,
          STEP_ORDER: 6,
          STEP_CODE: 'PM_MANAGER_APPROVER',
          APPROVER_EMPCODE: 'S00001',
          M_APPROVAL_STEP_STATUS_ID: 2,
          STEP_STATUS: 'in_progress',
        },
      ]
    }
    // Main workflow steps: in-progress Issue GPR C + pending Doc Check.
    if (query.includes('request_approval_step ras')) {
      return [
        {
          REQUEST_APPROVAL_STEP_ID: 201,
          REQUEST_REGISTER_VENDOR_ID: 101,
          WORKFLOW_STEP_MASTER_ID: 302,
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
          WORKFLOW_STEP_MASTER_ID: 303,
          M_APPROVAL_STEP_STATUS_ID: 1,
          STEP_ORDER: 5,
          STEP_STATUS: 'pending',
          DESCRIPTION: 'PO & SCM Check All Document',
          STEP_CODE: 'DOC_CHECK',
          APPROVER_EMPCODE: 'S00002',
        },
      ]
    }
    if (query.includes('INNER JOIN workflow_transition wt')) {
      const isReject = query.includes('wt.M_REQUEST_STATE_ID = 3')
      return [
        {
          WORKFLOW_TRANSITION_ID: isReject ? 2 : 1,
          ACTION_CODE: isReject ? 'REJECT' : 'APPROVE',
          TO_WORKFLOW_STEP_MASTER_ID: isReject ? null : 303,
          TERMINAL_REQUEST_STATE_ID: isReject ? 3 : null,
          TERMINAL_STATE: isReject ? 'rejected' : null,
          TERMINAL_IS_TERMINAL: isReject ? 1 : 0,
          NEXT_REQUEST_APPROVAL_STEP_ID: isReject ? null : 202,
          NEXT_STEP_ORDER: isReject ? null : 5,
          NEXT_APPROVER_EMPCODE: isReject ? null : 'S00002',
          NEXT_STEP_STATUS_ID: isReject ? null : 1,
          NEXT_STEP_STATUS: isReject ? null : 'pending',
          NEXT_STEP_CODE: isReject ? null : 'DOC_CHECK',
          NEXT_STATUS_VALUE: isReject ? null : 'PO & SCM Check All Document',
        },
      ]
    }
    if (query.includes('VENDOR_CODE_SELECTOR') || query.includes('GPR_43_ACCEPTANCE_STATUS')) {
      return [
        {
          VENDORS_ID: 55,
          ASSIGN_TO: 'S00007',
          VENDOR_REGION: 'Local',
          REQUEST_NUMBER: 'Selection-26-N101',
          CURRENT_REQUEST_APPROVAL_STEP_ID: 201,
          M_REQUEST_STATE_ID: 1,
          LOCK_VERSION: 0,
        },
      ]
    }
    return []
  }) as any

  mock.module('@businessData/dbExecute', () => ({
    MySQLExecute: {
      search,
      executeList: mock(async () => []),
      executeGuardedList: mock(async () => []),
      execute: mock(async () => ({ insertId: 1 })),
      searchList: mock(async () => []),
    },
  }))

  // Export the full superset so this mock never breaks ApprovalQueueService's import when bun's
  // global mock.module registry is shared across test files.
  mock.module('../_request-register/RegisterRequestNotificationHelper', () => ({
    sendMail_ToApprover_NextStep: spies.nextStep,
    sendMail_ToPic_RequestRejected: spies.rejected,
    sendMail_ToPic_RecheckByApprover: mock(async () => undefined),
    sendMail_ToPic_RecheckByPoMgr: mock(async () => undefined),
    sendMail_ToUser_ActionRequired: mock(async () => undefined),
    sendMail_ToRequester_GprCApproved: mock(async () => undefined),
    sendMail_ToRequester_RegistrationCompleted: mock(async () => undefined),
    sendMail_ToRequester_RegistrationIncomplete: mock(async () => undefined),
    sendMail_NegotiationStageDispatch: mock(async () => undefined),
  }))

  mock.module('../_status-master/StatusIdentityService', () => {
    const identity = {
      workflowStep: {
        requestSubmitted: 297,
        picReview: 298,
        poPicInProgress: 299,
        vendorDisagreed: 300,
        issueGprB: 301,
        issueGprC: 302,
        docCheck: 303,
        poMgrApproval: 304,
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

  mock.module('@src/config/sendEmail', () => ({ default: mock(async () => ({ success: true })) }))

  const { GprCApprovalService } = await import('./GprCApprovalService')
  return { GprCApprovalService, spies }
}

describe('GprCApprovalService email notifications', () => {
  test('approving the final GPR C step queues the main-workflow next-approver email', async () => {
    const { GprCApprovalService, spies } = await setup()

    const result = await GprCApprovalService.approveStep({
      REQUEST_REGISTER_VENDOR_ID: 101,
      ACTION_BY: 'S00001',
      UPDATE_BY: 'S00001',
    })

    expect(result.Status).toBe(true)
    await flushPostCommit()

    expect(spies.nextStep).toHaveBeenCalledTimes(1)
    expect(spies.rejected).not.toHaveBeenCalled()
  })

  test('rejecting a GPR C step queues the rejection email to the PIC', async () => {
    const { GprCApprovalService, spies } = await setup()

    const result = await GprCApprovalService.rejectStep({
      REQUEST_REGISTER_VENDOR_ID: 101,
      ACTION_BY: 'S00001',
      UPDATE_BY: 'S00001',
      REMARK: 'GPR C not acceptable',
    })

    expect(result.Status).toBe(true)
    await flushPostCommit()

    expect(spies.rejected).toHaveBeenCalledTimes(1)
    expect(spies.nextStep).not.toHaveBeenCalled()
  })
})
