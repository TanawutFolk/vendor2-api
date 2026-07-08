import { describe, expect, mock, test } from 'bun:test'

// Verifies the email-notification wiring of the shared approval workflow
// (request-register / md-approval / poGm-approval / poMgr-approval / check-document all funnel here).
// DB + mail transport are mocked, so no real query runs and no real email is sent — we only assert
// that every Approve and Reject queues the correct notification.
//
// Mocks + import happen inside each test (matching GprCApprovalService.test.ts) so bun's global
// mock.module registry can't leak a partial helper mock in from another test file.

const approverStep = {
  REQUEST_APPROVAL_STEP_ID: 10,
  REQUEST_REGISTER_VENDOR_ID: 101,
  STEP_ORDER: 3,
  STEP_STATUS: 'in_progress',
  STEP_CODE: 'MD_APPROVAL',
  ACTOR_TYPE: 'APPROVER',
  APPROVER_EMPCODE: 'S00001',
  DESCRIPTION: 'MD Approve',
}

const nextApproverStep = {
  REQUEST_APPROVAL_STEP_ID: 11,
  REQUEST_REGISTER_VENDOR_ID: 101,
  STEP_ORDER: 4,
  STEP_STATUS: 'pending',
  STEP_CODE: 'PO_MGR_APPROVAL',
  ACTOR_TYPE: 'APPROVER',
  APPROVER_EMPCODE: 'S00002',
  GROUP_CODE: 'PO_MGR',
  DESCRIPTION: 'PO Mgr Approve',
}

const requestContext = {
  VENDORS_ID: 55,
  ASSIGN_TO: 'S00007',
  VENDOR_REGION: 'Local',
  REQUEST_NUMBER: 'Selection-26-N101',
  VENDOR_CODE_SELECTOR: '',
}

// Post-commit mail tasks are fire-and-forget (void runPostCommitTasks). Give them a tick to run.
const flushPostCommit = () => new Promise((resolve) => setTimeout(resolve, 30))

async function setup(steps: any[], context: any, requester = 'S00009') {
  const spies = {
    nextStep: mock(async () => undefined),
    actionRequired: mock(async () => undefined),
    gprCApproved: mock(async () => undefined),
    completed: mock(async () => undefined),
    rejected: mock(async () => undefined),
    incomplete: mock(async () => undefined),
    negotiation: mock(async () => undefined),
  }

  const search = mock(async (query: string) => {
    if (query.includes('request_approval_step ras')) return steps
    if (query.includes('REQUEST_BY_EMPLOYEECODE') && query.includes('request_register_vendor')) {
      return [{ REQUEST_BY_EMPLOYEECODE: requester }]
    }
    if (query.includes('VENDOR_CODE_SELECTOR') || query.includes('GPR_43_ACCEPTANCE_STATUS')) {
      return [context]
    }
    // resolveStepApprover -> isActiveAssigneeInGroup (only assignees_to query reached inside the service)
    if (query.includes('assignees_to')) {
      return [{ EMPCODE: 'S00002', EMPEMAIL: 'next.approver@example.com', GROUP_CODE: 'PO_MGR', INUSE: 1 }]
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

  // Full superset of the helper exports ApprovalQueueService imports, so the import never fails.
  mock.module('../_request-register/RegisterRequestNotificationHelper', () => ({
    sendMail_ToApprover_NextStep: spies.nextStep,
    sendMail_ToUser_ActionRequired: spies.actionRequired,
    sendMail_ToRequester_GprCApproved: spies.gprCApproved,
    sendMail_ToRequester_RegistrationCompleted: spies.completed,
    sendMail_ToPic_RequestRejected: spies.rejected,
    sendMail_ToRequester_RegistrationIncomplete: spies.incomplete,
    sendMail_NegotiationStageDispatch: spies.negotiation,
  }))

  mock.module('@src/config/sendEmail', () => ({ default: mock(async () => ({ success: true })) }))

  const { ApprovalQueueService } = await import('./ApprovalQueueService')
  return { ApprovalQueueService, spies }
}

describe('ApprovalQueueService.updateStatus email notifications', () => {
  test('REJECT queues a rejection email to the PIC', async () => {
    const { ApprovalQueueService, spies } = await setup([approverStep], requestContext)

    const result = await ApprovalQueueService.updateStatus({
      REQUEST_REGISTER_VENDOR_ID: 101,
      REQUEST_STATUS: 'Rejected',
      WORKFLOW_ACTION: 'REJECT',
      APPROVE_BY: 'S00001',
      UPDATE_BY: 'S00001',
      APPROVER_REMARK: 'Documents incomplete',
    } as any)

    expect(result.Status).toBe(true)
    await flushPostCommit()

    expect(spies.rejected).toHaveBeenCalledTimes(1)
    expect(spies.nextStep).not.toHaveBeenCalled()
  })

  test('APPROVE queues a next-step approval email', async () => {
    const { ApprovalQueueService, spies } = await setup([approverStep, nextApproverStep], requestContext)

    const result = await ApprovalQueueService.updateStatus({
      REQUEST_REGISTER_VENDOR_ID: 101,
      REQUEST_STATUS: 'PO Mgr Approve',
      APPROVE_BY: 'S00001',
      UPDATE_BY: 'S00001',
    } as any)

    expect(result.Status).toBe(true)
    await flushPostCommit()

    expect(spies.nextStep).toHaveBeenCalledTimes(1)
    expect(spies.rejected).not.toHaveBeenCalled()
  })

  test('final-step APPROVE queues the registration-completed email to the requester', async () => {
    // No pending step after the current one -> workflow completes -> requester completion email.
    const { ApprovalQueueService, spies } = await setup([approverStep], requestContext)

    const result = await ApprovalQueueService.updateStatus({
      REQUEST_REGISTER_VENDOR_ID: 101,
      REQUEST_STATUS: 'Completed',
      APPROVE_BY: 'S00001',
      UPDATE_BY: 'S00001',
    } as any)

    expect(result.Status).toBe(true)
    await flushPostCommit()

    expect(spies.completed).toHaveBeenCalledTimes(1)
    expect(spies.rejected).not.toHaveBeenCalled()
  })
})
