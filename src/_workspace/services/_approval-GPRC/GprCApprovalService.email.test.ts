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
    if (query.includes('REQUEST_VENDOR_GPR_C_STEPS s') && query.includes("s.STEP_STATUS = 'in_progress'")) {
      return [{
        REQUEST_VENDOR_GPR_C_STEPS_ID: 66,
        REQUEST_VENDOR_GPR_C_FLOWS_ID: 11,
        STEP_ORDER: 6,
        STEP_CODE: 'PM_MANAGER_APPROVER',
        APPROVER_EMPCODE: 'S00001',
        STEP_STATUS: 'in_progress',
      }]
    }
    if (query.includes('REQUEST_VENDOR_GPR_C_STEPS s') && query.includes('ORDER BY s.STEP_ORDER ASC')) {
      return [{
        REQUEST_VENDOR_GPR_C_STEPS_ID: 66,
        REQUEST_VENDOR_GPR_C_FLOWS_ID: 11,
        STEP_ORDER: 6,
        STEP_CODE: 'PM_MANAGER_APPROVER',
        APPROVER_EMPCODE: 'S00001',
        STEP_STATUS: 'in_progress',
      }]
    }
    // Main workflow steps: in-progress Issue GPR C + pending Doc Check.
    if (query.includes('request_approval_step ras')) {
      return [
        { REQUEST_APPROVAL_STEP_ID: 201, REQUEST_REGISTER_VENDOR_ID: 101, STEP_ORDER: 4, STEP_STATUS: 'in_progress', DESCRIPTION: 'Issue GPR C', STEP_CODE: 'ISSUE_GPR_C', APPROVER_EMPCODE: 'S00001' },
        { REQUEST_APPROVAL_STEP_ID: 202, REQUEST_REGISTER_VENDOR_ID: 101, STEP_ORDER: 5, STEP_STATUS: 'pending', DESCRIPTION: 'PO & SCM Check All Document', STEP_CODE: 'DOC_CHECK', APPROVER_EMPCODE: 'S00002' },
      ]
    }
    if (query.includes('VENDOR_CODE_SELECTOR') || query.includes('GPR_43_ACCEPTANCE_STATUS')) {
      return [{ VENDORS_ID: 55, ASSIGN_TO: 'S00007', VENDOR_REGION: 'Local', REQUEST_NUMBER: 'Selection-26-N101' }]
    }
    return []
  }) as any

  mock.module('@businessData/dbExecute', () => ({
    MySQLExecute: {
      search,
      executeList: mock(async () => []),
      execute: mock(async () => ({ insertId: 1 })),
      searchList: mock(async () => []),
    },
  }))

  // Export the full superset so this mock never breaks ApprovalQueueService's import when bun's
  // global mock.module registry is shared across test files.
  mock.module('../_request-register/RegisterRequestNotificationHelper', () => ({
    sendMail_ToApprover_NextStep: spies.nextStep,
    sendMail_ToPic_RequestRejected: spies.rejected,
    sendMail_ToUser_ActionRequired: mock(async () => undefined),
    sendMail_ToRequester_GprCApproved: mock(async () => undefined),
    sendMail_ToRequester_RegistrationCompleted: mock(async () => undefined),
    sendMail_ToRequester_RegistrationIncomplete: mock(async () => undefined),
    sendMail_NegotiationStageDispatch: mock(async () => undefined),
  }))

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
